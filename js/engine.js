// Game rules: time, energy, pay, deadlines, grading consequences, store, awards.
// The UI calls these functions and then re-renders; the engine never touches the DOM
// except through IS.ui.toast (if present).
IS.engine = (function () {
  const U = IS.util;
  const LAST_DAY = 30;
  const LATE_FEE = 10;
  const MISSED_FEE = 25;
  const TAX_RATE = 0.1265; // FICA 7.65% + ~5% estimated income tax withholding
  const SPOT_BONUS = 50;
  const WORK_DRAIN = 0.4;
  const MEETING_DRAIN = 0.15;

  const st = () => IS.state.get();
  const toast = (msg, kind) => IS.ui && IS.ui.toast && IS.ui.toast(msg, kind);

  function now() {
    const s = st();
    return U.abs(s.day, s.minute);
  }

  function rec(id) {
    return st().tasks[id];
  }

  function dueAbs(task) {
    const r = rec(task.id);
    return U.abs(task.due.day, task.due.minute) + ((r && r.extDays) || 0) * U.DAY_LENGTH;
  }

  function effectiveDue(task) {
    const r = rec(task.id);
    const ext = (r && r.extDays) || 0;
    return { day: task.due.day + ext, minute: task.due.minute };
  }

  // Sum a passive bonus across displayed desk items and worn items.
  function bonus(key) {
    const s = st();
    const ids = s.desk.concat([s.equipped.outfit, s.equipped.hat, s.equipped.accessory].filter(Boolean));
    return ids.reduce((sum, id) => {
      const it = IS.store.byId(id);
      return sum + ((it && it.effect && it.effect[key]) || 0);
    }, 0);
  }

  function productivity() {
    const s = st();
    let p = 0.5 + 0.5 * (s.energy / 100);
    if (s.morale >= 70) p += 0.05;
    if (s.morale < 30) p -= 0.1;
    p += Math.min(0.25, bonus('productivity'));
    return U.clamp(p, 0.3, 1.4);
  }

  function addInbox(from, subject, body, taskId) {
    const s = st();
    s.inbox.unshift({ id: U.uid(), from, subject, body, day: s.day, minute: s.minute, read: false, taskId: taskId || null });
  }

  function changeRel(id, d) {
    const s = st();
    if (s.rel[id] == null) return;
    s.rel[id] = U.clamp(s.rel[id] + d, 0, 100);
  }

  function applyEffects(e) {
    if (!e) return;
    const s = st();
    if (e.rel) Object.keys(e.rel).forEach((k) => changeRel(k, e.rel[k]));
    if (e.teamRel) IS.INTERNS.forEach((k) => changeRel(k, e.teamRel));
    if (e.morale) s.morale = U.clamp(s.morale + e.morale, 0, 100);
    if (e.energy) s.energy = U.clamp(s.energy + e.energy, 0, 100);
    if (e.health) Object.keys(e.health).forEach((g) => { s.groups[g].health = U.clamp(s.groups[g].health + e.health[g], 0, 100); });
    if (e.flag) s.flags[e.flag] = true;
    if (e.networking) s.stats.networking += e.networking;
    if (e.money) s.wallet += e.money;
    if (e.time && s.clockedIn) advance(e.time, 'meeting');
    checkAchievements();
  }

  // ── Time ───────────────────────────────────────────────
  function advance(mins, kind) {
    const s = st();
    if (!s.clockedIn || mins <= 0) return false;
    const used = Math.min(mins, U.DAY_LENGTH - s.minute);
    s.minute += used;
    const drain = (kind === 'work' ? WORK_DRAIN : MEETING_DRAIN) * (1 + bonus('drain'));
    s.energy = U.clamp(s.energy - used * drain, 0, 100);
    checkDeadlines(now());
    return s.minute >= U.DAY_LENGTH;
  }

  function remaining() {
    const s = st();
    return U.DAY_LENGTH - s.minute;
  }

  function checkDeadlines(t) {
    const s = st();
    IS.tasks.forEach((task) => {
      const r = s.tasks[task.id];
      if (!r || r.status !== 'assigned') return;
      const due = dueAbs(task);
      if (task.optional) {
        if (t > due) {
          r.status = 'expired';
          addInbox(task.from, 'Stretch task closed: ' + task.title, 'No worries. It was optional! The window for this stretch task has closed.', task.id);
        }
        return;
      }
      if (t > due && !r.late) {
        r.late = true;
        s.stats.lateCount++;
        const wk = U.weekOf(s.day);
        s.stats.lateByWeek[wk] = (s.stats.lateByWeek[wk] || 0) + 1;
        s.period.deductions.push({ label: 'Late: ' + task.title, amount: LATE_FEE });
        s.morale = U.clamp(s.morale - 5, 0, 100);
        changeRel('maya', -3);
        addInbox('maya', '⚠️ Past due: ' + task.title,
          `This was due ${U.dueLabel(effectiveDue(task))} and I don't have it yet. Late work loses 10% per workday late, and there's a ${U.money(LATE_FEE)} pay adjustment on this week's check. After two workdays it's marked missed. Please get it in ASAP.`, task.id);
        toast('⚠️ Deadline missed: ' + task.title + ` (−${U.money(LATE_FEE)})`, 'bad');
      }
      if (t > due + 2 * U.DAY_LENGTH) {
        r.status = 'missed';
        r.score = 0;
        s.stats.missedCount++;
        s.period.deductions.push({ label: 'Missed: ' + task.title, amount: MISSED_FEE });
        changeRel('maya', -5);
        s.morale = U.clamp(s.morale - 8, 0, 100);
        addInbox('maya', '❌ Marked missed: ' + task.title,
          `This assignment is now more than two workdays late and has been marked as missed (0%). There's an additional ${U.money(MISSED_FEE)} pay adjustment. Let's talk about how to keep this from happening again.`, task.id);
        toast('❌ Assignment missed: ' + task.title + ` (−${U.money(MISSED_FEE)})`, 'bad');
      }
    });
  }

  // ── Day lifecycle ──────────────────────────────────────
  function clockIn() {
    const s = st();
    if (s.clockedIn || s.over) return [];
    s.clockedIn = true;
    s.minute = 0;
    s.chattedToday = {};
    s.energy = U.clamp(80 + s.morale / 5 + bonus('startEnergy'), 0, 100);
    s.morale = U.clamp(s.morale - 2 + bonus('dailyMorale'), 0, 100);

    IS.tasks.filter((t) => t.day === s.day && !s.tasks[t.id]).forEach((t) => {
      s.tasks[t.id] = { status: 'assigned', progress: 0, hintsUsed: 0, draft: null, late: false, extDays: 0, assignedDay: s.day };
      addInbox(t.from, (t.urgent ? '🚨 ' : '📌 ') + 'New assignment: ' + t.title,
        `You have a new ${t.kind === 'group' ? 'group' : 'individual'} ${label(t.type)}${t.optional ? ' (optional stretch)' : ''}. Due ${U.dueLabel(t.due)}. Estimated focus time: ${t.effort} min. Open it from the Task Board.`, t.id);
    });

    const scenes = [];
    const d = s.day;
    if (d === 1) scenes.push(IS.scenes.onboarding);
    else if (d !== LAST_DAY) scenes.push(IS.scenes.standup(s));
    const special = {
      5: ['oneOnOne1'], 6: ['g1Kickoff'], 9: ['g1Event'], 16: ['midpointReview', 'g2Kickoff'],
      19: ['g2Event'], 22: ['incident'], 26: ['g2Conflict'], 30: ['finalReview', 'CEREMONY', 'farewell'],
    }[d];
    if (special) {
      special.forEach((k) => scenes.push(k === 'CEREMONY' ? 'CEREMONY' : (typeof IS.scenes[k] === 'function' ? IS.scenes[k](s) : IS.scenes[k])));
    } else if (d > 1 && d < LAST_DAY) {
      const rnd = U.seeded(s.seed + d * 7919);
      if (rnd() < 0.45) {
        const pool = IS.scenes.random.filter((r) => !r.when || r.when(s));
        scenes.push(U.pick(pool, rnd).scene);
      }
    }
    IS.state.save();
    return scenes;
  }

  function label(type) {
    return { coding: 'coding assignment', quiz: 'training quiz', review: 'code review', written: 'writing assignment', presentation: 'presentation' }[type] || 'assignment';
  }

  // Returns a summary of the day (and paystub on Fridays).
  function clockOut() {
    const s = st();
    if (!s.clockedIn) return null;
    const minutes = s.minute;
    const pay = Math.round(minutes / 60 * s.rate * 100) / 100;
    s.period.days.push({ day: s.day, minutes, pay });
    checkDeadlines(U.abs(s.day, U.DAY_LENGTH) + 1);
    s.clockedIn = false;
    const summary = { day: s.day, minutes, pay, early: minutes < U.DAY_LENGTH };

    if (U.isFriday(s.day) || s.day === LAST_DAY) {
      summary.spot = weeklySpotAward();
      summary.paystub = runPayroll();
      s.morale = U.clamp(s.morale + 5, 0, 100);
    }
    if (s.day >= LAST_DAY) {
      s.over = true;
    } else {
      s.day++;
      s.minute = 0;
    }
    IS.state.save();
    return summary;
  }

  function weeklySpotAward() {
    const s = st();
    const wk = U.weekOf(s.day);
    const graded = IS.tasks.filter((t) => {
      const r = s.tasks[t.id];
      return r && r.status === 'graded' && U.weekOf(r.submittedDay) === wk;
    });
    if (graded.length < 2) return null;
    const avg = U.avg(graded.map((t) => s.tasks[t.id].score));
    if (avg >= 90 && !s.stats.lateByWeek[wk]) {
      s.period.bonuses.push({ label: 'Pixie Dust Spot Award (Week ' + wk + ')', amount: SPOT_BONUS });
      grantAward('spot', 'Week ' + wk + ': ' + Math.round(avg) + '% average, nothing late');
      return { week: wk, avg };
    }
    return null;
  }

  function runPayroll() {
    const s = st();
    const p = s.period;
    const minutes = p.days.reduce((a, d) => a + d.minutes, 0);
    const gross = p.days.reduce((a, d) => a + d.pay, 0);
    const bonuses = p.bonuses.reduce((a, b) => a + b.amount, 0);
    const deductions = p.deductions.reduce((a, b) => a + b.amount, 0);
    const taxes = Math.round((gross + bonuses) * TAX_RATE * 100) / 100;
    const net = Math.max(0, Math.round((gross + bonuses - taxes - deductions) * 100) / 100);
    const stub = {
      week: U.weekOf(s.day), hours: minutes / 60, rate: s.rate, gross, bonuses, taxes, deductions, net,
      bonusItems: p.bonuses.slice(), deductionItems: p.deductions.slice(), days: p.days.slice(),
    };
    s.paystubs.push(stub);
    s.wallet += net;
    s.period = { days: [], deductions: [], bonuses: [] };
    addInbox('rosa', '💵 Paycheck deposited: Week ' + stub.week,
      `Your paycheck of ${U.money(net)} has been deposited. Gross ${U.money(gross)} for ${stub.hours.toFixed(2)} hrs` +
      (bonuses ? `, bonuses ${U.money(bonuses)}` : '') + (deductions ? `, adjustments −${U.money(deductions)}` : '') +
      `, taxes −${U.money(taxes)}. See the Paystubs page for details.`);
    return stub;
  }

  // ── Working on tasks ───────────────────────────────────
  function workOn(id, mins) {
    const s = st();
    const r = rec(id);
    const task = IS.taskById(id);
    if (!s.clockedIn || !r || r.status !== 'assigned') return null;
    const used = Math.min(mins, remaining());
    if (used <= 0) return null;
    const gained = used * productivity();
    r.progress = Math.min(task.effort, r.progress + gained);
    const ended = advance(used, 'work');
    IS.state.save();
    return { used, gained, ended };
  }

  function spend(mins) {
    const ended = advance(mins, 'meeting');
    IS.state.save();
    return ended;
  }

  function canSubmit(id) {
    const s = st();
    const r = rec(id);
    const task = IS.taskById(id);
    if (!r || r.status !== 'assigned') return { ok: false, why: 'Not open' };
    if (!s.clockedIn) return { ok: false, why: 'Clock in to submit work.' };
    if (r.progress < task.effort - 0.01) return { ok: false, why: `Log more focus time first (${Math.floor(r.progress)}/${task.effort} min).` };
    if (remaining() < 5) return { ok: false, why: 'Not enough time left today (submitting takes 5 min).' };
    return { ok: true };
  }

  // result: output of an IS.grading function. submission: what to store.
  function submit(id, result, submission) {
    const s = st();
    const r = rec(id);
    const task = IS.taskById(id);
    advance(5, 'meeting');
    const t = now();
    const due = dueAbs(task);
    const daysLate = t > due ? Math.ceil((t - due) / U.DAY_LENGTH) : 0;
    const penalty = daysLate * 10;
    r.rawScore = result.score;
    r.penalty = penalty;
    r.score = Math.max(0, result.score - penalty);
    r.breakdown = result.breakdown;
    r.notes = result.notes;
    r.submission = submission;
    r.status = 'graded';
    r.submittedDay = s.day;
    r.submittedMinute = s.minute;
    r.submittedAbs = t;
    r.daysLate = daysLate;
    if (due - t >= U.DAY_LENGTH) {
      r.early = true;
      s.stats.earlyCount++;
    }
    changeRel(task.from === 'harriet' ? 'maya' : task.from, Math.round((r.score - 70) / 8));
    if (r.score >= 90) s.morale = U.clamp(s.morale + 5, 0, 100);
    else if (r.score < 60) s.morale = U.clamp(s.morale - 6, 0, 100);

    const from = task.from;
    addInbox(from, `${U.letter(r.score)} (${r.score}%): ${task.title}`, feedbackText(task, r), id);

    if (task.group && task.type === 'presentation') finalizeGroup(task.group, r.score);
    checkAchievements();
    IS.state.save();
    return r;
  }

  function feedbackText(task, r) {
    const c = IS.characters[task.from];
    const lines = [];
    if (r.score >= 95) lines.push(U.pick(['Outstanding work. This is exactly what I was hoping for.', 'Wow. This is production quality. Really nice.', 'Excellent. I\'m sharing this with the team as an example.']));
    else if (r.score >= 85) lines.push(U.pick(['Great job. Just a couple of small things to tighten up.', 'Really solid work. See the notes for a few improvements.']));
    else if (r.score >= 70) lines.push(U.pick(['Decent start, but there are some gaps. Take a look at the breakdown.', 'This works in parts. Let\'s talk through what was missed.']));
    else lines.push(U.pick(['This needs significant work. Please review the breakdown and ask Dev for help next time.', 'This didn\'t meet the bar. Let\'s figure out what went wrong together.']));
    if (r.penalty) lines.push(`Submitted ${r.daysLate} workday${r.daysLate > 1 ? 's' : ''} late: −${r.penalty}% late penalty applied.`);
    if (r.early) lines.push('And a full day early. Love that.');
    (r.notes || []).slice(0, 3).forEach((n) => lines.push('• ' + n));
    lines.push('— ' + c.short);
    return lines.join('\n');
  }

  function finalizeGroup(gid, presScore) {
    const s = st();
    const g = s.groups[gid];
    const parts = IS.tasks.filter((t) => t.group === gid && t.type !== 'presentation').map((t) => {
      const r = s.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') ? r.score : 0;
    });
    g.grade = Math.round(0.5 * presScore + 0.3 * U.avg(parts) + 0.2 * g.health);
    g.parts = parts;
    g.presentation = presScore;
    const name = gid === 'g1' ? 'Queue Time Display Board' : 'Guest Flow Optimizer';
    addInbox('maya', `👥 Group grade: ${name}: ${U.letter(g.grade)} (${g.grade}%)`,
      `Group project grade = 50% presentation (${presScore}%) + 30% your deliverables (${Math.round(U.avg(parts))}%) + 20% team health (${g.health}%).\n` +
      (g.health >= 80 ? 'Your team worked really well together.' : g.health >= 55 ? 'Teamwork was OK, with some friction.' : 'There was real friction on this team. Let\'s talk about collaboration.'));
  }

  // ── Help ───────────────────────────────────────────────
  function askMentor(id) {
    const s = st();
    const task = IS.taskById(id);
    const r = rec(id);
    if (!s.clockedIn) return { text: 'Dev is not online. Clock in first.', cost: 0 };
    if (r.hintsUsed >= task.hints.length) {
      spend(5);
      return { who: 'dev', text: 'I\'ve given you all my hints on this one! Try explaining the problem to yourself out loud, or check the wiki.', cost: 5 };
    }
    const rnd = U.seeded(s.seed + s.day * 31 + s.minute);
    if (rnd() < 0.15) {
      spend(2);
      return { who: 'dev', text: '(Auto-reply) In a design review until later. Try the wiki or a fellow intern meanwhile!', cost: 2 };
    }
    const hint = task.hints[r.hintsUsed];
    r.hintsUsed++;
    s.stats.helpAsked++;
    changeRel('dev', r.hintsUsed === 1 ? 2 : 1);
    spend(15);
    return { who: 'dev', text: hint, cost: 15 };
  }

  function askPeer(id) {
    const s = st();
    const task = IS.taskById(id);
    const r = rec(id);
    if (!s.clockedIn) return { text: 'Nobody is online. Clock in first.', cost: 0 };
    if (!r.peerAsked) changeRel(task.peer.who, 2);
    r.peerAsked = true;
    s.stats.helpAsked++;
    spend(10);
    return { who: task.peer.who, text: task.peer.text, cost: 10 };
  }

  function searchWiki(id) {
    const s = st();
    const task = IS.taskById(id);
    if (!s.clockedIn) return { text: 'Clock in to access the internal wiki.', cost: 0 };
    spend(5);
    return { who: null, html: task.wiki, cost: 5 };
  }

  function hasDuck() {
    return st().desk.includes('duck');
  }

  function askDuck(id) {
    const s = st();
    const task = IS.taskById(id);
    const r = rec(id);
    if (!s.clockedIn || !hasDuck()) return null;
    if (s.duckDay === s.day) return { who: null, text: '🦆 The duck has already heard your problems today. It needs rest.', cost: 0 };
    if (r.hintsUsed >= task.hints.length) return { who: null, text: '🦆 You explain everything to the duck… and realize you already know everything it could tell you.', cost: 0 };
    s.duckDay = s.day;
    const hint = task.hints[r.hintsUsed];
    r.hintsUsed++;
    spend(5);
    return { who: null, text: '🦆 While explaining the problem to your rubber duck, it hits you: ' + hint, cost: 5 };
  }

  function requestExtension(id) {
    const s = st();
    const task = IS.taskById(id);
    const r = rec(id);
    if (!s.clockedIn) return { ok: false, text: 'Maya is offline. Clock in first.' };
    if (r.extRequested) return { ok: false, text: 'You already asked for an extension on this one.' };
    if (now() > dueAbs(task)) return { ok: false, text: 'The deadline already passed. Extensions have to be requested before the due date.' };
    r.extRequested = true;
    spend(5);
    if (task.type === 'presentation' || task.urgent) {
      addInbox('maya', 'Re: Extension request: ' + task.title, task.urgent
        ? 'I can\'t extend this one. It\'s a live incident and guests are seeing it right now. Dev can pair with you if you\'re stuck.'
        : 'Sorry, presentation times are booked with the audience and can\'t move. Let me know if you want to do a practice run with Dev.', id);
      return { ok: false, text: 'Denied. This deadline can\'t move.' };
    }
    const rnd = U.seeded(s.seed + s.day * 101 + id.length * 13 + s.minute);
    const chance = U.clamp(0.4 + (s.rel.maya - 50) / 100 - 0.08 * s.stats.lateCount, 0.1, 0.9);
    if (rnd() < chance) {
      r.extDays = 1;
      addInbox('maya', 'Re: Extension request: ' + task.title, `Thanks for asking ahead of time. That's exactly the right move. You have one extra workday: new due date ${U.dueLabel(effectiveDue(task))}.`, id);
      changeRel('maya', 1);
      return { ok: true, text: 'Approved! +1 workday.' };
    }
    addInbox('maya', 'Re: Extension request: ' + task.title, 'I appreciate you asking early, but I need this one on the original date because other work depends on it. Ping Dev if you\'re stuck.', id);
    return { ok: false, text: 'Denied. Maya needs it on time.' };
  }

  // ── Social ─────────────────────────────────────────────
  function chat(npc) {
    const s = st();
    if (!s.clockedIn) return { text: 'Everyone has gone home for the day.' };
    if (remaining() < 10) return { text: 'Not enough time left today for a chat.' };
    const c = IS.characters[npc];
    const line = U.pick(c.chat);
    if (!s.chattedToday[npc]) {
      s.chattedToday[npc] = true;
      changeRel(npc, 3);
    }
    if (!s.stats.metNpc[npc]) {
      s.stats.metNpc[npc] = true;
      s.stats.networking++;
    }
    spend(10);
    checkAchievements();
    return { text: line };
  }

  // ── Store ──────────────────────────────────────────────
  function buy(itemId) {
    const s = st();
    const it = IS.store.byId(itemId);
    if (!it) return { ok: false, text: 'Unknown item' };
    const wearable = ['outfit', 'hat', 'accessory'].includes(it.cat);
    if ((wearable || it.cat === 'desk') && s.owned.includes(it.id)) return { ok: false, text: 'You already own this.' };
    if (s.wallet < it.price) return { ok: false, text: `Not enough money. You have ${U.money(s.wallet)}.` };
    if (it.cat === 'cafe' && !s.clockedIn) return { ok: false, text: 'The Studio Café is only open while you\'re on the clock.' };
    if (it.cat === 'cafe' && remaining() < it.effect.time) return { ok: false, text: 'Not enough time left today.' };
    if (it.cat === 'experience' && s.clockedIn) return { ok: false, text: 'Outings happen after work. Clock out first!' };
    s.wallet = Math.round((s.wallet - it.price) * 100) / 100;
    if (wearable) {
      s.owned.push(it.id);
      s.equipped[it.cat] = it.id;
    } else if (it.cat === 'desk') {
      s.owned.push(it.id);
      s.desk.push(it.id);
      if (it.effect && it.effect.teamRel) IS.INTERNS.forEach((k) => changeRel(k, it.effect.teamRel));
    } else if (it.cat === 'cafe') {
      s.stats.cafe++;
      const e = Object.assign({}, it.effect);
      const t = e.time;
      delete e.time;
      applyEffects(e);
      spend(t);
    } else if (it.cat === 'experience') {
      applyEffects(it.effect);
      s.scrapbook.push({ day: s.day, text: it.memory, emoji: it.emoji });
      if (['roadtrip', 'cruise'].includes(it.id)) s.flags.trip = true;
    }
    checkAchievements();
    IS.state.save();
    return { ok: true, text: `Bought ${it.name}!` };
  }

  function equip(itemId) {
    const s = st();
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
    const s = st();
    const scores = IS.tasks.filter((t) => {
      const r = s.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') && (!filter || filter(t));
    }).map((t) => s.tasks[t.id].score);
    return { avg: U.avg(scores), count: scores.length };
  }

  function grantAward(id, note) {
    const s = st();
    const a = IS.awards.byId(id);
    if (id !== 'spot' && s.awards.some((x) => x.id === id)) return;
    s.awards.push({ id, day: s.day, note: note || '' });
    s.pendingCeremonies.push({ id, note: note || '' });
    if (id !== 'spot') s.scrapbook.push({ day: s.day, text: 'Won the ' + a.name + '!', emoji: a.icon });
  }

  function checkAchievements() {
    const s = st();
    const graded = (id) => s.tasks[id] && s.tasks[id].status === 'graded' ? s.tasks[id].score : -1;
    const codingDone = IS.tasks.some((t) => t.type === 'coding' && s.tasks[t.id] && s.tasks[t.id].status === 'graded');
    if (codingDone) grantAward('first_commit');
    if (IS.tasks.some((t) => graded(t.id) === 100)) grantAward('perfect');
    if (s.stats.earlyCount > 0) grantAward('early_bird');
    if (s.stats.cafe >= 10) grantAward('caffeinated');
    if (s.flags.trip) grantAward('globetrotter');
    if (s.owned.filter((id) => ['outfit', 'hat', 'accessory'].includes((IS.store.byId(id) || {}).cat)).length >= 5) grantAward('best_dressed');
    if (s.desk.length >= 5) grantAward('desk_designer');
    const c12 = s.tasks.c12;
    if (c12 && c12.status === 'graded' && c12.score >= 90 && !c12.late) grantAward('firefighter');
    if (['c3', 'c7', 'c12'].every((id) => graded(id) >= 90)) grantAward('bug_squasher');
    if (['r1', 'r2', 'r3'].every((id) => graded(id) >= 90)) grantAward('reviewer');
    if (s.stats.networking >= 8) grantAward('networker');
    if (graded('c9') >= 0) grantAward('overachiever');
  }

  function finalResult() {
    const s = st();
    if (s.final) return s.final;
    const required = IS.tasks.filter((t) => !t.optional);
    const score = (t) => {
      const r = s.tasks[t.id];
      return r && (r.status === 'graded' || r.status === 'missed') ? r.score : 0;
    };
    const overall = U.avg(required.map(score));
    const byCat = (pred) => {
      const list = IS.tasks.filter((t) => pred(t) && s.tasks[t.id] && ['graded', 'missed'].includes(s.tasks[t.id].status));
      return list.length ? U.avg(list.map(score)) : 0;
    };
    const internRel = U.avg(IS.INTERNS.map((k) => s.rel[k]));
    const groupHealth = U.avg([s.groups.g1.health, s.groups.g2.health]);
    const groupGrade = U.avg([s.groups.g1.grade || 0, s.groups.g2.grade || 0]);
    const stretch = s.tasks.c9 && s.tasks.c9.status === 'graded' ? s.tasks.c9.score : 0;
    const player = {
      intern_of_summer: overall - 2 * s.stats.lateCount,
      code_craft: byCat((t) => t.type === 'coding'),
      storyteller: byCat((t) => t.type === 'presentation'),
      team_spirit: 0.35 * internRel + 0.35 * groupHealth + 0.3 * groupGrade + 8,
      blue_sky: 0.55 * byCat((t) => t.category === 'Design') + 0.45 * stretch,
      right_on_cue: U.clamp(100 - 12 * s.stats.lateCount - 25 * s.stats.missedCount + 2 * s.stats.earlyCount, 0, 100),
      curious_mind: Math.min(50, s.stats.helpAsked * 4) + Math.min(50, s.stats.networking * 6),
    };
    Object.keys(player).forEach((k) => { player[k] = U.clamp(player[k], 0, 100); });
    const rnd = U.seeded(s.seed);
    const categories = IS.awards.finals.map((cat) => {
      const nominees = IS.INTERNS.map((k) => ({ id: k, score: IS.awards.npc[k][cat.id] + (rnd() - 0.5) * 6 }));
      nominees.push({ id: 'player', score: player[cat.id] });
      nominees.sort((a, b) => b.score - a.score);
      return { id: cat.id, winner: nominees[0].id, nominees: nominees.slice(0, 3), all: nominees, playerScore: player[cat.id] };
    });
    // Make sure the player is shown as a nominee if they came close.
    categories.forEach((c) => {
      if (!c.nominees.some((n) => n.id === 'player')) {
        const p = c.all.find((n) => n.id === 'player');
        if (p.score >= c.nominees[2].score - 8) c.nominees[2] = p;
      }
    });
    const offer = overall >= 85 && s.stats.missedCount <= 1 && s.rel.maya >= 50 ? 'offer' : overall >= 75 ? 'maybe' : 'none';
    s.final = { overall, offer, categories, gradedCount: required.filter((t) => s.tasks[t.id] && s.tasks[t.id].status === 'graded').length };
    categories.filter((c) => c.winner === 'player').forEach((c) => {
      const a = IS.awards.byId(c.id);
      s.awards.push({ id: c.id, day: s.day, note: 'Awards Ceremony' });
      s.scrapbook.push({ day: s.day, text: 'Won the ' + a.name + ' at the awards ceremony!', emoji: a.icon });
    });
    IS.state.save();
    return s.final;
  }

  return {
    LAST_DAY, LATE_FEE, MISSED_FEE, now, rec, dueAbs, effectiveDue, productivity, bonus, remaining,
    applyEffects, advance, spend, clockIn, clockOut, workOn, canSubmit, submit,
    askMentor, askPeer, searchWiki, askDuck, hasDuck, requestExtension, chat, buy, equip,
    gradeSummary, grantAward, checkAchievements, finalResult, addInbox,
  };
})();
