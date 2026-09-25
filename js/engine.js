// Game rules for the internship in progress: time, energy, pay, deadlines,
// grading consequences, help, social, store, awards, and career transitions.
IS.engine = (function () {
  const U = IS.util;
  const LATE_FEE = 10;
  const MISSED_FEE = 25;
  const TAX_RATE = 0.1265; // FICA 7.65% + ~5% estimated income tax withholding
  const SPOT_BONUS = 50;
  const WORK_DRAIN = 0.8; // energy per focused minute (a 1-hour day drains ~50)
  const MEETING_DRAIN = 0.3;

  const S = () => IS.state.get();
  const J = () => IS.state.get().job;
  const toast = (msg, kind) => IS.ui && IS.ui.toast && IS.ui.toast(msg, kind);

  function track() {
    const s = S();
    const lvl = s.job ? s.job.level : s.career.level;
    return IS.trackAt(lvl);
  }
  // Everything assigned during this internship: the track's authored tasks plus
  // one small daily ticket per workday (see IS.daily).
  const tasks = () => (J() ? track().tasks.concat(IS.daily.forTrack(track(), S().seed)) : []);
  const taskById = (id) => tasks().find((t) => t.id === id);
  const cast = () => track().cast;
  const team = () => [cast().manager, cast().mentor].concat(cast().interns);

  function now() {
    const j = J();
    return U.abs(j.day, j.minute);
  }
  const rec = (id) => J().tasks[id];
  const dayLen = () => U.dayLen(J().day);
  const remaining = () => dayLen() - J().minute;

  function dueAbs(task) {
    const r = rec(task.id);
    return U.abs(task.due.day, task.due.minute) + ((r && r.extDays) || 0) * U.DAY_LENGTH;
  }
  function effectiveDue(task) {
    const r = rec(task.id);
    return { day: task.due.day + ((r && r.extDays) || 0), minute: task.due.minute };
  }

  // Passive bonus from displayed desk items and worn items.
  function bonus(key) {
    const s = S();
    const ids = s.desk.concat([s.equipped.outfit, s.equipped.hat, s.equipped.accessory].filter(Boolean));
    return ids.reduce((sum, id) => {
      const it = IS.store.byId(id);
      return sum + ((it && it.effect && it.effect[key]) || 0);
    }, 0);
  }

  function productivity() {
    const j = J();
    let p = 0.5 + 0.5 * (j.energy / 100);
    if (j.morale >= 70) p += 0.05;
    if (j.morale < 30) p -= 0.1;
    if (j.flags.itBoostDay === j.day) p += 0.05;
    p += Math.min(0.25, bonus('productivity'));
    return U.clamp(p, 0.3, 1.4);
  }

  function addInbox(from, subject, body, taskId) {
    const j = J();
    j.inbox.unshift({ id: U.uid(), from, subject, body, day: j.day, minute: j.minute, read: false, taskId: taskId || null });
  }

  function rel(id) {
    const s = S();
    if (s.rel[id] == null) s.rel[id] = id === 'harriet' ? 40 : IS.RECURRING.includes(id) ? 55 : 50;
    return s.rel[id];
  }
  function changeRel(id, d) {
    if (!id || !IS.characters[id]) return;
    S().rel[id] = U.clamp(rel(id) + d, 0, 100);
  }

  function applyEffects(e) {
    if (!e) return;
    const j = J();
    if (e.rel) Object.keys(e.rel).forEach((k) => changeRel(resolve(k), e.rel[k]));
    if (e.teamRel) cast().interns.forEach((k) => changeRel(k, e.teamRel));
    if (j) {
      if (e.morale) j.morale = U.clamp(j.morale + e.morale, 0, 100);
      if (e.energy) j.energy = U.clamp(j.energy + e.energy, 0, 100);
      if (e.health) Object.keys(e.health).forEach((g) => { j.groups[g].health = U.clamp(j.groups[g].health + e.health[g], 0, 100); });
      if (e.flag) j.flags[e.flag] = true;
      if (e.networking) j.stats.networking += e.networking;
      if (e.time && j.clockedIn) spend(e.time);
    }
    if (e.money) S().wallet += e.money;
    checkAchievements();
  }

  // Scene/role keys like 'manager' or 'intern2' → character ids.
  function resolve(k) {
    const c = cast();
    const map = { manager: c.manager, mentor: c.mentor, intern1: c.interns[0], intern2: c.interns[1], intern3: c.interns[2], intern4: c.interns[3] };
    return map[k] || k;
  }

  // ── Time ───────────────────────────────────────────────
  function advance(mins, kind) {
    const j = J();
    if (!j || !j.clockedIn || mins <= 0) return false;
    const used = Math.min(mins, dayLen() - j.minute);
    j.minute += used;
    const drain = (kind === 'work' ? WORK_DRAIN : kind === 'idle' ? 0.1 : MEETING_DRAIN) * (1 + bonus('drain'));
    j.energy = U.clamp(j.energy - used * drain, 0, 100);
    checkDeadlines(now());
    return j.minute >= dayLen();
  }

  // Time costs written for 3-hour days (like "ask the mentor: 15 min") are
  // scaled to the 1-hour day. Conversations and meetings take real time instead.
  function spend(mins) {
    const ended = advance(Math.max(1, Math.round(mins / 3)), 'meeting');
    IS.state.save();
    return ended;
  }

  // One real minute on the clock (called by IS.clock). Focus time goes to the
  // assignment that's open, scaled by productivity (energy, morale, desk items).
  function passMinute(taskId) {
    const j = J();
    if (!j || !j.clockedIn || j.minute >= dayLen()) return true;
    const r = taskId && rec(taskId);
    const task = taskId && taskById(taskId);
    if (r && task && r.status === 'assigned') {
      r.progress = Math.min(task.effort, r.progress + productivity());
      j.stats.focusMinutes = (j.stats.focusMinutes || 0) + 1;
    }
    return advance(1, r ? 'work' : 'idle');
  }

  function checkDeadlines(t) {
    const j = J();
    tasks().forEach((task) => {
      const r = j.tasks[task.id];
      if (!r || r.status !== 'assigned') return;
      const due = dueAbs(task);
      if (task.optional) {
        if (t > due) {
          r.status = 'expired';
          addInbox(task.from, 'Stretch task closed: ' + task.title, 'No worries, it was optional! The window for this stretch task has closed.', task.id);
        }
        return;
      }
      if (t > due && !r.late) {
        r.late = true;
        j.stats.lateCount++;
        const wk = U.weekOf(j.day);
        j.stats.lateByWeek[wk] = (j.stats.lateByWeek[wk] || 0) + 1;
        j.period.deductions.push({ label: 'Late: ' + task.title, amount: LATE_FEE });
        j.morale = U.clamp(j.morale - 5, 0, 100);
        changeRel(cast().manager, -3);
        addInbox(cast().manager, '⚠️ Past due: ' + task.title,
          `This was due ${U.dueLabel(effectiveDue(task))} and I don't have it yet. Late work loses 10% per workday late, and there's a ${U.money(LATE_FEE)} adjustment on this week's check. After two workdays it's marked missed. Please get it in ASAP.`, task.id);
        toast('⚠️ Deadline missed: ' + task.title + ` (−${U.money(LATE_FEE)})`, 'bad');
      }
      if (t > due + 2 * U.DAY_LENGTH) {
        r.status = 'missed';
        r.score = 0;
        j.stats.missedCount++;
        j.period.deductions.push({ label: 'Missed: ' + task.title, amount: MISSED_FEE });
        changeRel(cast().manager, -5);
        j.morale = U.clamp(j.morale - 8, 0, 100);
        addInbox(cast().manager, '❌ Marked missed: ' + task.title,
          `This is now more than two workdays late and has been marked missed (0%), with an additional ${U.money(MISSED_FEE)} adjustment. Let's talk about how to prevent this.`, task.id);
        toast('❌ Assignment missed: ' + task.title + ` (−${U.money(MISSED_FEE)})`, 'bad');
      }
    });
  }

  // ── Career ─────────────────────────────────────────────
  function startJob(level) {
    const s = S();
    const t = IS.trackAt(level);
    s.job = IS.state.newJob(level, t);
    s.career.phase = 'working';
    s.interview = null;
    team().forEach(rel);
    s.pos = { x: 160, y: 640 };
    s.scrapbook.push({ level, day: 1, emoji: t.icon, text: `Started internship ${t.n}: ${t.title}, ${t.team}` });
    IS.state.save();
  }

  // Called after the final day. Archives the internship and sets up what's next.
  function finishJob() {
    const s = S();
    const j = s.job;
    const t = track();
    const r = finalResult();
    const earned = j.paystubs.reduce((a, p) => a + p.net, 0);
    const hours = j.paystubs.reduce((a, p) => a + p.hours, 0);
    s.career.history.push({
      level: j.level, trackId: t.id, title: t.title, team: t.team, grade: Math.round(r.overall), offer: r.offer,
      earned, hours, awards: s.awards.filter((a) => a.level === j.level).map((a) => a.id), attempt: (s.career.history.filter((h) => h.level === j.level).length + 1),
    });
    s.lifetime.earned += earned;
    s.lifetime.hours += hours;
    s.job = null;
    if (r.offer === 'offer') {
      if (j.level >= IS.tracks.length - 1) {
        s.career.phase = 'done';
      } else {
        s.career.level = j.level + 1;
        s.career.returnOffer = true;
        s.career.phase = 'interview';
      }
    } else {
      s.career.returnOffer = false;
      s.career.phase = 'interview';
    }
    IS.state.save();
    return r;
  }

  // ── Day lifecycle ──────────────────────────────────────
  function clockIn() {
    const j = J();
    if (j.clockedIn) return [];
    j.clockedIn = true;
    j.minute = 0;
    j.chattedToday = {};
    j.energy = U.clamp(80 + j.morale / 5 + bonus('startEnergy'), 0, 100);
    j.morale = U.clamp(j.morale - 2 + bonus('dailyMorale'), 0, 100);
    if (j.day === 1) {
      bonus('teamRel') && cast().interns.forEach((k) => changeRel(k, bonus('teamRel')));
    }

    tasks().filter((t) => t.day === j.day && !j.tasks[t.id]).forEach((t) => {
      j.tasks[t.id] = { status: 'assigned', progress: 0, hintsUsed: 0, draft: null, late: false, extDays: 0, assignedDay: j.day };
      addInbox(t.from, (t.urgent ? '🚨 ' : '📌 ') + 'New assignment: ' + t.title,
        `You have a new ${t.kind === 'group' ? 'group' : 'individual'} ${label(t.type)}${t.optional ? ' (optional stretch)' : ''}. Due ${U.dueLabel(t.due)}. Estimated focus time: ${t.effort} min. Find it in your To-Do app on your computer.`, t.id);
    });

    const scenes = IS.scenes.forDay(track(), S());
    IS.state.save();
    return scenes;
  }

  function label(type) {
    return { coding: 'coding assignment', quiz: 'training quiz', review: 'code review', written: 'writing assignment', presentation: 'presentation', terminal: 'terminal task', sql: 'SQL task', web: 'web task', config: 'config task' }[type] || 'assignment';
  }

  function clockOut() {
    const j = J();
    if (!j.clockedIn) return null;
    const minutes = j.minute;
    const pay = Math.round(minutes / 60 * j.rate * 100) / 100;
    j.period.days.push({ day: j.day, minutes, pay });
    checkDeadlines(U.abs(j.day, dayLen()) + 1);
    j.clockedIn = false;
    const summary = { day: j.day, minutes, pay, full: dayLen(), early: minutes < dayLen() };
    const last = j.day >= U.LAST_DAY;
    if (U.isFriday(j.day) || last) {
      summary.spot = weeklySpotAward();
      summary.paystub = runPayroll();
      j.morale = U.clamp(j.morale + 5, 0, 100);
    }
    if (last) summary.over = true;
    else {
      j.day++;
      j.minute = 0;
    }
    IS.state.save();
    return summary;
  }

  function weeklySpotAward() {
    const j = J();
    const wk = U.weekOf(j.day);
    const graded = tasks().filter((t) => {
      const r = j.tasks[t.id];
      return r && r.status === 'graded' && U.weekOf(r.submittedDay) === wk;
    });
    if (graded.length < 2) return null;
    const a = U.avg(graded.map((t) => j.tasks[t.id].score));
    if (a >= 90 && !j.stats.lateByWeek[wk]) {
      j.period.bonuses.push({ label: 'Pixie Dust Spot Award (Week ' + wk + ')', amount: SPOT_BONUS });
      grantAward('spot', 'Week ' + wk + ': ' + Math.round(a) + '% average, nothing late');
      return { week: wk, avg: a };
    }
    return null;
  }

  function runPayroll() {
    const j = J();
    const p = j.period;
    const minutes = p.days.reduce((a, d) => a + d.minutes, 0);
    const gross = p.days.reduce((a, d) => a + d.pay, 0);
    const bonuses = p.bonuses.reduce((a, b) => a + b.amount, 0);
    const deductions = p.deductions.reduce((a, b) => a + b.amount, 0);
    const taxes = Math.round((gross + bonuses) * TAX_RATE * 100) / 100;
    const net = Math.max(0, Math.round((gross + bonuses - taxes - deductions) * 100) / 100);
    const stub = {
      week: U.weekOf(j.day), hours: minutes / 60, rate: j.rate, gross, bonuses, taxes, deductions, net,
      bonusItems: p.bonuses.slice(), deductionItems: p.deductions.slice(),
    };
    j.paystubs.push(stub);
    S().wallet += net;
    j.period = { days: [], deductions: [], bonuses: [] };
    addInbox('rosa', '💵 Paycheck deposited: Week ' + stub.week,
      `Your paycheck of ${U.money(net)} has been deposited: gross ${U.money(gross)} for ${stub.hours.toFixed(2)} hrs` +
      (bonuses ? `, bonuses ${U.money(bonuses)}` : '') + (deductions ? `, adjustments −${U.money(deductions)}` : '') +
      `, taxes −${U.money(taxes)}. Details are in the HR Portal.`);
    return stub;
  }

  // ── Work ───────────────────────────────────────────────
  function canSubmit(id) {
    const j = J();
    const r = rec(id);
    const task = taskById(id);
    if (!r || r.status !== 'assigned') return { ok: false, why: 'Not open' };
    if (!j.clockedIn) return { ok: false, why: 'Badge in first to submit work.' };
    if (r.progress < task.effort - 0.01) return { ok: false, why: `Keep working: this needs ${task.effort} min of focus time (${Math.floor(r.progress)} so far). Focus time grows while the task is open.` };
    if (remaining() < 1) return { ok: false, why: 'Your shift is over. Submit tomorrow.' };
    return { ok: true };
  }

  function submit(id, result, submission) {
    const j = J();
    const r = rec(id);
    const task = taskById(id);
    advance(1, 'meeting');
    const t = now();
    const due = dueAbs(task);
    const daysLate = t > due && !result.testPass ? Math.ceil((t - due) / U.DAY_LENGTH) : 0;
    const penalty = daysLate * 10;
    Object.assign(r, {
      rawScore: result.score, penalty, score: Math.max(0, result.score - penalty), breakdown: result.breakdown, notes: result.notes,
      submission, status: 'graded', submittedDay: j.day, submittedMinute: j.minute, submittedAbs: t, daysLate,
    });
    if (due - t >= U.DAY_LENGTH) {
      r.early = true;
      j.stats.earlyCount++;
    }
    changeRel(task.from === 'harriet' ? cast().manager : task.from, Math.round((r.score - 70) / 8));
    if (r.score >= 90) j.morale = U.clamp(j.morale + 5, 0, 100);
    else if (r.score < 60) j.morale = U.clamp(j.morale - 6, 0, 100);
    addInbox(task.from, `${U.letter(r.score)} (${r.score}%): ${task.title}`, feedbackText(task, r), id);
    if (task.group && task.type === 'presentation') finalizeGroup(task.group, r.score);
    checkAchievements();
    IS.state.save();
    return r;
  }

  function feedbackText(task, r) {
    const c = IS.characters[task.from];
    const lines = [];
    if (r.score >= 95) lines.push(U.pick(['Outstanding work. Exactly what I was hoping for.', 'This is production quality. Really nice.', 'Excellent. I\'m sharing this with the team as an example.']));
    else if (r.score >= 85) lines.push(U.pick(['Great job. Just a couple of small things to tighten up.', 'Really solid work. See the notes for improvements.']));
    else if (r.score >= 70) lines.push(U.pick(['Decent start, but there are gaps. Look at the breakdown.', 'This works in parts. Let\'s talk through what was missed.']));
    else lines.push(U.pick(['This needs significant work. Review the breakdown and ask for help next time.', 'This didn\'t meet the bar. Let\'s figure out what went wrong together.']));
    if (r.penalty) lines.push(`Submitted ${r.daysLate} workday${r.daysLate > 1 ? 's' : ''} late: −${r.penalty}% late penalty.`);
    if (r.early) lines.push('And a full day early. Love that.');
    (r.notes || []).slice(0, 3).forEach((n) => lines.push('• ' + n));
    lines.push('— ' + c.short);
    return lines.join('\n');
  }

  function finalizeGroup(gid, presScore) {
    const j = J();
    const g = j.groups[gid];
    const parts = tasks().filter((t) => t.group === gid && t.type !== 'presentation').map((t) => {
      const r = j.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') ? r.score : 0;
    });
    g.grade = Math.round(0.5 * presScore + 0.3 * U.avg(parts) + 0.2 * g.health);
    g.parts = parts;
    g.presentation = presScore;
    const name = track().groups[gid].name;
    addInbox(cast().manager, `👥 Group grade, ${name}: ${U.letter(g.grade)} (${g.grade}%)`,
      `Group grade = 50% presentation (${presScore}%) + 30% your deliverables (${Math.round(U.avg(parts))}%) + 20% team health (${g.health}%).\n` +
      (g.health >= 80 ? 'Your team worked really well together.' : g.health >= 55 ? 'Teamwork was OK, with some friction.' : 'There was real friction on this team. Let\'s talk about collaboration.'));
  }

  // ── Help ───────────────────────────────────────────────
  function askMentor(id) {
    const j = J();
    const task = taskById(id);
    const r = rec(id);
    const mentor = cast().mentor;
    if (!j.clockedIn) return { who: mentor, text: 'Badge in first!', cost: 0 };
    if (r.hintsUsed >= task.hints.length) {
      spend(5);
      return { who: mentor, text: 'I\'ve given you all my hints on this one! Try explaining it out loud, or check the wiki.', cost: 5 };
    }
    const rnd = U.seeded(S().seed + j.day * 31 + j.minute);
    if (rnd() < 0.12) {
      spend(2);
      return { who: mentor, text: '(Away) In a design review. Try again later, or ask a fellow intern!', cost: 2 };
    }
    const hint = task.hints[r.hintsUsed];
    r.hintsUsed++;
    j.stats.helpAsked++;
    changeRel(mentor, r.hintsUsed === 1 ? 2 : 1);
    spend(15);
    return { who: mentor, text: hint, cost: 15 };
  }

  function askPeer(id, who) {
    const j = J();
    const task = taskById(id);
    const r = rec(id);
    const peer = who || task.peer.who;
    if (!j.clockedIn) return { who: peer, text: 'Badge in first!', cost: 0 };
    const text = peer === task.peer.who ? task.peer.text
      : U.pick(['Hmm, I haven\'t done that one yet. Maybe ask ' + IS.characters[task.peer.who].short + '? They were talking about it.', 'I\'d start by writing out the edge cases. That\'s what saved me.', 'Honestly? Check the wiki page for it, then ask the mentor.']);
    if (!r.peerAsked) changeRel(peer, 2);
    r.peerAsked = true;
    j.stats.helpAsked++;
    spend(10);
    return { who: peer, text, cost: 10 };
  }

  function searchWiki(id) {
    const j = J();
    if (!j.clockedIn) return { text: 'Badge in first to reach the internal wiki.', cost: 0 };
    spend(5);
    return { who: null, html: taskById(id).wiki, cost: 5 };
  }

  const hasDuck = () => S().desk.includes('duck');
  function askDuck(id) {
    const j = J();
    const task = taskById(id);
    const r = rec(id);
    if (!j.clockedIn || !hasDuck()) return null;
    if (j.duckDay === j.day) return { who: null, text: '🦆 The duck has already heard your problems today.', cost: 0 };
    if (r.hintsUsed >= task.hints.length) return { who: null, text: '🦆 You explain everything to the duck and realize you already know it all.', cost: 0 };
    j.duckDay = j.day;
    const hint = task.hints[r.hintsUsed];
    r.hintsUsed++;
    spend(5);
    return { who: null, text: '🦆 While explaining the problem to your rubber duck, it hits you: ' + hint, cost: 5 };
  }

  function requestExtension(id) {
    const j = J();
    const task = taskById(id);
    const r = rec(id);
    const mgr = cast().manager;
    if (!j.clockedIn) return { ok: false, text: 'Badge in first.' };
    if (r.extRequested) return { ok: false, text: 'You already asked for an extension on this one.' };
    if (now() > dueAbs(task)) return { ok: false, text: 'The deadline already passed. Extensions must be requested before the due date.' };
    r.extRequested = true;
    spend(5);
    if (task.type === 'presentation' || task.urgent) {
      addInbox(mgr, 'Re: Extension request: ' + task.title, task.urgent
        ? 'I can\'t extend this one. It\'s a live incident. Your mentor can pair with you if you\'re stuck.'
        : 'Presentation times are booked with the audience and can\'t move. Want a practice run with your mentor?', id);
      return { ok: false, text: 'Denied: this deadline can\'t move.' };
    }
    const rnd = U.seeded(S().seed + j.day * 101 + id.length * 13 + j.minute);
    const chance = U.clamp(0.4 + (rel(mgr) - 50) / 100 - 0.08 * j.stats.lateCount, 0.1, 0.9);
    if (rnd() < chance) {
      r.extDays = 1;
      addInbox(mgr, 'Re: Extension request: ' + task.title, `Thanks for asking ahead of time. That's the right move. New due date: ${U.dueLabel(effectiveDue(task))}.`, id);
      changeRel(mgr, 1);
      return { ok: true, text: 'Approved! +1 workday.' };
    }
    addInbox(mgr, 'Re: Extension request: ' + task.title, 'I appreciate you asking early, but other work depends on this one. Ask your mentor if you\'re stuck.', id);
    return { ok: false, text: 'Denied: it\'s needed on time.' };
  }

  // ── Social ─────────────────────────────────────────────
  function chat(npc) {
    const j = J();
    if (!j.clockedIn) return { text: 'Hey! Badge in with Marcus first. Then let\'s talk.' };
    if (remaining() < 1) return { text: 'We\'re out of time today. Let\'s catch up tomorrow!' };
    const c = IS.characters[npc];
    const line = U.pick(c.chat);
    if (!j.chattedToday[npc]) {
      j.chattedToday[npc] = true;
      changeRel(npc, 3);
    }
    if (!j.stats.metNpc[npc]) {
      j.stats.metNpc[npc] = true;
      j.stats.networking++;
    }
    checkAchievements();
    return { text: line };
  }

  function itHelp() {
    const j = J();
    if (!j.clockedIn) return { text: 'Badge in first and I\'ll take a look.' };
    if (j.flags.itBoostDay === j.day) return { text: 'Your laptop is already tuned up today. It\'s purring.' };
    j.flags.itBoostDay = j.day;
    spend(10);
    return { text: 'Cleared your caches, killed 43 zombie processes, and updated your IDE. +5% productivity for the rest of today.' };
  }

  // ── Store ──────────────────────────────────────────────
  function buy(itemId) {
    const s = S();
    const j = J();
    const it = IS.store.byId(itemId);
    if (!it) return { ok: false, text: 'Unknown item' };
    const wearable = ['outfit', 'hat', 'accessory'].includes(it.cat);
    if ((wearable || it.cat === 'desk') && s.owned.includes(it.id)) return { ok: false, text: 'You already own this.' };
    if (s.wallet < it.price) return { ok: false, text: `Not enough money. You have ${U.money(s.wallet)}.` };
    if (it.cat === 'cafe' && !(j && j.clockedIn)) return { ok: false, text: 'The café is for people on the clock. Badge in first!' };
    if (it.cat === 'cafe' && remaining() < 3) return { ok: false, text: 'Not enough time left today.' };
    if (it.cat === 'experience' && j && j.clockedIn) return { ok: false, text: 'Outings happen after work.' };
    s.wallet = Math.round((s.wallet - it.price) * 100) / 100;
    if (wearable) {
      s.owned.push(it.id);
      s.equipped[it.cat] = it.id;
    } else if (it.cat === 'desk') {
      s.owned.push(it.id);
      s.desk.push(it.id);
      if (it.effect && it.effect.teamRel && j) cast().interns.forEach((k) => changeRel(k, it.effect.teamRel));
    } else if (it.cat === 'cafe') {
      j.stats.cafe++;
      const e = Object.assign({}, it.effect);
      delete e.time; // the break itself takes real time
      applyEffects(e);
    } else if (it.cat === 'experience') {
      if (j) applyEffects(it.effect);
      else if (it.effect.teamRel) applyEffects({});
      s.scrapbook.push({ level: j ? j.level : s.career.level, day: j ? j.day : 0, text: it.memory, emoji: it.emoji });
      if (['roadtrip', 'cruise'].includes(it.id)) s.flags = Object.assign(s.flags || {}, { trip: true });
    }
    checkAchievements();
    IS.state.save();
    return { ok: true, text: `Bought ${it.name}!` };
  }

  function equip(itemId) {
    const s = S();
    const it = IS.store.byId(itemId);
    if (!it || !s.owned.includes(itemId)) return;
    if (it.cat === 'desk') {
      if (s.desk.includes(itemId)) s.desk = s.desk.filter((x) => x !== itemId);
      else s.desk.push(itemId);
    } else {
      s.equipped[it.cat] = s.equipped[it.cat] === itemId && it.cat !== 'outfit' ? null : itemId;
    }
    checkAchievements();
    IS.state.save();
  }

  // ── Grades & awards ────────────────────────────────────
  function gradeSummary(filter) {
    const j = J();
    if (!j) return { avg: 0, count: 0 };
    const scores = tasks().filter((t) => {
      const r = j.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') && (!filter || filter(t));
    }).map((t) => j.tasks[t.id].score);
    return { avg: U.avg(scores), count: scores.length };
  }

  function grantAward(id, note) {
    const s = S();
    const a = IS.awards.byId(id);
    const j = J();
    const level = j ? j.level : s.career.level;
    const isAch = IS.awards.achievements.some((x) => x.id === id);
    if (isAch && s.awards.some((x) => x.id === id)) return;
    if (!isAch && id !== 'spot' && s.awards.some((x) => x.id === id && x.level === level)) return;
    s.awards.push({ id, level, day: j ? j.day : 0, note: note || '' });
    s.pendingCeremonies.push({ id, note: note || '' });
    if (id !== 'spot') s.scrapbook.push({ level, day: j ? j.day : 0, text: 'Won the ' + a.name + '!', emoji: a.icon });
  }

  function checkAchievements() {
    const s = S();
    const j = J();
    if (!j) return;
    const tk = tasks();
    const graded = (t) => (j.tasks[t.id] && j.tasks[t.id].status === 'graded' ? j.tasks[t.id].score : -1);
    if (tk.some((t) => ['coding', 'sql', 'terminal', 'web', 'config'].includes(t.type) && graded(t) >= 0)) grantAward('first_commit');
    if (tk.some((t) => graded(t) === 100)) grantAward('perfect');
    if (j.stats.earlyCount > 0) grantAward('early_bird');
    if (j.stats.cafe >= 10) grantAward('caffeinated');
    if (s.flags && s.flags.trip) grantAward('globetrotter');
    if (s.owned.filter((id) => ['outfit', 'hat', 'accessory'].includes((IS.store.byId(id) || {}).cat)).length >= 5) grantAward('best_dressed');
    if (s.desk.length >= 5) grantAward('desk_designer');
    const inc = tk.find((t) => t.urgent);
    if (inc && j.tasks[inc.id] && j.tasks[inc.id].status === 'graded' && j.tasks[inc.id].score >= 90 && !j.tasks[inc.id].late) grantAward('firefighter');
    const bugs = tk.filter((t) => t.bugfix);
    if (bugs.length && bugs.every((t) => graded(t) >= 90)) grantAward('bug_squasher');
    const reviews = tk.filter((t) => t.type === 'review');
    if (reviews.length >= 2 && reviews.every((t) => graded(t) >= 90)) grantAward('reviewer');
    if (j.stats.networking >= 8) grantAward('networker');
    if (tk.some((t) => t.optional && graded(t) >= 0)) grantAward('overachiever');
    if (s.career.history.filter((h) => h.offer === 'offer').length >= 3) grantAward('polyglot');
  }

  function finalResult() {
    const j = J();
    if (j.final) return j.final;
    const tk = tasks();
    const required = tk.filter((t) => !t.optional && !t.daily);
    const score = (t) => {
      const r = j.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') ? r.score : 0;
    };
    // Final grade: 75% assignments, 10% daily tickets, 15% daily standups.
    const taskAvg = U.avg(required.map(score));
    const tickets = tk.filter((t) => t.daily);
    const ticketAvg = tickets.length ? U.avg(tickets.map(score)) : taskAvg;
    const suAvg = IS.meetings.standupAvg(j);
    const overall = 0.75 * taskAvg + 0.1 * ticketAvg + 0.15 * (suAvg == null ? taskAvg : suAvg);
    const byCat = (pred) => {
      const list = tk.filter((t) => pred(t) && j.tasks[t.id] && ['graded', 'missed'].includes(j.tasks[t.id].status));
      return list.length ? U.avg(list.map(score)) : 0;
    };
    const interns = cast().interns;
    const internRel = U.avg(interns.map(rel));
    const groupHealth = U.avg([j.groups.g1.health, j.groups.g2.health]);
    const groupGrade = U.avg([j.groups.g1.grade || 0, j.groups.g2.grade || 0]);
    const stretch = tk.filter((t) => t.optional).map((t) => (j.tasks[t.id] && j.tasks[t.id].status === 'graded' ? j.tasks[t.id].score : 0))[0] || 0;
    const player = {
      intern_of_summer: overall - 2 * j.stats.lateCount,
      code_craft: byCat((t) => ['coding', 'sql', 'terminal', 'web', 'config'].includes(t.type)),
      storyteller: byCat((t) => t.type === 'presentation'),
      team_spirit: 0.35 * internRel + 0.35 * groupHealth + 0.3 * groupGrade + 8,
      blue_sky: 0.55 * byCat((t) => t.category === 'Design') + 0.45 * stretch,
      right_on_cue: 100 - 12 * j.stats.lateCount - 25 * j.stats.missedCount + 2 * j.stats.earlyCount,
      curious_mind: Math.min(50, j.stats.helpAsked * 4) + Math.min(50, j.stats.networking * 6),
    };
    Object.keys(player).forEach((k) => { player[k] = U.clamp(player[k], 0, 100); });
    const rnd = U.seeded(S().seed + j.level * 7);
    const categories = IS.awards.finals.map((cat) => {
      const nominees = interns.map((k, i) => ({ id: k, score: IS.awards.npc[i][cat.id] + (rnd() - 0.5) * 6 }));
      nominees.push({ id: 'player', score: player[cat.id] });
      nominees.sort((a, b) => b.score - a.score);
      const top = nominees.slice(0, 3);
      if (!top.some((n) => n.id === 'player')) {
        const p = nominees.find((n) => n.id === 'player');
        if (p.score >= top[2].score - 8) top[2] = p;
      }
      return { id: cat.id, winner: nominees[0].id, nominees: top, all: nominees, playerScore: player[cat.id] };
    });
    const offer = overall >= 85 && j.stats.missedCount <= 1 && rel(cast().manager) >= 50 ? 'offer' : overall >= 75 ? 'maybe' : 'none';
    j.final = { overall, offer, categories, gradedCount: required.filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'graded').length };
    categories.filter((c) => c.winner === 'player').forEach((c) => {
      const a = IS.awards.byId(c.id);
      S().awards.push({ id: c.id, level: j.level, day: j.day, note: 'Awards Ceremony' });
      S().scrapbook.push({ level: j.level, day: j.day, text: 'Won the ' + a.name + ' at the awards ceremony!', emoji: a.icon });
    });
    IS.state.save();
    return j.final;
  }

  return {
    LATE_FEE, MISSED_FEE, track, tasks, taskById, cast, team, resolve, now, rec, dueAbs, effectiveDue, productivity, bonus, remaining, dayLen,
    applyEffects, changeRel, rel, advance, spend, passMinute, clockIn, clockOut, canSubmit, submit, startJob, finishJob,
    askMentor, askPeer, searchWiki, askDuck, hasDuck, requestExtension, chat, itHelp, buy, equip,
    gradeSummary, grantAward, checkAchievements, finalResult, addInbox, label,
  };
})();
