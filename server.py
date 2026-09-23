import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent


def load_dotenv():
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv()
PORT = int(os.environ.get("PORT", "8000"))
PROVIDER = os.environ.get("LLM_PROVIDER", "openai").lower()
API_KEY = os.environ.get("LLM_API_KEY") or (
    os.environ.get("CODEX_API_KEY") if PROVIDER == "codex" else os.environ.get("OPENAI_API_KEY")
)
MODEL = os.environ.get("LLM_MODEL", "gpt-5")
BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
MAX_BODY_BYTES = 120_000

DEPENDENT_KEYS = ["title", "goal", "input_data", "expected_artifact", "acceptance_criteria", "constraints"]


class ApiError(Exception):
    def __init__(self, message, status=500, code="LLM_ERROR"):
        super().__init__(message)
        self.status = status
        self.code = code


def clean(value):
    return value.strip() if isinstance(value, str) else ""


def validate_dependent(value):
    return (
        isinstance(value, dict)
        and set(value) == set(DEPENDENT_KEYS)
        and all(isinstance(value[key], str) and value[key].strip() for key in DEPENDENT_KEYS)
    )


def validate_clarify(value):
    return (
        isinstance(value, dict)
        and set(value) == {"missingFields", "questions", "suggestions"}
        and isinstance(value["missingFields"], list)
        and isinstance(value["questions"], list)
        and isinstance(value["suggestions"], list)
        and all(isinstance(item, dict) and set(item) == {"field", "text"} and clean(item.get("field")) and clean(item.get("text")) for item in value["questions"])
        and all(isinstance(item, str) for item in value["suggestions"])
    )


def validate_clarify_for_fields(value, expected_fields):
    if not validate_clarify(value):
        return False
    actual_fields = value["missingFields"]
    question_fields = [item["field"] for item in value["questions"]]
    return (
        actual_fields == expected_fields
        and len(question_fields) == len(expected_fields)
        and set(question_fields) == set(expected_fields)
        and not value["suggestions"]
    )


def extract_json(response):
    if isinstance(response.get("output_text"), str) and response["output_text"].strip():
        return response["output_text"]
    chunks = []
    for item in response.get("output", []):
        for content in item.get("content", []):
            if isinstance(content.get("text"), str):
                chunks.append(content["text"])
    return "".join(chunks).strip()


