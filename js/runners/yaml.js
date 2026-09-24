// A small YAML parser (the subset used by real-world service and CI configs):
// nested maps by indentation, "- " lists (including lists of maps), inline
// [a, b] lists, quoted strings, numbers, booleans, null and # comments.
// Config tasks parse your YAML and run checks against the resulting object.
(function (root) {
  function scalar(raw) {
    const s = raw.trim();
    if (s === '') return null;
    if (/^(['"]).*\1$/.test(s)) return s.slice(1, -1);
    if (/^\[.*\]$/.test(s)) return s.slice(1, -1).split(',').map((x) => x.trim()).filter((x) => x !== '').map(scalar);
    if (/^(true|yes|on)$/i.test(s)) return true;
    if (/^(false|no|off)$/i.test(s)) return false;
    if (/^(null|~)$/i.test(s)) return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  }

  function stripComment(line) {
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
    }
    return line;
  }

  function parse(text) {
    const lines = [];
    String(text).split('\n').forEach((raw, n) => {
      if (/\t/.test(raw.match(/^\s*/)[0])) throw new Error(`line ${n + 1}: tabs are not allowed for indentation in YAML`);
      const line = stripComment(raw).replace(/\s+$/, '');
      if (line.trim() === '' || line.trim() === '---') return;
      lines.push({ indent: line.match(/^ */)[0].length, text: line.trim(), n: n + 1 });
    });
    let i = 0;

    function block(indent) {
      if (i >= lines.length) return null;
      if (lines[i].text.startsWith('- ') || lines[i].text === '-') return list(lines[i].indent);
      return map(lines[i].indent);
    }

    function map(indent) {
      const obj = {};
      while (i < lines.length && lines[i].indent === indent && !lines[i].text.startsWith('- ')) {
        const L = lines[i];
        const m = L.text.match(/^("[^"]*"|'[^']*'|[^:]+?):(\s+(.*))?$/);
        if (!m) throw new Error(`line ${L.n}: expected "key: value"`);
        const key = m[1].replace(/^['"]|['"]$/g, '').trim();
        i++;
        if (m[3] !== undefined && m[3] !== '') obj[key] = scalar(m[3]);
        else if (i < lines.length && lines[i].indent > indent) obj[key] = block(lines[i].indent);
        else if (i < lines.length && lines[i].indent === indent && lines[i].text.startsWith('- ')) obj[key] = list(indent);
        else obj[key] = null;
      }
      if (i < lines.length && lines[i].indent > indent) throw new Error(`line ${lines[i].n}: unexpected indentation`);
      return obj;
    }

    function list(indent) {
      const arr = [];
      while (i < lines.length && lines[i].indent === indent && (lines[i].text.startsWith('- ') || lines[i].text === '-')) {
        const L = lines[i];
        const rest = L.text === '-' ? '' : L.text.slice(2);
        if (rest === '') {
          i++;
          arr.push(i < lines.length && lines[i].indent > indent ? block(lines[i].indent) : null);
        } else if (/^[^'"[{][^:]*:(\s|$)/.test(rest)) {
          // "- key: value" starts a map whose other keys are indented under it
          const inner = indent + 2;
          lines[i] = { indent: inner, text: rest, n: L.n };
          arr.push(map(inner));
        } else {
          arr.push(scalar(rest));
          i++;
        }
      }
      return arr;
    }

    const out = lines.length ? block(lines[0].indent) : {};
    if (i < lines.length) throw new Error(`line ${lines[i].n}: could not parse (check indentation)`);
    return out;
  }

  // checks: [{ label, fn(obj, text) }]
  function grade(task, text) {
    let obj;
    try {
      obj = parse(text);
    } catch (e) {
      return { error: 'YAML error: ' + e.message, logs: [] };
    }
    const results = task.checks.map((c) => {
      let pass = false;
      try { pass = !!c.fn(obj || {}, text); } catch (e) { pass = false; }
      return { pass, got: pass ? 'ok' : 'not met', label: c.label, hidden: !!c.hidden };
    });
    return { results, logs: [], parsed: obj };
  }

  const api = { parse, grade, run: (task, text) => Promise.resolve(grade(task, text)), label: 'YAML' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.yaml = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
