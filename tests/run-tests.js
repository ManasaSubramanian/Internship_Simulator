// Sanity checks for game content: run with `node tests/run-tests.js`.
//  * every coding task's reference solution passes all visible + hidden tests
//  * the starter code does NOT pass everything (so the task is a real task)
//  * written/presentation/review graders reward good work over empty work
globalThis.window = globalThis;
require('../js/util.js');
require('../js/data/tasks.js');
require('../js/grading.js');
const runner = require('../js/coderunner.js');
const solutions = require('./solutions.js');

let failures = 0;
function check(cond, msg) {
  if (!cond) {
    failures++;
    console.log('  ✗ ' + msg);
  }
}

const coding = IS.tasks.filter((t) => t.type === 'coding');
console.log('Coding tasks: ' + coding.length);
for (const task of coding) {
  const all = task.tests.concat(task.hidden);
  const sol = solutions[task.id];
  check(sol, task.id + ' has a reference solution');
  if (!sol) continue;
  const res = runner.runCore({ code: sol, fnName: task.fnName, tests: all });
  check(!res.error, task.id + ' solution runs: ' + res.error);
  if (res.results) {
    res.results.forEach((r, i) => check(r.pass, task.id + ' solution test #' + i + ' got ' + r.got + ' expected ' + JSON.stringify(all[i].expected)));
  }
  const starter = runner.runCore({ code: task.starter, fnName: task.fnName, tests: all });
  check(starter.error || starter.results.some((r) => !r.pass), task.id + ' starter should fail at least one test');

  const graded = IS.grading.coding(task, '// approach: reference\n' + sol, res);
  check(graded.score === 100, task.id + ' reference solution should score 100, got ' + graded.score);
}

const infinite = runner.runCore({ code: 'function f(){ return 1 }', fnName: 'g', tests: [] });
check(infinite.error && infinite.error.includes('Could not find'), 'missing function is reported');

// Written: a thorough answer should beat an empty one.
for (const task of IS.tasks.filter((t) => t.type === 'written')) {
  const good = task.rubric.sections.map((s) => '## ' + s.keys[0] + '\n' + s.keys.join(' ') + ' ').join('\n') +
    ' ' + (task.rubric.terms || []).map((t) => t.split('|')[0]).join(' ') +
    ' ' + Array.from({ length: task.rubric.minWords }, (_, i) => 'word' + i).join(' ');
  const g = IS.grading.written(task, good);
  const e = IS.grading.written(task, '');
  check(g.score >= 90, task.id + ' thorough answer should score >= 90, got ' + g.score + ' ' + JSON.stringify(g.breakdown));
  check(e.score <= 15, task.id + ' empty answer should score <= 15, got ' + e.score);
}

// Quizzes: perfect answers score 100.
for (const task of IS.tasks.filter((t) => t.type === 'quiz')) {
  check(IS.grading.quiz(task, task.questions.map((q) => q.answer)).score === 100, task.id + ' perfect quiz = 100');
}

// Reviews: all real issues + good comment = 100; picking everything is worse.
for (const task of IS.tasks.filter((t) => t.type === 'review')) {
  const real = task.issues.map((x, i) => (x.real ? i : -1)).filter((i) => i >= 0);
  const comment = 'Nice work! I would suggest we consider fixing these: ' + task.keywords.join(', ') + '. Thanks for putting this together.';
  const best = IS.grading.review(task, real, comment);
  const spray = IS.grading.review(task, task.issues.map((_, i) => i), comment);
  check(best.score === 100, task.id + ' perfect review = 100, got ' + best.score);
  check(spray.score < best.score, task.id + ' selecting everything should score lower');
}

// Presentations: a well-built deck with best answers scores 100.
for (const task of IS.tasks.filter((t) => t.type === 'presentation')) {
  const req = task.required.map((r) => (Array.isArray(r) ? r[0] : r));
  const types = ['title'].concat(req.filter((t) => t !== 'title' && t !== 'next'), ['next']);
  const text = 'This slide covers ' + task.terms.map((t) => t.split('|')[0]).join(' and ') + ' for our guests clearly.';
  const deck = types.map((type) => ({ type, text }));
  while (deck.length < task.slideRange[0]) deck.splice(1, 0, { type: 'team', text });
  const answers = task.questions.map((q) => Math.max(...q.options.map((o) => o.pts)));
  const g = IS.grading.presentation(task, deck, { opening: 10, mid: 10, answers }, {});
  check(g.score === 100, task.id + ' ideal presentation = 100, got ' + g.score + ' ' + JSON.stringify(g.breakdown));
}

// Schedule sanity: due after assigned, all ids unique.
const ids = new Set();
for (const t of IS.tasks) {
  check(!ids.has(t.id), 'duplicate id ' + t.id);
  ids.add(t.id);
  check(t.due.day >= t.day, t.id + ' due before assigned');
  check(t.due.day <= 29, t.id + ' due after last work day');
}

if (failures) {
  console.log('\n' + failures + ' check(s) failed');
  process.exit(1);
}
console.log('All content checks passed ✔');
