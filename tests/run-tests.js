// Content checks for all internship tracks: `npm test` (after `npm install`).
//  * every technical task and interview problem: the reference solution passes
//    all visible + hidden checks (and scores 100), the starter does not
//  * written/quiz/review/presentation rubrics reward good work over empty work
//  * schedules, ids, characters and interview data are consistent
// Runs Python with Pyodide, C++ with the bundled JSCPP, SQL with sql.js and web
// pages with jsdom: the same engines the game uses in the browser.
const fs = require('fs');
const path = require('path');
globalThis.window = globalThis;
const ROOT = path.join(__dirname, '..');
const req = (p) => require(path.join(ROOT, p));

['js/util.js', 'js/data/characters.js', 'js/data/interview.js', 'js/tracks.js'].forEach(req);
const trackFiles = fs.readdirSync(path.join(ROOT, 'js/data/tracks')).filter((f) => /^t\d\d-[a-z]+\.js$/.test(f)).sort();
trackFiles.forEach((f) => req('js/data/tracks/' + f));
fs.readdirSync(path.join(ROOT, 'js/data/tracks')).filter((f) => f.endsWith('.expected.js')).forEach((f) => req('js/data/tracks/' + f));
fs.readdirSync(path.join(ROOT, 'js/data/learn')).filter((f) => f.endsWith('.js')).forEach((f) => req('js/data/learn/' + f));
req('js/grading.js');
const jsRun = req('js/runners/javascript.js');
const pyRun = req('js/runners/python.js');
const cppRun = req('js/runners/cpp.js');
const sqlRun = req('js/runners/sql.js');
const shell = req('js/runners/shell.js');
const web = req('js/runners/web.js');
const yaml = req('js/runners/yaml.js');
IS.runners = { javascript: jsRun };

let failures = 0;
let checks = 0;
function check(cond, msg) {
  checks++;
  if (!cond) {
    failures++;
    console.log('  ✗ ' + msg);
  }
}

let py = null;
let JSCPP = null;
let SQL = null;
let JSDOM = null;

async function engines() {
  try { py = await require('pyodide').loadPyodide(); } catch (e) { console.log('  (skipping Python: ' + e.message + ')'); }
  req('vendor/jscpp.js');
  JSCPP = window.IS_JSCPP_FACTORY();
  try { SQL = await require('sql.js')(); } catch (e) { console.log('  (skipping SQL: ' + e.message + ')'); }
  try { JSDOM = require('jsdom').JSDOM; } catch (e) { console.log('  (skipping web: ' + e.message + ')'); }
}

function runPython(code, fnName, tests) {
  py.globals.set('__code', code);
  py.globals.set('__fn', fnName);
  py.globals.set('__tests', JSON.stringify(tests));
  return pyRun.finish(JSON.parse(py.runPython(pyRun.HARNESS)), tests);
}

async function runWeb(p, html, which) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new (require('jsdom').VirtualConsole)() });
  await new Promise((r) => setTimeout(r, 20));
  const list = which === 'visible' ? p.checks.filter((c) => !c.hidden) : p.checks;
  const results = await web.runChecks(list, dom.window.document, dom.window);
  dom.window.close();
  return { results, logs: [] };
}

// Returns { results, error } or null when the engine is unavailable.
async function run(track, p, code) {
  const kind = p.type || 'coding';
  const lang = p.lang || track.lang;
  if (kind === 'coding') {
    const tests = p.tests.concat(p.hidden || []);
    if (lang === 'javascript') return jsRun.runCore({ code, fnName: p.fnName, tests });
    if (lang === 'python') return py ? runPython(code, p.fnName, tests) : null;
    if (lang === 'cpp') return cppRun.runCore(JSCPP, { code, tests });
  }
  if (kind === 'sql') {
    if (!SQL) return null;
    const exp = IS.sqlExpected && IS.sqlExpected[track.id] && IS.sqlExpected[track.id][p.id];
    if (!exp) return { error: 'no expected results generated (run npm run gen:sql)' };
    return sqlRun.grade(SQL, p.db || track.db, p, code, exp);
  }
  if (kind === 'web') return JSDOM ? runWeb(p, code, 'all') : null;
  if (kind === 'config') return yaml.grade(p, code);
  if (kind === 'terminal') {
    const sh = shell.create(p.fs);
    (code || []).forEach((c) => sh.exec(c));
    return shell.grade(p, sh);
  }
  return { error: 'unknown kind ' + kind };
}

const COMMENT = { javascript: '// approach: reference solution\n', cpp: '// approach: reference solution\n', python: '# approach: reference solution\n', sql: '-- approach: reference solution\n', yaml: '# approach: reference solution\n' };