def call_model(instructions, input_data, schema_name, schema, validator):
    if not API_KEY:
        raise ApiError("LLM API key is not configured", 503, "LLM_NOT_CONFIGURED")
    request_body = {
        "model": MODEL,
        "store": False,
        "instructions": instructions,
        "input": json.dumps(input_data, ensure_ascii=False),
        "text": {"format": {"type": "json_schema", "name": schema_name, "strict": True, "schema": schema}},
    }
    request = Request(
        f"{BASE_URL}/responses",
        data=json.dumps(request_body, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            details = json.loads(error.read().decode("utf-8"))
            message = details.get("error", {}).get("message", f"LLM request failed ({error.code})")
        except Exception:
            message = f"LLM request failed ({error.code})"
        raise ApiError(message, 502)
    except (URLError, TimeoutError) as error:
        raise ApiError(f"LLM connection failed: {error}", 502)
    try:
        value = json.loads(extract_json(payload))
    except (json.JSONDecodeError, TypeError):
        raise ApiError("LLM returned invalid JSON", 502)
    if not validator(value):
        raise ApiError("LLM returned JSON outside the required schema", 502)
    return value


GUARDRAIL = (
    "Ты — AI-агент декомпозиции задач. Используй только факты из входных данных. "
    "Не выдумывай сроки, технологии, системы, пользователей, метрики, материалы или ограничения. "
    "Если факта нет, явно укажи, что его нужно уточнить. Отвечай только JSON по заданной схеме, без markdown и пояснений."
)


def handle_llm(route, body):
    if route == "/api/llm/decompose":
        parent = body.get("parentTask") if isinstance(body.get("parentTask"), dict) else {
            "title": clean(body.get("parent_task_title")),
            "description": body.get("parent_task_description", ""),
        }
        role = clean(body.get("role"))
        focus = clean(body.get("focus"))
        if not role or not focus:
            raise ApiError("role and focus are required", 400)
        return call_model(
            f"{GUARDRAIL}\n\nСоздай одну зависимую подзадачу для конкретного исполнителя. Роль и фокус используй только для формулировки названия и цели. Верни строго поля: title, goal, input_data, expected_artifact, acceptance_criteria, constraints. Поле acceptance_criteria должно содержать не более трёх нумерованных ключевых проверок. Поле constraints должно включать только ограничения из родительской задачи и необходимость согласования отсутствующих деталей.",
            {"parent_task_title": clean(body.get("parent_task_title")) or clean(parent.get("title")), "parent_task_description": body.get("parent_task_description", parent), "role": role, "focus": focus},
            "dependent_task",
            {"type": "object", "additionalProperties": False, "required": DEPENDENT_KEYS, "properties": {key: {"type": "string"} for key in DEPENDENT_KEYS}},
            validate_dependent,
        )
    if route == "/api/llm/clarify":
        missing = body.get("missingFields", []) if isinstance(body.get("missingFields"), list) else []
        allowed = {"contextNeed", "data", "expectedResult", "successCriteria", "constraints", "users", "businessLink"}
        result = call_model(
            f"{GUARDRAIL}\n\nПроанализируй карточку бизнес-задачи. Верни missingFields в точности как во входных данных, без добавления и удаления полей. Задай ровно по одному короткому конкретному вопросу для каждого поля missingFields. В questions используй каждое поле ровно один раз. Не предлагай значения и не добавляй факты. suggestions всегда возвращай пустым массивом.",
            {"card": body.get("card", {}), "draft": clean(body.get("draft")), "missingFields": [item for item in missing if item in allowed]},
            "clarification_questions",
            {"type": "object", "additionalProperties": False, "required": ["missingFields", "questions", "suggestions"], "properties": {"missingFields": {"type": "array", "items": {"type": "string"}}, "questions": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["field", "text"], "properties": {"field": {"type": "string"}, "text": {"type": "string"}}}}, "suggestions": {"type": "array", "items": {"type": "string"}}}},
            validate_clarify,
        )
        if not validate_clarify_for_fields(result, [item for item in missing if item in allowed]):
            raise ApiError("LLM clarification response does not match missing card fields", 502)
        return result
    raise ApiError("Unknown LLM route", 404)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format_string, *args):
        print(f"{self.address_string()} - {format_string % args}")

    def cors_origin(self):
        origin = self.headers.get("Origin", "")
        if origin == "null" or origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:"):
            return origin
        return ""

    def send_json(self, status, value):
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        if self.cors_origin():
            self.send_header("Access-Control-Allow-Origin", self.cors_origin())
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Allow", "GET,POST,OPTIONS")
        if self.cors_origin():
            self.send_header("Access-Control-Allow-Origin", self.cors_origin())
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/llm/status":
            return self.send_json(200, {"configured": bool(API_KEY), "provider": PROVIDER, "model": MODEL})
        requested = "/index.html" if path == "/" else path
        file = (ROOT / requested.lstrip("/")).resolve()
        if ROOT not in file.parents and file != ROOT:
            return self.send_json(403, {"error": "Forbidden"})
        if not file.is_file():
            return self.send_json(404, {"error": "Not found"})
        data = file.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(str(file))[0] or "application/octet-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path not in ("/api/llm/decompose", "/api/llm/clarify"):
            return self.send_json(404, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > MAX_BODY_BYTES:
                raise ApiError("Request is too large", 413)
            body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            return self.send_json(200, handle_llm(self.path, body))
        except json.JSONDecodeError:
            return self.send_json(400, {"error": "Invalid JSON body"})
        except ApiError as error:
            return self.send_json(error.status, {"error": str(error), "code": error.code})
        except Exception as error:
            return self.send_json(500, {"error": str(error), "code": "LLM_ERROR"})


if __name__ == "__main__":
    print(f"AI Sana server: http://localhost:{PORT} · LLM {'configured' if API_KEY else 'local fallback'}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
