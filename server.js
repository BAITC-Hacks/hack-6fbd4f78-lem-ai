const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8000);
const PROVIDER = String(process.env.LLM_PROVIDER || 'openai').toLowerCase();
const API_KEY = process.env.LLM_API_KEY || (PROVIDER === 'codex' ? process.env.CODEX_API_KEY : process.env.OPENAI_API_KEY);
const MODEL = process.env.LLM_MODEL || 'gpt-5';
const BASE_URL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const MAX_BODY_BYTES = 120000;

const DEPENDENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'goal', 'input_data', 'expected_artifact', 'acceptance_criteria', 'constraints'],
  properties: {
    title: { type: 'string' },
    goal: { type: 'string' },
    input_data: { type: 'string' },
    expected_artifact: { type: 'string' },
    acceptance_criteria: { type: 'string' },
    constraints: { type: 'string' }
  }
};

const CLARIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['missingFields', 'questions', 'suggestions'],
  properties: {
    missingFields: { type: 'array', items: { type: 'string' } },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['field', 'text'],
        properties: { field: { type: 'string' }, text: { type: 'string' } }
      }
    },
    suggestions: { type: 'array', items: { type: 'string' } }
  }
};

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(res.corsOrigin ? { 'Access-Control-Allow-Origin': res.corsOrigin } : {})
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      total += Buffer.byteLength(chunk);
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request is too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON body'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}

function text(value) { return typeof value === 'string' ? value.trim() : ''; }

function validateObject(value, schema) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const expected = schema.required;
  if (Object.keys(value).some(key => !expected.includes(key))) return false;
  if (expected.some(key => !text(value[key]) && key !== 'missingFields' && key !== 'questions' && key !== 'suggestions')) return false;
  if (schema === CLARIFY_SCHEMA) {
    return Array.isArray(value.missingFields) && Array.isArray(value.questions) && Array.isArray(value.suggestions) &&
      value.questions.every(item => item && text(item.field) && text(item.text)) &&
      value.suggestions.every(item => typeof item === 'string');
  }
  return expected.every(key => typeof value[key] === 'string' && value[key].trim());
}

function validateClarifyForFields(value, expectedFields) {
  if (!validateObject(value, CLARIFY_SCHEMA)) return false;
  const questionFields = value.questions.map(item => item.field);
  return JSON.stringify(value.missingFields) === JSON.stringify(expectedFields) && questionFields.length === expectedFields.length && new Set(questionFields).size === expectedFields.length && questionFields.every(field => expectedFields.includes(field)) && value.suggestions.length === 0;
}

function extractJson(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) return response.output_text;
  const parts = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('').trim();
}

async function callModel(instructions, input, schemaName, schema) {
  if (!API_KEY) throw Object.assign(new Error('LLM API key is not configured'), { statusCode: 503, code: 'LLM_NOT_CONFIGURED' });
  const response = await fetch(`${BASE_URL}/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      instructions,
      input: JSON.stringify(input),
      text: { format: { type: 'json_schema', name: schemaName, strict: true, schema } }
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload?.error?.message || `LLM request failed (${response.status})`), { statusCode: 502 });
  const raw = extractJson(payload);
  let value;
  try { value = JSON.parse(raw); } catch { throw Object.assign(new Error('LLM returned invalid JSON'), { statusCode: 502 }); }
  if (!validateObject(value, schema)) throw Object.assign(new Error('LLM returned JSON outside the required schema'), { statusCode: 502 });
  return value;
}

const guardrail = `Ты — AI-агент декомпозиции задач. Используй только факты из входных данных. Не выдумывай сроки, технологии, системы, пользователей, метрики, материалы или ограничения. Если факта нет, явно укажи, что его нужно уточнить. Отвечай только JSON по заданной схеме, без markdown и пояснений.`;

async function handleLLM(pathname, body) {
  if (pathname === '/api/llm/decompose') {
    const parentTask = body.parentTask && typeof body.parentTask === 'object' ? body.parentTask : {
      title: text(body.parent_task_title),
      description: body.parent_task_description && typeof body.parent_task_description === 'object' ? body.parent_task_description : text(body.parent_task_description)
    };
    const role = text(body.role);
    const focus = text(body.focus);
    if (!role || !focus) throw Object.assign(new Error('role and focus are required'), { statusCode: 400 });
    return callModel(
      `${guardrail}\n\nСоздай одну зависимую подзадачу для конкретного исполнителя. Роль и фокус используй только для формулировки названия и цели. Верни строго поля: title, goal, input_data, expected_artifact, acceptance_criteria, constraints. Поле acceptance_criteria должно содержать не более трёх нумерованных ключевых проверок. Поле constraints должно включать только ограничения из родительской задачи и необходимость согласования отсутствующих деталей.`,
      { parent_task_title: text(body.parent_task_title) || text(parentTask.title), parent_task_description: body.parent_task_description || parentTask, role, focus },
      'dependent_task',
      DEPENDENT_SCHEMA
    );
  }
  if (pathname === '/api/llm/clarify') {
    const allowed = ['contextNeed', 'data', 'expectedResult', 'successCriteria', 'constraints', 'users', 'businessLink'];
    const missingFields = Array.isArray(body.missingFields) ? body.missingFields.filter(item => allowed.includes(item)) : [];
    const card = body.card && typeof body.card === 'object' ? body.card : {};
    const draft = text(body.draft);
    const result = await callModel(
      `${guardrail}\n\nПроанализируй карточку бизнес-задачи. Верни missingFields в точности как во входных данных, без добавления и удаления полей. Задай ровно по одному короткому конкретному вопросу для каждого поля missingFields. В questions используй каждое поле ровно один раз. Не предлагай значения и не добавляй факты. suggestions всегда возвращай пустым массивом.`,
      { card, draft, missingFields },
      'clarification_questions',
      CLARIFY_SCHEMA
    );
    if (!validateClarifyForFields(result, missingFields)) throw Object.assign(new Error('LLM clarification response does not match missing card fields'), { statusCode: 502 });
    return result;
  }
  throw Object.assign(new Error('Unknown LLM route'), { statusCode: 404 });
}

function contentType(file) {
  return { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' }[path.extname(file)] || 'application/octet-stream';
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(ROOT, `.${requested}`);
  if (!file.startsWith(`${ROOT}${path.sep}`) && file !== ROOT) return sendJson(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (error, data) => {
    if (error) return sendJson(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  const origin = req.headers.origin || '';
  const corsOrigin = origin === 'null' || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ? origin : '';
  if (req.method === 'OPTIONS') { res.writeHead(204, { Allow: 'GET,POST,OPTIONS', ...(corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin } : {}), 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); return res.end(); }
  res.corsOrigin = corsOrigin;
  if (req.method === 'GET' && pathname === '/api/llm/status') {
    return sendJson(res, 200, { configured: Boolean(API_KEY), provider: PROVIDER, model: MODEL });
  }
  if (req.method === 'POST' && (pathname === '/api/llm/decompose' || pathname === '/api/llm/clarify')) {
    try { return sendJson(res, 200, await handleLLM(pathname, await readBody(req))); }
    catch (error) { return sendJson(res, error.statusCode || 500, { error: error.message, code: error.code || 'LLM_ERROR' }); }
  }
  if (req.method === 'GET') return serveStatic(req, res);
  return sendJson(res, 405, { error: 'Method not allowed' });
});

server.listen(PORT, '127.0.0.1', () => console.log(`AI Sana server: http://localhost:${PORT} · LLM ${API_KEY ? 'configured' : 'local fallback'}`));