async function checkTechnical(track, p, sols, label) {
  const kind = p.type || 'coding';
  const sol = sols[p.id];
  check(sol !== undefined, `${label} has a reference solution`);
  if (sol === undefined) return;
  const res = await run(track, p, sol);
  if (!res) return;
  check(!res.error, `${label} solution runs: ${res.error}`);
  if (res.results) res.results.forEach((r, i) => check(r.pass, `${label} solution check #${i}${r.label ? ' "' + r.label + '"' : ''} got ${r.got}`));
  if (kind === 'terminal') {
    const fresh = shell.create(p.fs);
    check(!p.objectives.every((o) => { try { return o.check(fresh); } catch (e) { return false; } }), `${label} objectives should not start completed`);
    return;
  }
  const start = await run(track, p, p.starter || '');
  check(start && (start.error || start.results.some((r) => !r.pass)), `${label} starter should fail at least one check`);
  if (p.fnName !== undefined || kind !== 'coding') {
    const lang = kind === 'sql' ? 'sql' : kind === 'config' ? 'yaml' : kind === 'web' ? 'web' : p.lang || track.lang;
    const code = kind === 'web' ? sol : (COMMENT[lang] || '') + sol;
    const graded = IS.grading.coding(Object.assign({ lang }, p), code, await run(track, p, code));
    check(graded.score === 100, `${label} reference should score 100, got ${graded.score}: ${JSON.stringify(graded.breakdown.filter((b) => b.earned < b.max))}`);
  }
}

// Learning Center: every topic explains in words, shows code (technical
// subjects), and has 1-3 practice problems whose solutions pass and starters fail.
async function checkLearn(trackId, track) {
  const topics = (IS.learnData || {})[trackId] || [];
  check(topics.length >= 4, `learn/${trackId} has at least 4 topics (has ${topics.length})`);
  const ids = new Set();
  for (const t of topics) {
    const L = `learn/${trackId}/${t.id}`;
    check(t.title && t.summary && t.words && t.words.length > 300, `${L} has a title, summary and a real plain-words explanation`);
    check(!!t.example && t.example.code && t.example.steps && t.example.steps.length >= 3, `${L} has a worked example with 3+ steps`);
    if (t.example) {
      const n = t.example.code.replace(/\n$/, '').split('\n').length;
      t.example.steps.forEach((s, i) => (s.lines || []).forEach((ln) => check(ln >= 1 && ln <= n, `${L} step ${i} line ${ln} exists`)));
    }
    check(t.practice && t.practice.length >= 1 && t.practice.length <= 3, `${L} has 1-3 practice problems`);
    check(t.practice && t.practice.length === 3, `${L} has 3 practice problems`);
    for (const p of t.practice || []) {
      const P = `${L}/${p.id}`;
      check(!ids.has(p.id), P + ' unique id');
      ids.add(p.id);
      check(p.title && p.brief && p.hint && p.solution != null, P + ' has title, brief, hint and solution');
      if (p.type === 'choice') {
        check(p.answer >= 0 && p.answer < p.options.length && !!p.explain, P + ' choice answer valid and explained');
        continue;
      }
      const res = await run(track, p, p.solution);
      if (!res) continue;
      check(!res.error, `${P} solution runs: ${res.error}`);
      if (res.results) res.results.forEach((r, i) => check(r.pass, `${P} solution check #${i}${r.label ? ' "' + r.label + '"' : ''} got ${r.got}`));
      if (p.type === 'terminal') {
        const fresh = shell.create(p.fs);
        check(!p.objectives.every((o) => { try { return o.check(fresh); } catch (e) { return false; } }), `${P} objectives should not start completed`);
        continue;
      }
      const start = await run(track, p, p.starter || '');
      check(start && (start.error || start.results.some((r) => !r.pass)), `${P} starter should fail at least one check`);
    }
  }
}

