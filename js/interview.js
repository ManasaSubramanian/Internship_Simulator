// Career center: applications, interviews (behavioral + technical), results,
// and the training center you must complete after an unsuccessful interview.
IS.interview = (function () {
  const U = IS.util;
  const st = () => IS.state.get();
  const PASS = 70;
  const CODE_MINUTES = 20;
  let timerId = null;

  const track = () => IS.trackAt(st().career.level);

  function iv() {
    const s = st();
    if (!s.interview || s.interview.level !== s.career.level) {
      const prev = s.career.history.filter((h) => h.level === s.career.level).length;
      s.interview = {
        level: s.career.level, attempt: 1, trainings: 0, stage: 'invite', waived: s.career.returnOffer && s.career.level > 0,
        prevAttemptsThisLevel: prev, answers: {}, trainDone: {}, trainTries: {},
      };
      pick(s.interview);
      IS.state.save();
    }
    return s.interview;
  }

  // Choose this attempt's questions (different each attempt).
  function pick(I) {
    const rnd = U.seeded(st().seed + I.level * 1009 + I.attempt * 131);
    const t = IS.trackAt(I.level);
    I.behav = U.shuffle(IS.behavioral.questions.map((_, i) => i), rnd).slice(0, 5);
    I.concepts = U.shuffle(t.interview.concepts.map((_, i) => i), rnd).slice(0, 4);
    I.coding = (I.attempt - 1) % t.interview.coding.length;
    I.answers = { behav: [], concepts: [], free: '', code: null };
    I.scores = null;
    I.codeStarted = null;
  }

  const bonus = (I) => Math.min(15, I.trainings * 5);
  const problem = (I) => track().interview.coding[I.coding];

  // ── Screens ─────────────────────────────────────────────
  function render() {
    const s = st();
    const I = iv();
    clearInterval(timerId);
    switch (I.stage) {
      case 'behavioral': return room(behavioral(I));
      case 'free': return room(freeResponse(I));
      case 'concepts': return room(concepts(I));
      case 'coding': return room(coding(I));
      case 'result': return room(result(I));
      case 'training': return room(training(I));
      default: return IS.home.careerCenter(invite(I));
    }
  }

  function room(inner) {
    return `<div class="screen interview-room"><div class="interview-inner">${inner}</div></div>`;
  }

  function interviewer(id, text, mood) {
    const c = IS.characters[id];
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px;margin-bottom:14px">
      <div style="flex:none">${IS.people.of(id, { height: 330, mood })}</div>
      <div class="panel" style="flex:1"><div class="small muted" style="font-weight:800">${U.esc(c.name)} · ${U.esc(c.title)}</div><div style="font-size:1.08rem;margin-top:4px">${text}</div></div></div>`;
  }

  function invite(I) {
    const t = track();
    const s = st();
    const again = I.attempt > 1 || I.prevAttemptsThisLevel > 0;
    return `<div class="panel">
      <div class="small muted" style="font-weight:900;letter-spacing:.8px;text-transform:uppercase">Application · Internship ${t.n} of 10</div>
      <h1 style="margin:4px 0">${t.icon} ${U.esc(t.title)}</h1>
      <p style="font-size:1.05rem"><b>${U.esc(t.team)}</b> · ${U.esc(t.langLabel)} · ${U.money(t.rate)}/hr · 100 hours (3 hrs/day)</p>
      <p>${U.esc(t.blurb)}</p>
      <div class="chips" style="margin-bottom:12px">${t.skills.map((k) => `<span class="pill">${U.esc(k)}</span>`).join('')}</div>
      ${I.waived ? `<div class="panel soft" style="margin-bottom:12px">🎉 <b>You have a return offer!</b> The behavioral round is waived. You only need to pass a <b>${U.esc(t.langLabel)} technical skills check</b> with ${U.esc(IS.characters[t.cast.mentor].name)}.</div>` : ''}
      ${again ? `<div class="panel soft" style="margin-bottom:12px">🔁 Attempt #${I.attempt}${I.trainings ? ` · Training completed ${I.trainings}× (prep bonus +${bonus(I)} points on each round)` : ''}. The questions will be different this time.</div>` : ''}
      <h3>How the interview works</h3>
      <ol class="small">${I.waived ? '' : `<li><b>Behavioral round</b> with ${U.esc(IS.characters[t.cast.manager].name)}: 5 questions + one written answer.</li>`}
        <li><b>Technical round</b> with ${U.esc(IS.characters[t.cast.mentor].name)}: 4 concept questions + a ${CODE_MINUTES}-minute live ${U.esc(t.langLabel)} problem.</li>
        <li>You need <b>${PASS}+</b> on each round. Not this time? You'll get <b>training</b>, then you can try again as many times as you need.</li></ol>
      <div class="row" style="margin-top:14px"><button class="btn gold big" data-act="ivStart">Start the interview →</button><button class="btn" data-act="learn">📚 Learning Center</button><button class="btn" data-act="ivStudy">🏋️ Formal training (+5 prep bonus)</button></div></div>`;
  }

  function progressDots(n, total) {
    return `<div class="row small muted" style="margin-bottom:8px">${Array.from({ length: total }, (_, i) => `<span style="width:10px;height:10px;border-radius:50%;background:${i < n ? 'var(--terracotta)' : 'var(--sand)'};display:inline-block"></span>`).join('')}</div>`;
  }

  function behavioral(I) {
    const k = I.answers.behav.length;
    const Q = IS.behavioral.questions[I.behav[k]];
    const t = track();
    const rnd = U.seeded(st().seed + k * 17 + I.attempt);
    const opts = U.shuffle(Q.options.map((o, i) => Object.assign({ i }, o)), rnd);
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">BEHAVIORAL ROUND · QUESTION ${k + 1} OF 5</div>${progressDots(k, 6)}
      ${interviewer(t.cast.manager, U.esc(Q.q), 'neutral')}
      <div class="panel">${opts.map((o) => `<button class="btn choice" data-act="ivBehav" data-arg="${o.i}">💬 ${U.esc(o.text)}</button>`).join('')}</div>`;
  }

  function freeResponse(I) {
    const t = track();
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">BEHAVIORAL ROUND · LAST QUESTION</div>${progressDots(5, 6)}
      ${interviewer(t.cast.manager, U.esc(IS.behavioral.freeResponse.q), 'happy')}
      <div class="panel"><textarea id="iv-free" style="min-height:180px" placeholder="Be specific: what excites you, what you bring, what you want to learn…">${U.esc(I.answers.free)}</textarea>
      <div class="spread" style="margin-top:8px"><span class="small muted" id="iv-wc">${U.words(I.answers.free).length} words</span><button class="btn gold" data-act="ivFree">Submit answer →</button></div></div>`;
  }

  function concepts(I) {
    const t = track();
    const k = I.answers.concepts.length;
    const Q = t.interview.concepts[I.concepts[k]];
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">TECHNICAL ROUND · CONCEPT ${k + 1} OF 4</div>${progressDots(k, 5)}
      ${interviewer(t.cast.mentor, U.esc(Q.q), 'neutral')}
      <div class="panel">${Q.options.map((o, i) => `<button class="btn choice" data-act="ivConcept" data-arg="${i}">${U.esc(o)}</button>`).join('')}</div>`;
  }

  const ctx = () => ({ trackId: track().id, db: track().db });
  const P = () => IS.problem;

  function coding(I) {
    const t = track();
    const p = problem(I);
    if (!I.codeStarted) I.codeStarted = Date.now();
    if (I.answers.code == null) I.answers.code = p.starter || '';
    IS.state.save();
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">TECHNICAL ROUND · LIVE ${U.esc(t.langLabel.toUpperCase())} PROBLEM</div>
      <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:14px;margin:10px 0">
        <div style="flex:none">${IS.people.portrait(t.cast.mentor, 90)}</div>
        <div class="panel" style="flex:1"><div class="spread"><b>${U.esc(IS.characters[t.cast.mentor].name)}</b><span class="timer" id="iv-timer" style="color:var(--terracotta)">--:--</span></div>
          <div>Take your time and think out loud. Edge cases count. Hidden tests run when you submit. <b>${p.title}</b></div></div></div>
      <div class="panel"><div class="brief" style="margin-bottom:10px">${p.brief}</div>${P().editor(p, I.answers.code, 'iv', ctx())}
        <div class="row" style="margin-top:8px">${p.type === 'terminal' ? '' : '<button class="btn small primary" data-act="ivRun" data-arg="iv">▶ Run visible tests</button>'}</div>
        <div id="iv-results"></div>
        <div class="spread" style="margin-top:10px"><span class="small muted">Submitting ends the interview.</span><button class="btn gold" data-act="ivSubmitCode">Submit solution →</button></div></div>`;
  }

  function result(I) {
    const t = track();
    const sc = I.scores;
    const passed = sc.passed;
    const b = bonus(I);
    const weak = [];
    if (!I.waived && sc.behavioral < PASS) weak.push('behavioral answers (use STAR: specific situation, your actions, measurable results)');
    if (sc.concepts < 75) weak.push(`${t.langLabel} fundamentals`);
    if (sc.code < 70) weak.push('the live problem (test edge cases and read the spec carefully)');
    const letter = passed
      ? `<h1>🎉 Offer letter</h1><p>Dear ${U.esc(st().player.name)},</p><p>We're delighted to offer you the role of <b>${U.esc(t.title)}</b> on <b>${U.esc(t.team)}</b>: 100 hours at <b>${U.money(t.rate)}/hour</b>, 3 hours a day. Your manager will be ${U.esc(IS.characters[t.cast.manager].name)} and your mentor ${U.esc(IS.characters[t.cast.mentor].name)}.</p><p>Welcome aboard!<br>— Rosa Alvarez, University Programs</p>`
      : `<h1>📨 Interview result</h1><p>Dear ${U.esc(st().player.name)},</p><p>Thank you for interviewing for <b>${U.esc(t.title)}</b>. We aren't able to move forward this time, but we'd love to see you try again. We've enrolled you in our <b>interview training program</b>. Complete it and you can reapply right away.</p><p>Areas to focus on: ${weak.map(U.esc).join('; ') || 'overall consistency'}.</p><p>— Rosa Alvarez, University Programs</p>`;
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px"><div style="flex:none">${IS.people.of('rosa', { height: 220, mood: passed ? 'happy' : 'neutral' })}</div>
      <div class="panel" style="flex:1">${letter}
      <table class="tbl" style="margin:10px 0"><tr><th>Round</th><th class="num">Score</th><th class="num">Needed</th></tr>
        <tr><td>Behavioral${I.waived ? ' (waived: return offer)' : ` (5 questions ${Math.round(sc.behavMc)}%, written ${Math.round(sc.free)}%)`}</td><td class="num">${Math.round(sc.behavioral)}</td><td class="num">${PASS}</td></tr>
        <tr><td>Technical (concepts ${Math.round(sc.concepts)}%, live problem ${Math.round(sc.code)}%)</td><td class="num">${Math.round(sc.technical)}</td><td class="num">${PASS}</td></tr>
        ${sc.testPass ? '<tr><td colspan="3" class="small muted">🧪 Auto-passed with the test code.</td></tr>' : ''}
        ${b ? `<tr><td colspan="3" class="small muted">Includes +${b} prep bonus from ${I.trainings} completed training${I.trainings > 1 ? 's' : ''}.</td></tr>` : ''}</table>
      ${passed ? `<button class="btn gold big" data-act="ivAccept">Accept & start Day 1 →</button>` : `<button class="btn primary big" data-act="ivTrain">Start training →</button>`}</div></div>`;
  }

  // Topics you must work through in the training center: every topic for this
  // internship, plus STAR interview answers when the behavioral round counts.
  function requiredTopics(I) {
    const t = track();
    const list = IS.learn.topics(t.id).map((x) => ({ trackId: t.id, topic: x }));
    if (!I.waived) list.unshift({ trackId: 'career', topic: IS.learn.topic('career', 'star') });
    return list.filter((x) => x.topic);
  }
  const topicDone = (I, x) => !!(I.trainDone && I.trainDone[x.trackId + '/' + x.topic.id]);

  function training(I) {
    const t = track();
    const req = requiredTopics(I);
    const all = req.every((x) => topicDone(I, x));
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px;margin-bottom:12px"><div style="flex:none">${IS.people.of(t.cast.mentor, { height: 170 })}</div>
      <div class="panel" style="flex:1"><h1 style="margin:0">📚 Interview Training Center</h1>
        <p style="margin:6px 0 0">Work through each topic below in the Learning Center. Every topic explains the idea in plain words, walks through a code example line by line, then gives you practice problems. A topic counts as done when you <b>solve one practice problem</b> (or make two honest attempts). Finishing training adds a <b>+5 prep bonus</b> to each interview round (up to +15).</p></div></div>
      <div class="grid grid-2">${req.map((x) => {
        const ok = topicDone(I, x);
        return `<div class="lesson ${ok ? 'done' : ''}"><div class="spread"><h3 style="margin:0">${ok ? '✅' : x.topic.icon || '📘'} ${U.esc(x.topic.title)}</h3><span class="pill ${ok ? 'good' : ''}">${ok ? 'Done' : 'To do'}</span></div>
          <p class="small muted" style="margin:6px 0 10px">${U.esc(x.topic.summary)}</p>
          <button class="btn small ${ok ? '' : 'gold'}" data-act="learn" data-arg="${x.trackId}|${x.topic.id}">${ok ? 'Review lesson' : 'Open lesson →'}</button></div>`;
      }).join('')}</div>
      <div class="panel" style="margin-top:12px"><div class="spread"><span>${req.filter((x) => topicDone(I, x)).length} / ${req.length} topics done</span>
        <button class="btn gold big" data-act="ivFinishTraining" ${all ? '' : 'disabled'}>Complete training & reapply →</button></div></div>`;
  }

  // Called by the Learning Center when you solve (or honestly attempt) a practice problem.
  function noteProgress(trackId, topicId, passed) {
    const s = st();
    const I = s.interview;
    if (!I || I.stage !== 'training' || s.job) return;
    I.trainTries = I.trainTries || {};
    I.trainDone = I.trainDone || {};
    const key = trackId + '/' + topicId;
    I.trainTries[key] = (I.trainTries[key] || 0) + 1;
    if (passed || I.trainTries[key] >= 2) I.trainDone[key] = true;
    IS.state.save();
  }

  // ── Mount & actions ─────────────────────────────────────
  function mount() {
    const s = st();
    const I = s.interview;
    if (!I) return;
    if (I.stage === 'free') {
      const ta = document.getElementById('iv-free');
      ta.addEventListener('input', () => { I.answers.free = ta.value; document.getElementById('iv-wc').textContent = U.words(ta.value).length + ' words'; });
    }
    if (I.stage === 'coding') {
      const p = problem(I);
      P().mount(p, 'iv', I.answers.code, (v) => { I.answers.code = v; IS.state.save(); });
      const tick = () => {
        const left = Math.max(0, CODE_MINUTES * 60 - Math.floor((Date.now() - I.codeStarted) / 1000));
        const el = document.getElementById('iv-timer');
        if (!el) { clearInterval(timerId); return; }
        el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        el.classList.toggle('low', left <= 60);
        if (left <= 0) {
          clearInterval(timerId);
          IS.ui.toast('⏰ Time\'s up! Submitting your solution.', 'bad');
          actions.ivSubmitCode();
        }
      };
      tick();
      timerId = setInterval(tick, 1000);
    }
  }

  function codeScore(run) {
    if (run.error || !run.results.length) return 0;
    return 100 * run.results.filter((r) => r.pass).length / run.results.length;
  }

  function finishInterview(I, codePct) {
    const t = track();
    const b = bonus(I);
    const mc = I.waived ? 100 : 100 * I.answers.behav.reduce((a, x) => a + x, 0) / 50;
    const free = I.waived ? 100 : IS.grading.written({ rubric: IS.behavioral.freeResponse.rubric }, I.answers.free).score;
    const behavioral = I.waived ? 100 : U.clamp(0.75 * mc + 0.25 * free + b, 0, 100);
    const conceptPct = 100 * I.answers.concepts.filter((a, k) => a === t.interview.concepts[I.concepts[k]].answer).length / I.concepts.length;
    const technical = U.clamp(0.4 * conceptPct + 0.6 * codePct + b, 0, 100);
    const passed = behavioral >= PASS && technical >= PASS;
    I.scores = { behavMc: mc, free, behavioral, concepts: conceptPct, code: codePct, technical, passed };
    I.stage = 'result';
    st().lifetime.interviews++;
    IS.state.save();
    IS.ui.render();
    if (passed) IS.ui.confetti(60);
  }

  // Testing shortcut (see U.TEST_CODE): pass the whole interview.
  function testPass(I) {
    clearInterval(timerId);
    P().clearShells();
    I.scores = { behavMc: 100, free: 100, behavioral: 100, concepts: 100, code: 100, technical: 100, passed: true, testPass: true };
    I.stage = 'result';
    st().lifetime.interviews++;
    IS.state.save();
    IS.ui.render();
    IS.ui.toast('🧪 Test code: interview auto-passed.', 'good');
  }

  const actions = {
    ivStart() {
      const I = iv();
      I.stage = I.waived ? 'concepts' : 'behavioral';
      IS.state.save();
      IS.ui.render();
    },
    ivStudy() {
      const I = iv();
      I.stage = 'training';
      I.voluntary = true;
      IS.state.save();
      IS.ui.render();
    },
    ivBehav(i) {
      const I = iv();
      const Q = IS.behavioral.questions[I.behav[I.answers.behav.length]];
      I.answers.behav.push(Q.options[+i].pts);
      if (I.answers.behav.length >= 5) I.stage = 'free';
      IS.state.save();
      IS.ui.render();
    },
    ivFree() {
      const I = iv();
      if (U.hasTestCode(I.answers.free)) return testPass(I);
      if (U.words(I.answers.free).length < 10) return IS.ui.toast('Write a real answer first. Aim for 50+ words.', 'bad');
      I.stage = 'concepts';
      IS.state.save();
      IS.ui.render();
    },
    ivConcept(i) {
      const I = iv();
      I.answers.concepts.push(+i);
      if (I.answers.concepts.length >= 4) I.stage = 'coding';
      IS.state.save();
      IS.ui.render();
    },
    ivRun() {
      const I = iv();
      const out = document.getElementById('iv-results');
      out.innerHTML = '<p class="muted">Running…</p>';
      P().run(problem(I), I.answers.code, 'iv', 'visible', ctx()).then((run) => { out.innerHTML = P().results(run); });
    },
    ivSubmitCode() {
      const I = iv();
      const p = problem(I);
      clearInterval(timerId);
      if (U.hasTestCode(I.answers.code)) return testPass(I);
      const out = document.getElementById('iv-results');
      if (out) out.innerHTML = '<p class="muted">Grading…</p>';
      P().run(p, I.answers.code, 'iv', 'all', ctx()).then((run) => {
        P().resetShell('iv');
        finishInterview(I, codeScore(run));
      });
    },
    ivAccept() {
      const s = st();
      const I = iv();
      if (!s.career.history.length && !s.awards.some((a) => a.id === 'hired')) IS.engine.grantAward('hired', 'First interview passed');
      if (I.attempt > 1 || I.prevAttemptsThisLevel > 0) IS.engine.grantAward('persistent', 'Passed on attempt #' + I.attempt);
      IS.engine.startJob(s.career.level);
      P().clearShells();
      IS.ui.render();
      setTimeout(() => IS.ui.flushCeremonies(() => IS.ui.toast('Welcome! Walk to the security desk and badge in with Marcus.', 'gold')), 100);
    },
    ivTrain() {
      const I = iv();
      I.stage = 'training';
      I.voluntary = false;
      IS.state.save();
      IS.ui.render();
    },
    ivFinishTraining() {
      const I = iv();
      I.trainings++;
      if (!I.voluntary || I.scores) I.attempt++;
      I.trainDone = {};
      I.trainTries = {};
      P().clearShells();
      I.stage = 'invite';
      pick(I);
      IS.state.save();
      IS.ui.render();
      IS.ui.toast(`📚 Training complete! Prep bonus: +${bonus(I)} on each round.`, 'good');
    },
  };

  return { render, mount, actions, PASS, noteProgress };
})();
