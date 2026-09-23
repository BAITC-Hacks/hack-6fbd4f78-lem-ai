const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(x => x[1]);
const fields = [...html.matchAll(/data-field="([^"]+)"/g)].map(x => x[1]);
const dependentFields = [...html.matchAll(/data-dependent-field="([^"]+)"/g)].map(x => x[1]);

function boot(saved, fail = false, fetch) {
  const storage = { value: saved, getItem() { return this.value; }, setItem(k, v) { if (fail) throw Error('quota'); this.value = v; }, removeItem() { this.value = null; } };
  function element() {
    const listeners = {};
    return { value: '', checked: false, disabled: false, textContent: '', innerHTML: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, addEventListener(type, fn) { listeners[type] = fn; }, emit(type) { return listeners[type]?.(); }, querySelectorAll(q) { if (q !== "[data-question-field]") return []; this.answers = [...this.innerHTML.matchAll(/data-question-field="([^"]+)"/g)].map(x => Object.assign(element(), { dataset: { questionField: x[1] } })); return this.answers; }, querySelector() { return this.note ||= element(); } };
  }
  const elements = Object.fromEntries(ids.map(id => [id, element()]));
  const inputs = fields.map(field => Object.assign(element(), { dataset: { field } }));
  const dependentInputs = dependentFields.map(dependentField => Object.assign(element(), { dataset: { dependentField } }));
  const document = {
    getElementById(id) { assert.ok(elements[id], 'Missing DOM id: ' + id); return elements[id]; },
    querySelectorAll(q) { return q === '[data-field]' ? inputs : q === '[data-dependent-field]' ? dependentInputs : []; },
    querySelector(q) { return inputs.find(el => q === `[data-field="${el.dataset.field}"]`) || null; },
  };
  const context = vm.createContext({ document, localStorage: storage, URL, AbortController, setTimeout: (fn, ms) => ms === 100000 ? setTimeout(fn, ms) : undefined, clearTimeout, ...(fetch ? { fetch } : {}), window: { location: { protocol: 'http:', origin: 'http://127.0.0.1:8000' } } });
  vm.runInContext(source, context);
  return { run: s => vm.runInContext(s, context), elements, inputs, dependentInputs, storage };
}
module.exports = { boot };
