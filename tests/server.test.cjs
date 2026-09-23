const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { setTimeout: sleep } = require('node:timers/promises');
const root = path.resolve(__dirname, '..');
async function port() { const s = net.createServer(); s.listen(0, '127.0.0.1'); await once(s, 'listening'); const n = s.address().port; await new Promise(r => s.close(r)); return n; }
async function main() {
  let mode = 'valid', requests = 0;
  const provider = http.createServer(async (req, res) => {
    requests++;
    let text = ''; for await (const chunk of req) text += chunk;
    const input = JSON.parse(text);
    assert.equal(req.url, '/v1/responses');
    assert.equal(input.text.format.strict, true);
    const data = JSON.parse(input.input);
    let result = input.text.format.name === 'dependent_task'
      ? { title: 'Зависимая задача', goal: 'Цель', input_data: 'Тестовые данные', expected_artifact: 'Прототип', acceptance_criteria: '1. Проверка', constraints: 'Только исходные факты' }
      : { missingFields: data.missingFields, questions: data.missingFields.map(field => ({ field, text: 'Что нужно уточнить?' })), suggestions: [] };
    if (mode === 'wrong-schema') result = { unexpected: true };
    if (mode === 'wrong-fields') result.questions[1].field = result.questions[0].field;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: mode === 'bad-json' ? 'not json' : JSON.stringify(result) }] }] }));
  });
  provider.listen(0, '127.0.0.1'); await once(provider, 'listening');
  try {
    for (const [command, args] of [[process.env.PYTHON || 'python3', ['-B', 'server.py']], [process.execPath, ['server.js']]]) {
      const n = await port();
      const child = spawn(command, args, { cwd: root, env: { ...process.env, PORT: String(n), LLM_API_KEY: 'test-only', OPENAI_API_KEY: '', CODEX_API_KEY: '', LLM_PROVIDER: 'openai', LLM_BASE_URL: `http://127.0.0.1:${provider.address().port}/v1` }, stdio: 'ignore' });
      let spawnError; child.on('error', error => { spawnError = error; });
      const base = `http://127.0.0.1:${n}`;
      try {
        let ready = false;
        for (let i = 0; i < 100; i++) {
          if (spawnError) throw spawnError;
          try { ready = (await fetch(base + '/api/llm/status')).ok; } catch {}
          if (ready) break;
          await sleep(50);
        }
        assert.ok(ready, 'Test server did not start');
        for (const asset of ['/', '/index.html', '/app.js', '/styles.css', '/demo.html']) assert.equal((await fetch(base + asset)).status, 200, asset);
        for (const secret of ['/.env', '/%2eenv', '/.env?download=1', '/server.py', '/server.js', '/.git/config', '/%2e%2e/.env', '/tests/app.test.cjs']) {
          const r = await fetch(base + secret);
          assert.ok([400, 403, 404].includes(r.status), `Private file exposed: ${secret}`);
        }
        const preflight = await fetch(base + '/api/llm/clarify', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5500' } });
        assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:5500');
        const post = (route, body) => fetch(base + '/api/llm/' + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const dep = { parent_task_title: 'Тест', parent_task_description: { data: 'Тестовые данные' }, role: 'Исследователь', focus: 'Исследовать запись' };
        mode = 'valid';
        const success = await post('decompose', dep);
        assert.equal(success.status, 200); assert.equal(Object.keys(await success.json()).length, 6);
        assert.equal((await post('clarify', { missingFields: ['data', 'users', 'constraints'] })).status, 200);
        mode = 'wrong-schema'; assert.equal((await post('decompose', dep)).status, 502);
        mode = 'bad-json'; assert.equal((await post('decompose', dep)).status, 502);
        mode = 'wrong-fields'; assert.equal((await post('clarify', { missingFields: ['data', 'users'] })).status, 502);
        assert.equal((await post('decompose', [])).status, 400);
        assert.equal((await post('decompose', {})).status, 400);
        console.log(`PASS ${args.at(-1)}: public files, secret protection, CORS, valid LLM output, invalid JSON/schema/fields`);
      } finally {
        if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
      }
    }
    assert.equal(requests, 10, 'Only explicit test requests should reach provider');
  } finally { await new Promise(r => provider.close(r)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