function checkSoft(track, t) {
  const L = track.id + '/' + t.id;
  if (t.type === 'written') {
    const good = t.rubric.sections.map((s) => '## ' + s.keys[0] + '\n' + s.keys.join(' ') + ' ').join('\n') +
      ' ' + (t.rubric.terms || []).map((x) => x.split('|')[0]).join(' ') + ' ' + Array.from({ length: t.rubric.minWords }, (_, i) => 'word' + i).join(' ');
    check(IS.grading.written(t, good).score >= 90, `${L} thorough answer should score >= 90, got ${IS.grading.written(t, good).score}`);
    check(IS.grading.written(t, '').score <= 15, `${L} empty answer should score <= 15`);
  }
  if (t.type === 'quiz') {
    check(IS.grading.quiz(t, t.questions.map((q) => q.answer)).score === 100, `${L} perfect quiz = 100`);
    t.questions.forEach((q, i) => check(q.answer >= 0 && q.answer < q.options.length, `${L} Q${i} answer index valid`));
  }
  if (t.type === 'review') {
    const real = t.issues.map((x, i) => (x.real ? i : -1)).filter((i) => i >= 0);
    const comment = 'Nice work! I would suggest we consider fixing these: ' + t.keywords.join(', ') + '. Thanks for putting this together.';
    check(IS.grading.review(t, real, comment).score === 100, `${L} perfect review = 100`);
    check(IS.grading.review(t, t.issues.map((_, i) => i), comment).score < 100, `${L} selecting everything should score lower`);
  }
  if (t.type === 'presentation') {
    const req2 = t.required.map((r) => (Array.isArray(r) ? r[0] : r));
    const types = ['title'].concat(req2.filter((x) => x !== 'title' && x !== 'next'), ['next']);
    const text = 'This slide covers ' + t.terms.map((x) => x.split('|')[0]).join(' and ') + ' for our guests clearly.';
    const deck = types.map((type) => ({ type, text }));
    while (deck.length < t.slideRange[0]) deck.splice(1, 0, { type: 'team', text });
    const answers = t.questions.map((q) => Math.max(...q.options.map((o) => o.pts)));
    const g = IS.grading.presentation(t, deck, { opening: 10, mid: 10, answers }, {});
    check(g.score === 100, `${L} ideal presentation = 100, got ${g.score}`);
    t.questions.forEach((q) => check(!!IS.characters[q.who], `${L} question asker ${q.who} exists`));
    t.audience.forEach((a) => check(!!IS.characters[a], `${L} audience ${a} exists`));
  }
}

(async () => {
  await engines();
  console.log(`Tracks registered: ${IS.tracks.filter(Boolean).length}/10`);
  for (const track of IS.tracks.filter(Boolean)) {
    let sols = {};
    try { sols = require('./solutions/' + track.id + '.js'); } catch (e) { check(false, track.id + ' has a solutions file'); }
    const before = failures;
    const ids = new Set();
    [track.cast.manager, track.cast.mentor].concat(track.cast.interns).forEach((c) => check(!!IS.characters[c] && !!IS.characters[c].look, `${track.id} cast ${c} exists with a look`));
    check(track.cast.interns.length === 4, `${track.id} has 4 interns`);
    for (const t of track.tasks) {
      const L = track.id + '/' + t.id;
      check(!ids.has(t.id), L + ' duplicate id');
      ids.add(t.id);
      check(t.due.day >= t.day && t.due.day <= 33, L + ' due day in range');
      check(!!IS.characters[t.from], L + ' from exists: ' + t.from);
      check(t.peer && !!IS.characters[t.peer.who], L + ' peer exists');
      check(Array.isArray(t.hints) && t.hints.length > 0, L + ' has hints');
      if (['coding', 'sql', 'web', 'config', 'terminal'].includes(t.type)) await checkTechnical(track, t, sols, L);
      else checkSoft(track, t);
    }
    const tech = track.tasks.filter((t) => ['coding', 'sql', 'web', 'config', 'terminal'].includes(t.type)).length;
    check(tech >= 8, `${track.id} has at least 8 technical tasks (has ${tech})`);
    check(track.tasks.some((t) => t.urgent), track.id + ' has an incident task');
    check(track.tasks.some((t) => t.optional), track.id + ' has a stretch task');
    for (const p of track.interview.coding) await checkTechnical(track, p, sols, track.id + '/interview/' + p.id);
    check(track.interview.coding.length >= 3, track.id + ' has 3 interview problems');
    check(track.interview.concepts.length >= 6, track.id + ' has 6+ concept questions');
    track.interview.concepts.forEach((q, i) => check(q.answer >= 0 && q.answer < q.options.length, `${track.id} concept ${i} answer valid`));
    await checkLearn(track.id, track);
    console.log(`${failures === before ? '✔' : '✗'} ${track.n}. ${track.langLabel} (${track.tasks.length} tasks, ${tech} technical)`);
  }
  await checkLearn('career', null);
  // Written behavioral answer rubric
  check(IS.grading.written({ rubric: IS.behavioral.freeResponse.rubric }, '').score <= 15, 'behavioral free response: empty scores low');
  IS.behavioral.questions.forEach((q, i) => check(Math.max(...q.options.map((o) => o.pts)) === 10, `behavioral Q${i} has a best answer`));
  // Testing shortcut code
  check(IS.util.hasTestCode('my answer 3.14159265358979') && IS.util.hasTestCode(['ls', '3.14159265358979']) && !IS.util.hasTestCode('3.14159'), 'test pass code detection');
  // Shell + YAML basics
  const sh = shell.create({ files: { '/data/a.txt': 'x\ny\nx\n' } });
  check(sh.exec('sort /data/a.txt | uniq -c').out.includes('2 x'), 'shell pipes work');
  check(yaml.parse('a:\n  - 1\n  - b: 2\n').a[1].b === 2, 'yaml lists of maps parse');

  console.log(`\n${checks} checks, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})();
