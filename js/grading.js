// Grading rubrics for every assignment type. Each grader returns
//   { score (0-100), breakdown: [{label, earned, max, note}], notes: [string] }
// Late penalties are applied afterwards by the engine.
IS.grading = (function () {
  const U = IS.util;

  const SLANG = ['lol', 'lmao', 'omg', 'wtf', 'idk', 'tbh', 'bruh', 'gonna', 'wanna', 'kinda', 'ur', 'u', 'ya', 'smh', 'af'];
  const HARSH = ['stupid', 'terrible', 'awful', 'dumb', 'garbage', 'trash', 'wtf', 'idiot', 'lazy', 'horrible', 'sucks'];
  const BLAME = ['blame', 'fault', 'careless', 'stupid', 'idiot', 'incompetent', 'sloppy', 'should have known', 'lazy'];
  const CONSTRUCTIVE = ['suggest', 'consider', 'could', 'recommend', 'maybe', 'nice', 'great', 'thanks', 'good', 'might', 'what if', 'would', 'love'];

  function item(label, earned, max, note) {
    return { label, earned: Math.round(earned * 10) / 10, max, note: note || '' };
  }

  function total(breakdown) {
    return U.clamp(Math.round(breakdown.reduce((a, b) => a + b.earned, 0)), 0, 100);
  }

  function hasTerm(lower, term) {
    return term.split('|').some((t) => lower.includes(t));
  }

  function countWordHits(wordList, vocab) {
    return wordList.filter((w) => vocab.includes(w)).length;
  }

  // ── Coding ──────────────────────────────────────────────
  function coding(task, code, run) {
    const breakdown = [];
    const notes = [];
    if (!code || code.trim() === task.starter.trim()) {
      return { score: 0, breakdown: [item('Submission', 0, 100, 'No changes were made to the starter code.')], notes: ['You submitted the starter code unchanged.'] };
    }
    if (run.error) {
      breakdown.push(item('Tests passing', 0, 85, run.error));
      notes.push('Your code did not run: ' + run.error);
    } else {
      const passed = run.results.filter((r) => r.pass).length;
      const n = run.results.length;
      breakdown.push(item('Tests passing (visible + hidden)', 85 * passed / n, 85, passed + ' / ' + n + ' tests passed'));
      if (passed < n) notes.push('Some hidden tests failed. Think about edge cases: empty inputs, zeros, negatives, ties.');
    }
    const working = !run.error && run.results.some((r) => r.pass);
    const hasDebug = /console\.log\s*\(/.test(code);
    breakdown.push(item('No leftover debug logging', working && !hasDebug ? 5 : 0, 5, hasDebug ? 'Remove console.log calls before submitting.' : ''));
    const comments = (s) => (s.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).map((c) => c.trim());
    const starterComments = new Set(comments(task.starter));
    const commented = comments(code).some((c) => !starterComments.has(c) && !/todo/i.test(c));
    breakdown.push(item('Explains approach with comments', working && commented ? 5 : 0, 5, commented ? '' : 'Add a short comment explaining your approach.'));
    const usesVar = /\bvar\s/.test(code);
    breakdown.push(item('Modern declarations (const/let)', working && !usesVar ? 5 : 0, 5, usesVar ? 'Prefer const/let over var.' : ''));
    return { score: total(breakdown), breakdown, notes };
  }

  // ── Quiz ────────────────────────────────────────────────
  function quiz(task, answers) {
    let correct = 0;
    const breakdown = task.questions.map((q, i) => {
      const ok = answers[i] === q.answer;
      if (ok) correct++;
      return item('Q' + (i + 1), ok ? 100 / task.questions.length : 0, Math.round(100 / task.questions.length * 10) / 10,
        ok ? 'Correct' : 'Correct answer: ' + q.options[q.answer]);
    });
    const notes = [correct + ' of ' + task.questions.length + ' correct.'];
    return { score: total(breakdown), breakdown, notes };
  }

  // ── Code review ─────────────────────────────────────────
  function review(task, picks, comment) {
    const breakdown = [];
    const notes = [];
    const realCount = task.issues.filter((i) => i.real).length;
    let hit = 0;
    let wrong = 0;
    picks.forEach((idx) => (task.issues[idx].real ? hit++ : wrong++));
    const issuePts = U.clamp(70 * (hit - 0.5 * wrong) / realCount, 0, 70);
    breakdown.push(item('Real issues identified', issuePts, 70, hit + '/' + realCount + ' real issues, ' + wrong + ' false alarm' + (wrong === 1 ? '' : 's')));
    if (hit < realCount) notes.push('You missed ' + (realCount - hit) + ' real issue(s).');
    if (wrong) notes.push('Flagging non-issues costs reviewers\' time. Be confident but accurate.');

    const text = String(comment || '');
    const lower = text.toLowerCase();
    const wl = U.words(text);
    breakdown.push(item('Comment is substantive', 10 * Math.min(1, text.trim().length / 80), 10, text.trim().length < 80 ? 'Explain the issues and how to fix them.' : ''));
    const constructive = CONSTRUCTIVE.some((w) => lower.includes(w));
    breakdown.push(item('Constructive tone', constructive ? 10 : 3, 10, constructive ? '' : 'Try phrasing like "consider…" or "could we…".'));
    const kw = task.keywords.filter((k) => lower.includes(k)).length;
    breakdown.push(item('Specific, actionable feedback', Math.min(10, kw * 4), 10, kw < 2 ? 'Mention the specific problems and fixes.' : ''));
    const harsh = countWordHits(wl, HARSH);
    if (harsh) {
      breakdown.push(item('Professional tone', -Math.min(20, harsh * 10), 0, 'Harsh language in reviews hurts trust.'));
      notes.push('Careful with tone. Critique the code, not the person.');
    }
    return { score: total(breakdown), breakdown, notes };
  }

  // ── Written work ────────────────────────────────────────
  function written(task, text) {
    const r = task.rubric;
    const breakdown = [];
    const notes = [];
    const lower = ' ' + String(text || '').toLowerCase() + ' ';
    const wl = U.words(text);
    const n = wl.length;

    const found = r.sections.filter((s) => s.keys.some((k) => lower.includes(k)));
    const missing = r.sections.filter((s) => !found.includes(s)).map((s) => s.label);
    breakdown.push(item('Required sections', 45 * found.length / r.sections.length, 45,
      missing.length ? 'Missing: ' + missing.join(', ') : 'All sections present'));

    breakdown.push(item('Length & depth', 15 * Math.min(1, n / r.minWords), 15, n + ' words (target ' + r.minWords + '+)'));

    if (r.terms && r.terms.length) {
      const need = r.termsNeeded || Math.ceil(r.terms.length * 0.6);
      const hits = r.terms.filter((t) => hasTerm(lower, t));
      breakdown.push(item('Covers key topics', 25 * Math.min(1, hits.length / need), 25,
        hits.length + ' key topics covered (need ' + need + ')'));
      if (hits.length < need) notes.push('Cover more of the topics reviewers care about (see the brief).');
    } else {
      breakdown.push(item('Specific & personal', 25 * Math.min(1, n / r.minWords), 25, ''));
    }

    let prof = 15;
    const slangHits = r.format === 'post' ? countWordHits(wl, ['wtf', 'lmao', 'af', 'bruh']) : countWordHits(wl, SLANG);
    if (slangHits) {
      prof -= Math.min(9, slangHits * 3);
      notes.push('Tone it down on the slang for workplace writing.');
    }
    const caps = (String(text).match(/\b[A-Z]{4,}\b/g) || []).filter((w) => !['TODO', 'API', 'JSON', 'HTTP', 'WCAG', 'README', 'ERROR', 'NULL', 'SMPTE', 'BLUF', 'KPI', 'KPIS'].includes(w));
    if (caps.length > 3) {
      prof -= 3;
      notes.push('Lots of ALL-CAPS words read as shouting.');
    }
    if ((String(text).match(/!!/g) || []).length > 1) prof -= 2;
    if (r.blameless) {
      const b = BLAME.filter((w) => lower.includes(w));
      if (b.length) {
        prof -= Math.min(15, b.length * 6);
        notes.push('Postmortems must be blameless. Avoid words like "' + b[0] + '".');
      }
    }
    breakdown.push(item('Professional tone', Math.max(0, prof), 15, prof < 15 ? 'See notes' : 'Clear and professional'));

    let score = total(breakdown);
    if (n > 30 && new Set(wl).size / n < 0.35) {
      score = Math.round(score * 0.5);
      notes.push('Lots of repeated words. Reviewers noticed the filler. Score halved.');
    }
    if (n < 10) {
      score = Math.min(score, 15);
      notes.push('This is far too short to evaluate.');
    }
    return { score, breakdown, notes };
  }

  // ── Presentation ────────────────────────────────────────
  // deck: [{type, text}], live: {opening, mid, answers: [pts]}, extra: {health, outfitBonus}
  function presentation(task, deck, live, extra) {
    const breakdown = [];
    const notes = [];
    const types = deck.map((s) => s.type);
    const [lo, hi] = task.slideRange;

    const cnt = deck.length;
    const countPts = cnt >= lo && cnt <= hi ? 8 : (cnt === lo - 1 || cnt === hi + 1 ? 4 : 0);
    breakdown.push(item('Deck length', countPts, 8, cnt + ' slides (target ' + lo + '–' + hi + ')'));

    const reqHit = task.required.filter((r) => (Array.isArray(r) ? r.some((x) => types.includes(x)) : types.includes(r)));
    const reqMissing = task.required.filter((r) => !reqHit.includes(r))
      .map((r) => (Array.isArray(r) ? r : [r]).map((x) => (IS.slideTypes.find((s) => s.id === x) || {}).label).join(' or '));
    breakdown.push(item('Required slides', 12 * reqHit.length / task.required.length, 12, reqMissing.length ? 'Missing: ' + reqMissing.join(', ') : 'All present'));

    let order = 0;
    if (types[0] === 'title') order += 3; else notes.push('Open with a title slide.');
    const pIdx = types.indexOf('problem');
    const sIdx = Math.min(...['solution', 'demo'].map((t) => (types.indexOf(t) === -1 ? Infinity : types.indexOf(t))));
    if (pIdx === -1 || sIdx === Infinity || pIdx < sIdx) order += 2; else notes.push('Put the problem before the solution. That is the story.');
    if (['next', 'qa'].includes(types[types.length - 1])) order += 3; else notes.push('Close with Next Steps or Q&A.');
    breakdown.push(item('Story flow', order, 8, ''));

    const body = deck.filter((s) => s.type !== 'title');
    const good = body.filter((s) => {
      const w = U.words(s.text).length;
      return w >= 8 && w <= 60;
    }).length;
    breakdown.push(item('Slide content (8–60 words each)', body.length ? 6 * good / body.length : 0, 6, good + '/' + body.length + ' slides well-sized'));

    const all = ' ' + deck.map((s) => s.text).join(' ').toLowerCase() + ' ';
    const need = Math.ceil(task.terms.length * 0.6);
    const hits = task.terms.filter((t) => hasTerm(all, t)).length;
    breakdown.push(item('Covers key topics', 6 * Math.min(1, hits / need), 6, hits + ' key topics mentioned'));

    if (types.includes('meme')) {
      breakdown.push(item('Meme slide', -4, 0, 'It got one polite laugh.'));
    }

    const delivery = U.clamp((live.opening || 0) + (live.mid || 0) + ((extra && extra.outfitBonus) || 0), 0, 20);
    breakdown.push(item('Live delivery', delivery, 20, extra && extra.outfitBonus ? 'Blazer bonus applied' : ''));

    const qMax = task.questions.length * 10;
    const qPts = live.answers.reduce((a, b) => a + b, 0);
    breakdown.push(item('Q&A', 40 * qPts / qMax, 40, qPts + '/' + qMax + ' answer quality'));

    if (extra && typeof extra.health === 'number') {
      const mod = U.clamp(Math.round((extra.health - 60) / 10), -6, 4);
      breakdown.push(item('Teammates\' delivery', mod, 0, mod >= 0 ? 'Your team was in sync.' : 'Team friction showed during handoffs.'));
    }
    return { score: total(breakdown), breakdown, notes };
  }

  return { coding, quiz, review, written, presentation };
})();
