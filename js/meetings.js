// Daily meetings: the 5-minute standup (everyone presents a 1–2 slide mini
// pitch deck and is graded) and the daily 1:1 with your mentor.
IS.meetings = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const short = (id) => (id === 'player' ? st().player.name : IS.characters[id].short);
  const STANDUP_MIN = 5;

  const isMeetingDay = (day) => day > 1 && day < U.LAST_DAY;
  const standupDone = () => { const j = st().job; return !!(j.standups && j.standups[j.day]); };
  const oneOnOneDone = () => { const j = st().job; return !!(j.oneOnOnes && j.oneOnOnes[j.day]); };
  const standupDue = () => { const j = st().job; return j && j.clockedIn && isMeetingDay(j.day) && !standupDone(); };
  const oneOnOneDue = () => { const j = st().job; return j && j.clockedIn && isMeetingDay(j.day) && standupDone() && !oneOnOneDone(); };

  // ── Your work, for slide suggestions and grading ──────────
  function myWork() {
    const j = st().job;
    const list = E().tasks().filter((t) => j.tasks[t.id]);
    const open = list.filter((t) => j.tasks[t.id].status === 'assigned').sort((a, b) => E().dueAbs(a) - E().dueAbs(b));
    const done = list.filter((t) => j.tasks[t.id].status === 'graded' && j.tasks[t.id].submittedDay >= j.day - 2)
      .sort((a, b) => j.tasks[b.id].submittedAbs - j.tasks[a.id].submittedAbs);
    return { open, done, all: list };
  }

  const STOP = new Set(['daily', 'ticket', 'review', 'capstone', 'stretch', 'design', 'the', 'and', 'with', 'your', 'for', 'from', 'code', 'fix:', 'bug', 'into', 'about']);
  const keyWords = (title) => title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length >= 5 && !STOP.has(w));

  function gradeStandup(slides, work) {
    const text = slides.map((s) => s.title + ' ' + s.body).join(' ');
    const lower = text.toLowerCase();
    const words = U.words(text).length;
    const items = [];
    const notes = [];
    const add = (label, earned, max, note) => { items.push({ label, earned, max, note: note || '' }); if (earned < max && note) notes.push(note); };
    const structured = slides.length >= 1 && slides.length <= 2 && slides.every((s) => s.title.trim() && U.words(s.body).length >= 3);
    add('1–2 slides, each with a title and content', structured ? 10 : 0, 10, 'Give every slide a title and a few words of content.');
    const mentioned = work.all.filter((t) => keyWords(t.title).some((w) => lower.includes(w)));
    add('Names specific work', mentioned.length ? 30 : /task|assignment|ticket|project/.test(lower) ? 10 : 0, 30, 'Name the actual task or project you worked on so the team knows exactly what you mean.');
    add('Shows progress', /done|finish|submit|ship|complet|merged|fixed|wrote|built|tested|%|percent|progress|half/.test(lower) ? 15 : 0, 15, 'Say what\'s done or how far along you are.');
    add('Says what\'s next', /today|next|plan|will |going to|then|tomorrow/.test(lower) ? 20 : 0, 20, 'Say what you\'ll work on today.');
    add('Calls out blockers (or none)', /block|stuck|help|need|waiting|risk|no blockers|none/.test(lower) ? 15 : 0, 15, 'Always mention blockers, even if it\'s "no blockers".');
    add('Concise (12–80 words)', words >= 12 && words <= 80 ? 10 : words > 80 && words <= 120 ? 5 : 0, 10, words < 12 ? 'Too short to be useful. Add a detail or two.' : 'Too long for a standup. Keep it to the highlights.');
    const score = Math.round(items.reduce((a, b) => a + b.earned, 0));
    return { score, items, notes };
  }

  // What a teammate says at standup, based on the team's projects.
  function npcDeck(id, track, rnd) {
    const c = IS.characters[id];
    const g = [track.groups.g1, track.groups.g2].find((x) => x.members.includes(id)) || track.groups.g1;
    const skill = U.pick(track.skills, rnd);
    const did = U.pick([`Finished the first draft of my part of the ${g.name}`, `Wrote tests for the ${g.name} edge cases`, `Paired with ${short(track.cast.mentor)} on ${skill}`, `Fixed two bugs in the ${g.name}`, `Reviewed a teammate's pull request on ${skill}`, 'Closed my daily ticket and cleaned up my notes'], rnd);
    const next = U.pick([`Integrating my piece into the ${g.name}`, `Documenting how ${skill} works for the team`, 'Finishing my daily ticket and starting the next task', `Adding error handling to the ${g.name}`, `Preparing slides for the ${g.name} demo`], rnd);
    const reliable = c.reliability || 0.8;
    const blocker = rnd() < 1 - reliable ? U.pick(['Waiting on data access from IT', 'Stuck on a flaky test. Could use a second pair of eyes', 'Need a decision on the API format']) : 'No blockers';
    const lazy = rnd() < (1 - reliable) * 0.6;
    const slides = lazy
      ? [{ title: 'Update', body: 'Worked on stuff. Will keep working on stuff.' }]
      : [{ title: 'Yesterday', body: did + '.' }, { title: 'Today & blockers', body: next + '. ' + blocker + '.' }];
    const score = Math.round(U.clamp(lazy ? 45 + rnd() * 15 : 62 + reliable * 30 + (rnd() - 0.5) * 10, 0, 100));
    return { id, slides, score };
  }

  function feedbackFor(score) {
    if (score >= 90) return U.pick(['Crisp and specific. That\'s the standard.', 'Perfect standup update. Thank you!', 'Exactly what I need to know. Great.']);
    if (score >= 75) return U.pick(['Good update. Add a bit more detail on what\'s next.', 'Solid. Remember to call out blockers.', 'Nice. Tighten it up a little.']);
    if (score >= 60) return U.pick(['Okay, but I\'m not sure what you actually worked on.', 'A bit vague. Name the task and the status.']);
    return U.pick(['That didn\'t tell us much. Let\'s talk after.', 'I need specifics: what\'s done, what\'s next, any blockers.']);
  }

  const slideHtml = (s, who) => `<div class="mini-slide"><div class="ms-who">${U.esc(who)}</div><div class="ms-title">${U.esc(s.title || 'Untitled')}</div><div class="ms-body">${U.esc(s.body || '')}</div></div>`;

  // ── Standup ─────────────────────────────────────────────
  function standup(done) {
    const s = st();
    const j = s.job;
    const t = E().track();
    j.standups = j.standups || {};
    const startMinute = j.minute;
    const rnd = U.seeded(s.seed + j.day * 613 + j.level * 17);
    const interns = t.cast.interns;
    const order = interns.slice(0, 2).concat(['player'], interns.slice(2));
    const decks = {};
    interns.forEach((id) => { decks[id] = npcDeck(id, t, rnd); });
    const work = myWork();
    const draft = j.standupDraft && j.standupDraft.day === j.day ? j.standupDraft : {
      day: j.day, two: true,
      slides: [
        { title: 'Yesterday', body: work.done[0] ? `Finished "${work.done[0].title}".` : '' },
        { title: 'Today & blockers', body: '' },
      ],
    };
    j.standupDraft = draft;
    const el = document.createElement('div');
    el.className = 'stage standup';
    document.body.appendChild(el);
    const frame = (inner) => {
      el.innerHTML = `<div class="spotlight"></div><div class="stage-inner">
        <div class="spread"><span class="scene-place">🧍 Daily standup · Day ${j.day} · Conference room</span><span class="small muted">Timebox: ${STANDUP_MIN} min</span></div>
        <div class="standup-row">${order.map((id) => `<div class="seat">${IS.people.portrait(id, 56)}<div>${U.esc(short(id))}</div></div>`).join('')}</div>${inner}</div>`;
      el.scrollTop = 0;
    };
    const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => { b.onclick = () => fn(b); });

    function prep() {
      const chips = work.open.slice(0, 4).concat(work.done.slice(0, 2)).map((x) => `<button class="btn small chip" data-chip="${U.esc(x.title)}">${IS.computer.icon(x)} ${U.esc(x.title)}</button>`).join('');
      frame(`<div class="row" style="align-items:flex-start;gap:14px;flex-wrap:nowrap;margin-top:12px"><div style="flex:none">${IS.people.portrait(t.cast.manager, 72)}</div>
        <div class="panel" style="flex:1"><b>${U.esc(IS.characters[t.cast.manager].short)}</b>: Morning! Standup time. Everyone gets 1–2 slides: <b>what you did</b>, <b>what's next</b>, and any <b>blockers</b>. Be specific and brief. I grade every update.</div></div>
        <div class="panel" style="margin-top:12px"><div class="spread"><h3 style="margin:0">Your mini deck</h3>
          <label class="small" style="display:flex;gap:6px;align-items:center;width:auto"><input type="checkbox" id="su-two" style="width:auto" ${draft.two ? 'checked' : ''}> Use a second slide</label></div>
          <p class="small muted" style="margin:4px 0 8px">Click a task to insert its name: ${chips || '<i>no tasks yet</i>'}</p>
          <div class="grid grid-2">${[0, 1].map((i) => `<div class="deck-slide ${i === 1 && !draft.two ? 'off' : ''}" data-slide="${i}"><div class="small muted">Slide ${i + 1}</div>
            <input class="su-title" data-i="${i}" value="${U.esc(draft.slides[i].title)}" placeholder="Slide title" aria-label="Slide ${i + 1} title">
            <textarea class="su-body" data-i="${i}" rows="4" placeholder="${i === 0 ? 'What did you finish or make progress on?' : 'What\'s next today? Any blockers?'}" aria-label="Slide ${i + 1} content">${U.esc(draft.slides[i].body)}</textarea></div>`).join('')}</div>
          <div class="spread" style="margin-top:10px"><span class="small muted">You present third. Graded on: specific work, progress, next steps, blockers, brevity.</span><button class="btn gold" data-go>Start standup →</button></div></div>`);
      let lastBox = 0;
      el.querySelectorAll('.su-title, .su-body').forEach((inp) => {
        inp.addEventListener('focus', () => { lastBox = +inp.dataset.i; });
        inp.addEventListener('input', () => { draft.slides[+inp.dataset.i][inp.classList.contains('su-title') ? 'title' : 'body'] = inp.value; });
      });
      el.querySelector('#su-two').addEventListener('change', (e) => { draft.two = e.target.checked; el.querySelector('[data-slide="1"]').classList.toggle('off', !draft.two); });
      on('[data-chip]', (b) => {
        const box = el.querySelectorAll('.su-body')[draft.two ? lastBox : 0];
        box.value = (box.value ? box.value.replace(/\s*$/, ' ') : '') + '"' + b.dataset.chip + '"';
        draft.slides[+box.dataset.i].body = box.value;
        box.focus();
      });
      on('[data-go]', () => {
        const mine = draft.two ? draft.slides : [draft.slides[0]];
        if (!mine.some((x) => (x.body || '').trim())) return IS.ui.toast('Add something to your slide first.', 'bad');
        present(0);
      });
    }

    const results = [];
    function present(i) {
      const id = order[i];
      if (!id) return summary();
      if (id === 'player') {
        const mine = (draft.two ? draft.slides : [draft.slides[0]]).map((x) => ({ title: x.title, body: x.body }));
        const test = U.hasTestCode(mine);
        const g = test ? { score: 100, items: [{ label: '🧪 Test code', earned: 100, max: 100 }], notes: [] } : gradeStandup(mine, work);
        results.push({ id, score: g.score });
        j.standups[j.day] = { score: g.score, slides: mine, items: g.items, notes: g.notes };
        frame(`<h2 style="margin:12px 0 6px">You're up, ${U.esc(short('player'))}</h2><div class="deck">${mine.map((x) => slideHtml(x, short('player'))).join('')}</div>
          <div class="panel" style="margin-top:12px"><div class="spread"><b>${U.esc(IS.characters[t.cast.manager].short)}:</b><span class="grade ${U.gradeClass(g.score)}">${U.letter(g.score)} · ${g.score}%</span></div>
            <p style="margin:6px 0">${U.esc(feedbackFor(g.score))}</p>
            <table class="tbl">${g.items.map((x) => `<tr><td>${x.earned >= x.max ? '✅' : '➖'} ${U.esc(x.label)}${x.earned < x.max && x.note ? `<div class="small muted">${U.esc(x.note)}</div>` : ''}</td><td class="num">${x.earned}/${x.max}</td></tr>`).join('')}</table>
            <div style="text-align:right;margin-top:10px"><button class="btn primary" data-go>Next ▸</button></div></div>`);
        E().changeRel(t.cast.manager, g.score >= 85 ? 2 : g.score < 60 ? -2 : 0);
        IS.state.save();
        return on('[data-go]', () => present(i + 1));
      }
      const d = decks[id];
      results.push({ id, score: d.score });
      frame(`<div class="row" style="gap:14px;align-items:flex-end;margin-top:12px;flex-wrap:nowrap"><div style="flex:none">${IS.people.of(id, { height: 150 })}</div>
        <div style="flex:1"><h2 style="margin:0 0 6px">${U.esc(IS.characters[id].name)} <span class="small muted">${U.esc(IS.characters[id].title)}</span></h2><div class="deck">${d.slides.map((x) => slideHtml(x, short(id))).join('')}</div></div></div>
        <div class="panel" style="margin-top:12px"><div class="spread"><b>${U.esc(IS.characters[t.cast.manager].short)}:</b><span class="grade ${U.gradeClass(d.score)}">${U.letter(d.score)} · ${d.score}%</span></div><p style="margin:6px 0 0">${U.esc(feedbackFor(d.score))}</p>
        <div style="text-align:right;margin-top:10px"><button class="btn primary" data-go>Next ▸</button></div></div>`);
      on('[data-go]', () => present(i + 1));
    }

    function summary() {
      const hist = Object.values(j.standups).map((x) => x.score);
      frame(`<h2 style="margin:12px 0">Standup scores, Day ${j.day}</h2><div class="panel"><table class="tbl">${results.slice().sort((a, b) => b.score - a.score).map((r) => `<tr><td>${r.id === 'player' ? '<b>You</b>' : U.esc(IS.characters[r.id].name)}</td><td class="num"><span class="grade ${U.gradeClass(r.score)}">${U.letter(r.score)} · ${r.score}%</span></td></tr>`).join('')}</table>
        <p class="small muted" style="margin:10px 0 0">Your standup average this internship: <b>${Math.round(U.avg(hist))}%</b> over ${hist.length} standup${hist.length > 1 ? 's' : ''}. Standups count for 15% of your final grade.</p>
        <p style="margin:10px 0 0">Next: your <b>daily 1:1 with ${U.esc(IS.characters[t.cast.mentor].short)}</b>. Walk over to their desk.</p>
        <div style="text-align:right;margin-top:10px"><button class="btn gold" data-go>Back to work</button></div></div>`);
      on('[data-go]', () => {
        el.remove();
        delete j.standupDraft;
        // The meeting is timeboxed to 5 minutes even if you were quicker.
        if (j.minute < startMinute + STANDUP_MIN) E().advance(startMinute + STANDUP_MIN - j.minute, 'meeting');
        IS.state.save();
        IS.ui.after();
        if (done) done();
      });
    }
    prep();
  }

  // ── Mentor 1:1 ─────────────────────────────────────────
  function tipsFor(j) {
    const tips = [];
    const graded = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'graded' && j.tasks[t.id].breakdown);
    const lost = {};
    graded.forEach((t) => (j.tasks[t.id].breakdown || []).forEach((b) => {
      const miss = b.max - b.earned;
      if (miss > 0.5) {
        const k = b.label;
        lost[k] = lost[k] || { label: k, pts: 0, task: t, note: b.note };
        lost[k].pts += miss;
      }
    }));
    Object.values(lost).sort((a, b) => b.pts - a.pts).slice(0, 2).forEach((x) => {
      const rel = IS.learn.related(x.task, E().track().id, 1)[0];
      tips.push(`You've been losing points on "${x.label}"${x.note ? ` (for example on "${x.task.title}": ${x.note.replace(/\.$/, '')})` : ` (for example on "${x.task.title}")`}.` + (rel ? ` The "${rel.t.title}" lesson in the Learning Center covers this.` : ''));
    });
    const lastSu = j.standups && Object.values(j.standups).slice(-1)[0];
    if (lastSu && lastSu.notes && lastSu.notes.length) tips.push('On your standup slides: ' + lastSu.notes[0]);
    if (j.stats.lateCount) tips.push(`You've had ${j.stats.lateCount} late submission${j.stats.lateCount > 1 ? 's' : ''}. Start the task with the nearest deadline first, and ask for an extension before the deadline, not after.`);
    if ((j.stats.helpAsked || 0) === 0 && graded.length >= 3) tips.push('You haven\'t asked for help yet. Asking early is a strength here, not a weakness.');
    if (!tips.length) tips.push(graded.length ? 'Honestly, keep doing exactly what you\'re doing. If you want a stretch: take on the optional task, or help a teammate who\'s stuck.' : 'Nothing graded yet, so my advice is simple: read each brief twice, run the tests early, and submit before the deadline.');
    return tips.slice(0, 3);
  }

  function upcoming(j, t) {
    const d = j.day;
    const events = [];
    const add = (day, text) => { if (day >= d && day <= d + 3) events.push(`${day === d ? 'Today' : U.weekday(day)}: ${text}`); };
    add(8, `the ${t.groups.g1.name} group demo prep starts`);
    add(10, `${t.groups.g1.name} demo day`);
    add(16, 'your midpoint performance review');
    add(26, 'final presentation prep begins');
    add(33, 'final presentations');
    for (let x = d; x <= d + 3; x++) if (U.isFriday(x)) { events.push(`${x === d ? 'Today' : 'Friday'}: payday 💵`); break; }
    return events;
  }

  function oneOnOne(done) {
    const s = st();
    const j = s.job;
    const t = E().track();
    const m = t.cast.mentor;
    const work = myWork();
    const g = E().gradeSummary((x) => !x.daily);
    const tk = E().gradeSummary((x) => x.daily);
    const su = j.standups ? Object.values(j.standups).map((x) => x.score) : [];
    const pri = work.open.slice(0, 3).map((x, i) => `${i + 1}) "${x.title}", due ${U.dueLabel(E().effectiveDue(x))}${x.urgent ? ' 🚨 (urgent!)' : ''}`);
    const how = [];
    how.push(g.count ? `Assignments: ${U.letter(g.avg)} average (${Math.round(g.avg)}%) across ${g.count}.` : 'No assignments graded yet.');
    if (tk.count) how.push(`Daily tickets: ${Math.round(tk.avg)}% over ${tk.count}.`);
    if (su.length) how.push(`Standups: ${Math.round(U.avg(su))}% average.`);
    how.push(j.stats.lateCount ? `${j.stats.lateCount} late so far.` : 'Nothing late. 👏');
    const overall = g.count ? g.avg : 80;
    const verdict = overall >= 88 && !j.stats.lateCount ? 'You\'re on track for a return offer.' : overall >= 78 ? 'You\'re doing fine. A few improvements and you\'re in return-offer territory.' : 'We need to turn this around together. Let\'s focus on the basics this week.';
    const events = upcoming(j, t);
    const c = IS.characters[m];
    const steps = [
      { who: m, text: U.pick([`Morning, ${s.player.name}! Grab a seat. Quick 1:1.`, 'Hey! Let\'s do our daily check-in.', `Good to see you. Five minutes, then back to building.`]) },
      { who: m, text: pri.length ? `Here's what's on your plate, in priority order: ${pri.join('; ')}.` : 'Your queue is clear right now. Use the time to study in the Learning Center or help a teammate.' },
      { who: m, text: `How you're doing: ${how.join(' ')} ${verdict}` },
    ].concat(tipsFor(j).map((tip, i) => ({ who: m, text: (i === 0 ? 'How to improve: ' : 'Also: ') + tip })));
    if (events.length) steps.push({ who: m, text: `Coming up: ${events.join('; ')}.` });
    steps.push({ choices: [
      { text: 'I feel on track. Thanks!', effects: { rel: { [m]: 2 }, morale: 2 }, reply: { who: m, text: 'Love to hear it. Keep the momentum.' } },
      { text: 'It\'s busy. Any tips on prioritizing?', effects: { rel: { [m]: 3 }, morale: 3 }, reply: { who: m, text: 'Sort by deadline, then by what unblocks other people. Do the daily ticket early because it\'s quick. And timebox: if you\'re stuck for 15 minutes, ask.' } },
      { text: 'Honestly, I\'m a bit overwhelmed.', effects: { rel: { [m]: 4 }, morale: 5 }, reply: { who: m, text: 'Thanks for telling me. That\'s exactly what these meetings are for. Pick ONE task and finish it today. If a deadline looks impossible, ask your manager for an extension before it passes. I\'ve got your back.' } },
    ] });
    steps.push({ who: m, text: U.pick(c.chat || ['Go build something great.']) });
    j.oneOnOnes = j.oneOnOnes || {};
    IS.ui.playScenes([{ title: `Daily 1:1 with ${c.short}`, place: '🧑‍🏫 Mentor\'s desk', steps }], () => {
      j.oneOnOnes[j.day] = true;
      IS.state.save();
      IS.ui.after();
      if (done) done();
    });
  }

  // Standup average for the final grade (null if there were none).
  function standupAvg(j) {
    const list = j.standups ? Object.values(j.standups).map((x) => x.score) : [];
    return list.length ? U.avg(list) : null;
  }

  return { standup, oneOnOne, standupDue, oneOnOneDue, isMeetingDay, gradeStandup, standupAvg };
})();
