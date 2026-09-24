// Dialogue scenes, templated so every internship track reuses them with its
// own cast and projects. A scene is { title, place, time, steps, effects, after }.
//   { who, text }                      a line (who: role key or character id; text may be fn())
//   { choices: [{ text, effects, reply }] }
// Role keys: manager, mentor, intern1..intern4 (resolved by IS.engine.resolve).
IS.scenes = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const n = (role) => IS.characters[E().resolve(role)].short;
  const full = (role) => IS.characters[E().resolve(role)].name;
  const me = () => IS.state.get().player.name;

  function nextDue(s) {
    const j = s.job;
    const open = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'assigned');
    open.sort((a, b) => E().dueAbs(a) - E().dueAbs(b));
    return open[0];
  }
  function lastDone(s) {
    const j = s.job;
    const done = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'graded');
    done.sort((a, b) => j.tasks[b.id].submittedAbs - j.tasks[a.id].submittedAbs);
    return done[0];
  }

  function onboarding(t) {
    const returning = IS.state.get().career.history.length > 0;
    return {
      title: `Day 1: Welcome to ${t.team}`, place: '🏛️ Studio Lobby', time: 40,
      steps: [
        { who: 'rosa', text: returning ? `${me()}! Welcome back. Internship #${t.n}: ${t.title} on ${t.team}. New team, new language, same badge.` : `Welcome, ${me()}! I'm Rosa, I run the intern program. Here's your badge. Don't lend it to anyone.` },
        { who: 'rosa', text: `Quick logistics: this internship is 100 hours: 3 hours a day (9:00 AM – 12:00 PM) for 33 days, plus a 1-hour final day for reviews and awards. You're paid ${U.money(t.rate)}/hour, every Friday.` },
        { who: 'rosa', text: 'Deadlines are real. Late work costs grade points and pay, and anything more than two workdays late is marked missed. If you need more time, ask your manager BEFORE the deadline.' },
        { who: 'manager', text: () => `Hi, I'm ${full('manager')}, your manager. ${t.team} is where you'll work in ${t.langLabel}. ${t.blurb}` },
        { choices: [
          { text: 'I\'m excited to be here! What does success look like for an intern on this team?', effects: { rel: { manager: 4 } },
            reply: { who: 'manager', text: 'Deliver quality work on time, tell me early when something\'s off, and ask for help when you\'re stuck. Do those three and you\'ll do great.' } },
          { text: 'Where\'s the coffee?', effects: { morale: 3 },
            reply: { who: 'manager', text: '(laughs) Studio Café, near the lobby. Gus will know your order by day two.' } },
          { text: 'I\'m pretty independent. I\'ll figure most things out myself.', effects: { rel: { manager: -2 } },
            reply: { who: 'manager', text: 'Independence is great, but nobody here builds alone. Use your mentor. That\'s what they\'re for.' } },
        ] },
        { who: 'mentor', text: () => `Hey! I'm ${n('mentor')}, your mentor. My desk is at the end of the open office. Walk over any time you're stuck, or message me from your computer.` },
        { choices: [
          { text: 'Thanks! How do you like people to ask questions?', effects: { rel: { mentor: 4 } },
            reply: { who: 'mentor', text: 'Tell me what you\'re trying to do, what you tried, and what happened. You\'ll often solve it while writing that down.' } },
          { text: 'Cool, I\'ll find you.', effects: { rel: { mentor: 1 } }, reply: { who: 'mentor', text: 'Sounds good!' } },
        ] },
        { who: 'rosa', text: () => `Your cohort: ${[1, 2, 3, 4].map((i) => n('intern' + i)).join(', ')}. Your desk is in the open office. Your computer has your To-Do list, mail and calendar. Walk around, meet people, and have a great first day! ✨` },
      ],
    };
  }

  function standup(t, s) {
    const next = nextDue(s);
    const last = lastDone(s);
    const i = 1 + (s.job.day % 4);
    const lines = [
      'Finished my part of the prototype yesterday, today I\'m writing tests. No blockers!',
      'Uh, yesterday I investigated things. Today I will investigate them more. Productively.',
      'Cleaned the dataset yesterday. Today: building the baseline. Blocked on nothing.',
      'Fixed two flaky sensors in the lab. Today: cable management, the unsung hero of engineering.',
    ];
    return {
      title: 'Daily Standup', place: '🧍 Team huddle, open office', time: 10,
      steps: [
        { who: 'manager', text: U.pick(['Morning, everyone! Quick round. Let\'s keep it snappy.', 'Good morning! Updates, plans, blockers.', 'Hi all! Let\'s go around.']) },
        { who: 'intern' + i, text: lines[i - 1] },
        { who: 'manager', text: `${me()}, what's your update?` },
        { choices: [
          { text: `Yesterday I ${last ? 'wrapped up "' + last.title + '"' : 'got set up'}. Today I'm focused on ${next ? '"' + next.title + '"' : 'reviewing docs and helping out'}. No blockers.`,
            effects: { rel: { manager: 2 } }, reply: { who: 'manager', text: 'Clear and specific. Thanks!' } },
          { text: `I'm working on ${next ? '"' + next.title + '"' : 'my tasks'} and could use 15 minutes with ${n('mentor')} to sanity-check my approach.`,
            effects: { rel: { manager: 2, mentor: 1 } }, reply: { who: 'mentor', text: 'Happy to. Come by my desk any time.' } },
          { text: 'Uh… just working on stuff.', effects: { rel: { manager: -2 } },
            reply: { who: 'manager', text: 'Can you be more specific next time? It helps me spot risks early.' } },
        ] },
      ],
    };
  }

  function oneOnOne(t, s) {
    const g = E().gradeSummary();
    const lates = s.job.stats.lateCount;
    let fb;
    if (!g.count) fb = 'I haven\'t seen much submitted work yet, which worries me a bit. Let\'s make sure you ship things next week.';
    else if (g.avg >= 90) fb = `Honestly? Great first week. You're averaging ${Math.round(g.avg)}%. Clean work, on time.`;
    else if (g.avg >= 80) fb = `Solid first week, averaging ${Math.round(g.avg)}%. A few rough edges, which is normal.`;
    else fb = `A bumpy week, averaging ${Math.round(g.avg)}%. That's OK, but lean on ${n('mentor')} more next week.`;
    return {
      title: `Week 1 Check-in with ${n('manager')}`, place: '☕ Manager\'s office', time: 20,
      steps: [
        { who: 'manager', text: `Thanks for making time, ${me()}. How was your first week?` },
        { who: 'manager', text: fb },
        { who: 'manager', text: lates ? `You had ${lates} late submission${lates > 1 ? 's' : ''}. Request an extension before a deadline passes. I say yes more often than you'd think.` : 'Zero late submissions. That reliability matters more than you know.' },
        { choices: [
          { text: 'What\'s one thing I could do better next week?', effects: { rel: { manager: 4 }, morale: 2 },
            reply: { who: 'manager', text: 'Communicate progress before I ask. A two-line update when you finish something goes a long way.' } },
          { text: 'How do return offers work?', effects: { rel: { manager: 1 } },
            reply: { who: 'manager', text: 'Quality of work, reliability, and how the team feels working with you. A return offer means you move on to the next internship.' } },
          { text: 'No questions, all good!', effects: {}, reply: { who: 'manager', text: 'Alright! My door is always open.' } },
        ] },
      ],
    };
  }

  function g1Kickoff(t) {
    const [a, b] = t.groups.g1.members;
    return {
      title: 'Group Project Kickoff: ' + t.groups.g1.name, place: '🗣️ Conference room', time: 25,
      steps: [
        { who: 'manager', text: `Group project time! Team: ${IS.characters[a].short}, ${IS.characters[b].short}, and you, building the ${t.groups.g1.name}. Demo is Friday.` },
        { who: 'manager', text: 'You own the design doc and the core logic. How you run the team is up to you three.' },
        { who: a, text: 'I\'m pumped. How do we want to split things up?' },
        { choices: [
          { text: `Play to strengths: ${IS.characters[a].short} on the interface, ${IS.characters[b].short} on integration, me on the core logic and design doc. Five-minute check-ins every morning?`,
            effects: { health: { g1: 15 }, rel: { [a]: 3, [b]: 3 } },
            reply: [{ who: a, text: 'Love it. Clear owners, quick check-ins.' }, { who: b, text: 'Integration, got it. I will absolutely not procrastinate.' }] },
          { text: 'I\'ll just assign everything and we\'ll go.', effects: { rel: { [a]: -2, [b]: -2 } },
            reply: { who: a, text: 'Uh, OK. Would\'ve been nice to be asked.' } },
          { text: 'Whatever works! Let\'s figure it out as we go.', effects: { health: { g1: -8 } },
            reply: { who: b, text: 'Chaos mode. (This is how things get dropped, isn\'t it.)' } },
        ] },
      ],
    };
  }

  function g1Event(t) {
    const [a, b] = t.groups.g1.members;
    const A = IS.characters[a].short;
    const B = IS.characters[b].short;
    return {
      title: 'Uh-oh: The Demo Is Tomorrow', place: '💬 Message from ' + A, time: 5,
      steps: [
        { who: a, text: `Quick thing: ${B} hasn't pushed their part and the demo is tomorrow. They've been quiet. What should we do?` },
        { choices: [
          { text: `Message ${B} kindly and offer to pair for 20 minutes.`, effects: { time: 20, health: { g1: 15 }, rel: { [b]: 6, [a]: 2 } },
            reply: [{ who: b, text: 'Oh man. I got stuck two days ago, got embarrassed and didn\'t say anything. Pairing would be amazing.' }, { who: b, text: '…and it works! Thank you. I owe you a churro.' }] },
          { text: `Tell ${n('manager')} that ${B} is slacking.`, effects: { health: { g1: -10 }, rel: { [b]: -6, manager: 1 } },
            reply: { who: 'manager', text: `Thanks for flagging. Next time, talk to ${B} directly first. It usually resolves faster and keeps trust.` } },
          { text: `Just do ${B}'s part yourself.`, effects: { time: 40, energy: -20, health: { g1: -3 }, rel: { [b]: -2 } },
            reply: { who: a, text: `You knocked it out, but ${B} seems hurt nobody asked what was going on.` } },
          { text: 'Ignore it. Their part, their problem.', effects: { health: { g1: -20 }, rel: { [a]: -3 } },
            reply: { who: a, text: '…OK. I guess we\'ll see tomorrow. 😬' } },
        ] },
      ],
    };
  }

  function midpointReview(t, s) {
    const g = E().gradeSummary();
    const great = g.avg >= 88 && s.job.stats.missedCount === 0;
    return {
      title: 'Midpoint Performance Review', place: '📋 Manager\'s office', time: 20,
      steps: [
        { who: 'manager', text: `Halfway there, ${me()}! Let's do your midpoint review.` },
        { who: 'manager', text: `So far: ${g.count} graded assignment${g.count === 1 ? '' : 's'}, averaging ${Math.round(g.avg)}% (${U.letter(g.avg)}). ${s.job.stats.lateCount} late, ${s.job.stats.missedCount} missed.` },
        { who: 'manager', text: great ? 'This is genuinely strong work. I\'m nominating you for the Rising Star award!'
          : g.avg >= 80 ? 'You\'re on track. For the second half, own the capstone more end-to-end.'
            : 'You\'re below where I\'d like. Goal: every assignment on time, and ask for help early.' },
        { choices: [
          { text: 'Thank you. What would make the second half "exceeds expectations"?', effects: { rel: { manager: 4 } },
            reply: { who: 'manager', text: 'Lead the capstone integration, surface risks early, and nail the final presentation. Harriet will be there.' } },
          { text: 'That\'s fair. I\'ll work on it.', effects: { rel: { manager: 2 } }, reply: { who: 'manager', text: 'I believe you.' } },
        ] },
      ],
      after: great ? 'risingStar' : null,
    };
  }

  function g2Kickoff(t) {
    const [a, b] = t.groups.g2.members;
    const A = IS.characters[a].short;
    const B = IS.characters[b].short;
    return {
      title: 'Capstone Kickoff: ' + t.groups.g2.name, place: '🗣️ Conference room', time: 30,
      steps: [
        { who: 'manager', text: `Capstone time. Team: ${A}, ${B}, and you on integration. You present ${t.groups.g2.name} to Harriet Lin, our VP, on Day 33.` },
        { who: b, text: `Heads up: ${t.scenario.delay.replace('failed', 'might fail')}. Real inputs might be late.` },
        { choices: [
          { text: `${A} on analysis, ${B} on inputs, me on integration. And let's build ${t.scenario.delayFix} on day one so nobody is blocked.`,
            effects: { health: { g2: 20 }, rel: { [a]: 3, [b]: 4 }, flag: 'mockData' },
            reply: [{ who: b, text: `${t.scenario.delayFix[0].toUpperCase() + t.scenario.delayFix.slice(1)} from day one? You just saved me a week of stress.` }, { who: a, text: 'I\'ll have it ready tomorrow.' }] },
          { text: 'Let\'s each build our part and merge everything at the end.', effects: { health: { g2: -10 } },
            reply: { who: 'mentor', text: '(from across the room) Ah yes, the classic "integrate on the last day" plan. Bold.' } },
          { text: `${A}, you're the strongest. Maybe you should lead?`, effects: { health: { g2: 5 }, rel: { [a]: 3 } },
            reply: { who: a, text: 'Flattering! But let\'s make this a team plan.' } },
        ] },
      ],
    };
  }

  function g2Event(t, s) {
    const [a, b] = t.groups.g2.members;
    const B = IS.characters[b].short;
    const choices = [];
    if (s.job.flags.mockData) {
      choices.push({ text: `No problem, we already have ${t.scenario.delayFix}! Keep building against it.`, effects: { health: { g2: 15 }, rel: { [b]: 5 } },
        reply: { who: b, text: `Honestly, the ${t.scenario.delayFix} plan was the best call of this project.` } });
    }
    choices.push(
      { text: `Let's build ${t.scenario.delayFix} right now so we're unblocked.`, effects: { time: 30, health: { g2: 10 }, rel: { [b]: 3 }, flag: 'mockData' },
        reply: { who: a, text: 'Took 30 minutes together, but we\'re unblocked!' } },
      { text: `Escalate to ${n('manager')} and ask to cut scope.`, effects: { rel: { manager: 1, [b]: -1 } },
        reply: { who: 'manager', text: 'Let\'s not cut it yet. Can you simulate the inputs? Come back if that fails.' } },
      { text: `Post in the team channel that ${B} is holding everyone back.`, effects: { health: { g2: -25 }, rel: { [b]: -10, [a]: -3 } },
        reply: { who: b, text: '…Wow. OK. I\'m doing my best with what I have.' } });
    return {
      title: 'Capstone Setback!', place: '🔧 ' + t.lab.name, time: 5,
      steps: [{ who: b, text: `Bad news: ${t.scenario.delay}. The real inputs won't be ready until next week.` }, { choices }],
    };
  }

  function incident(t) {
    return {
      title: '🚨 SEV-2 Incident', place: '📟 Pager alert', time: 5,
      steps: [
        { who: 'manager', text: `All hands! ${t.incident} I'm assigning the fix to you. ${n('mentor')} will back you up. Check your To-Do list. It's due by 11:00 AM.` },
        { choices: [
          { text: 'On it. I\'ll post updates in #incident every 20 minutes.', effects: { rel: { manager: 3 } },
            reply: { who: 'manager', text: 'Perfect. That\'s exactly what incident comms should look like.' } },
          { text: `Can ${n('mentor')} take it instead? I don't want to break production.`, effects: { rel: { manager: -2 } },
            reply: { who: 'manager', text: 'Your mentor is there to help, but you own this. You\'re more ready than you think.' } },
        ] },
      ],
    };
  }

  function g2Conflict(t) {
    const [a, b] = t.groups.g2.members;
    return {
      title: 'Team Disagreement', place: '🗣️ Capstone war room', time: 15,
      steps: [
        { who: a, text: `We should do ${t.scenario.conflictA}. Harriet loves that. Anything else feels fake.` },
        { who: b, text: `And if something breaks mid-presentation? ${t.scenario.conflictB[0].toUpperCase() + t.scenario.conflictB.slice(1)} is safe.` },
        { who: a, text: '(looks at you) Tie-breaker?' },
        { choices: [
          { text: `${t.scenario.conflictA[0].toUpperCase() + t.scenario.conflictA.slice(1)}, with ${t.scenario.conflictB} ready as a backup.`, effects: { health: { g2: 15 }, rel: { [a]: 2, [b]: 2 } },
            reply: { who: b, text: 'Best of both worlds. I\'m in.' } },
          { text: `${IS.characters[a].short}'s right.`, effects: { health: { g2: -5 }, rel: { [a]: 3, [b]: -3 } }, reply: { who: b, text: 'OK… fingers crossed.' } },
          { text: `${IS.characters[b].short}'s right.`, effects: { health: { g2: -5 }, rel: { [b]: 3, [a]: -3 } }, reply: { who: a, text: 'Fine. It\'s going to feel canned.' } },
          { text: 'Let\'s flip a coin.', effects: { health: { g2: -10 } }, reply: { who: a, text: 'A coin? For our capstone?' } },
        ] },
      ],
    };
  }

  function finalReview(t, s) {
    const r = E().finalResult();
    const last = t.n === IS.tracks.length;
    const offerLine = r.offer === 'offer'
      ? (last ? 'And… we\'d like to offer you a FULL-TIME position. Congratulations. You earned it. 🎉' : `And… you've earned a return offer! Next up: internship #${t.n + 1}, ${IS.tracks[t.n].title} (${IS.tracks[t.n].langLabel}). 🎉`)
      : r.offer === 'maybe'
        ? 'We can\'t extend a return offer this time, but I\'d happily be a reference. You can reapply for this internship.'
        : 'We won\'t be extending a return offer this time. Let\'s talk about what to focus on before you reapply.';
    return {
      title: 'Final Performance Review', place: '📋 Manager\'s office', time: 20,
      steps: [
        { who: 'manager', text: `${me()}, 100 hours. Wow. Let's walk through your final review.` },
        { who: 'manager', text: `Final average: ${Math.round(r.overall)}% (${U.letter(r.overall)}). ${r.gradedCount} assignments graded, ${s.job.stats.lateCount} late, ${s.job.stats.missedCount} missed.` },
        { who: 'manager', text: r.overall >= 90 ? 'You exceeded expectations: reliable, well-tested and clearly communicated.' : r.overall >= 80 ? 'You met expectations, and exceeded them in places.' : 'You had real wins, but consistency is the area to grow.' },
        { who: 'manager', text: offerLine },
        { choices: [
          { text: `Thank you for everything, ${n('manager')}. I learned so much.`, effects: { rel: { manager: 3 } }, reply: { who: 'manager', text: 'It was a pleasure. Now go get ready, the awards ceremony is starting!' } },
          { text: 'Can I ask for one piece of career advice?', effects: { rel: { manager: 3 } }, reply: { who: 'manager', text: 'Be the person who closes loops. Say what you\'ll do, do it, and tell people it\'s done.' } },
        ] },
      ],
    };
  }

  function farewell(t) {
    return {
      title: 'Farewell Party', place: '🎈 Café, after the ceremony', time: 5,
      steps: [
        { who: 'intern1', text: 'I can\'t believe it\'s over! Group chat stays alive forever, deal?' },
        { who: 'intern2', text: 'I\'m framing my churro receipt. Emotional artifact.' },
        { who: 'intern3', text: 'Send me your resume. I\'ll refer you anywhere.' },
        { who: 'mentor', text: 'Proud of you. Write down what you tried, then ask. Forever.' },
        { choices: [{ text: 'Thank you all. This was amazing. ✨', effects: { morale: 10 }, reply: { who: 'rosa', text: 'Now THAT is how you end an internship.' } }] },
      ],
    };
  }

  const RANDOM = [
    (t) => ({ title: 'Break Room Surprise', place: '🍩 Break room', time: 0, steps: [{ who: 'gus', text: 'Someone left two dozen donuts in the café! Grab one while they last.' },
      { choices: [{ text: 'Grab one (+energy)', effects: { time: 5, energy: 12, morale: 3 } }, { text: 'Stay focused', effects: {} }] }] }),
    (t) => ({ title: '🚨 Fire Drill', place: '🅿️ Parking lot', time: 15, steps: [{ who: 'marcus', text: 'Fire drill! Everyone out to the parking lot. (15 minutes, but it\'s sunny.)' }] }),
    (t) => ({ title: 'Laptop Update', place: '💻 Your desk', time: 10, steps: [{ who: 'lena', text: 'Heads up, a mandatory security update is rolling out. That\'s 10 minutes of progress bar.' }] }),
    (t) => ({ title: 'Networking Coffee Chat', place: '☕ Studio Café', steps: [{ who: 'rosa', text: 'A Principal Imagineer has an open coffee-chat slot this morning. Want it? (30 min)' },
      { choices: [{ text: 'Absolutely!', effects: { time: 30, networking: 2, morale: 5, rel: { rosa: 2 } }, reply: { who: 'rosa', text: 'They said you asked great questions. Nice!' } }, { text: 'Not today, I have deadlines.', effects: {} }] }] }),
    (t) => ({ title: 'Lab Tour', place: '🔧 ' + t.lab.name, steps: [{ who: 'intern4', text: `I've got 25 minutes. Want a tour of the ${t.lab.name}?` },
      { choices: [{ text: 'Yes!! (25 min)', effects: { time: 25, morale: 8, networking: 1, rel: { intern4: 4 } }, reply: { who: 'intern4', text: 'Pretty cool for "just wires," huh?' } }, { text: 'Maybe next time.', effects: {} }] }] }),
    (t) => ({ title: 'Lunch & Learn', place: '🎤 Auditorium', steps: [{ who: 'mentor', text: 'Tech talk in 5 minutes: "How animatronics see the world." 30 minutes. Coming?' },
      { choices: [{ text: 'Sure!', effects: { time: 30, morale: 4, networking: 1, rel: { mentor: 2 } } }, { text: 'I\'ll catch the recording.', effects: {} }] }] }),
    (t) => ({ title: 'Design Critique', place: '✏️ Ava\'s desk', steps: [{ who: 'ava', text: 'I\'m running a quick design critique on a new queue sign. Want to give feedback? (15 min)' },
      { choices: [{ text: 'Happy to!', effects: { time: 15, networking: 1, rel: { ava: 4 }, morale: 3 }, reply: { who: 'ava', text: 'Great note about readability from far away. Stealing it.' } }, { text: 'Can\'t today, sorry.', effects: {} }] }] }),
    (t) => ({ title: 'Producer Drop-in', place: '📋 Open office', steps: [{ who: 'theo', text: 'Quick question: can engineering explain the current status in one sentence? My VP asks in 10 minutes.' },
      { choices: [{ text: 'Give a crisp one-line status with the date.', effects: { time: 5, rel: { theo: 4, manager: 1 }, networking: 1 }, reply: { who: 'theo', text: 'That is the most useful sentence anyone has said to me today.' } },
        { text: 'Launch into a 10-minute technical explanation.', effects: { time: 10, rel: { theo: -2 } }, reply: { who: 'theo', text: '…So is that a yes or a no?' } }] }] }),
  ];

  // Scenes that play when you badge in on a given day.
  function forDay(t, s) {
    const d = s.job.day;
    const list = [];
    if (d === 1) list.push(onboarding(t));
    else if (d !== U.LAST_DAY) list.push(standup(t, s));
    const special = { 5: [oneOnOne], 6: [g1Kickoff], 9: [g1Event], 16: [midpointReview, g2Kickoff], 19: [g2Event], 22: [incident], 27: [g2Conflict], 34: [finalReview, 'CEREMONY', farewell] }[d];
    if (special) special.forEach((f) => list.push(f === 'CEREMONY' ? f : f(t, s)));
    else if (d > 1 && d < U.LAST_DAY) {
      const rnd = U.seeded(s.seed + d * 7919 + s.job.level * 31);
      if (rnd() < 0.5) list.push(U.pick(RANDOM, rnd)(t));
    }
    return list;
  }

  return { forDay };
})();
