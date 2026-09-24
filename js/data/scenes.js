// Interactive dialogue scenes. A scene is a list of steps:
//   { who, text }                         a line of dialogue (text may be fn(state))
//   { choices: [{ text, effects, reply }] } the player picks a response
// effects: { rel: {id: n}, morale, energy, time, health: {g1: n}, flag, networking, money }
// reply: a step (or array of steps) shown after the choice.
IS.scenes = (function () {
  const U = IS.util;
  const name = (s) => s.player.name;

  function nextDueTask(s) {
    const open = IS.tasks.filter((t) => s.tasks[t.id] && s.tasks[t.id].status === 'assigned');
    open.sort((a, b) => U.abs(a.due.day, a.due.minute) - U.abs(b.due.day, b.due.minute));
    return open[0];
  }

  function lastSubmitted(s) {
    const done = IS.tasks.filter((t) => s.tasks[t.id] && s.tasks[t.id].status === 'graded');
    done.sort((a, b) => s.tasks[b.id].submittedAbs - s.tasks[a.id].submittedAbs);
    return done[0];
  }

  const S = {};

  S.onboarding = {
    title: 'Day 1: Welcome to Imagineering', place: '🏛️ Main Lobby', time: 40,
    steps: [
      { who: 'rosa', text: (s) => `Welcome, ${name(s)}! I'm Rosa, I run the intern program. Here's your badge. Guard it with your life (or at least don't lend it to anyone).` },
      { who: 'rosa', text: (s) => `Quick logistics: you're a Software Engineering Intern on Ride Systems Software for six weeks. You work 3 hours a day, Monday to Friday, at ${U.money(s.rate)}/hour. Paychecks land every Friday.` },
      { who: 'rosa', text: 'Deadlines are real here. Late work gets a grade penalty AND a pay adjustment, and anything more than two days late is marked missed. If you are going to be late, ask for an extension BEFORE the deadline.' },
      { who: 'maya', text: 'Hi! I\'m Maya, your manager. Our team writes the software between the ride vehicles and the guest apps: wait times, dispatch data, show control tools. Safety first, then show, then efficiency.' },
      { choices: [
        { text: 'I\'m so excited to be here! What does success look like for an intern on this team?', effects: { rel: { maya: 4 } },
          reply: { who: 'maya', text: 'Great question. Deliver quality work on time, tell me early when something\'s off, and ask for help when you\'re stuck. Do those three and you\'ll do great.' } },
        { text: 'Where is the coffee?', effects: { morale: 3 },
          reply: { who: 'maya', text: '(laughs) Studio Café, downstairs. Gus will know your order by day two. Just don\'t let the coffee runs eat your whole morning.' } },
        { text: 'I\'m pretty independent. I\'ll probably figure most things out myself.', effects: { rel: { maya: -2 } },
          reply: { who: 'maya', text: 'Independence is great, but nobody here builds rides alone. Use your mentor. That\'s what he\'s for.' } },
      ] },
      { who: 'dev', text: 'Hey! I\'m Dev, your mentor. I was an intern on this exact team three summers ago. When you\'re stuck, ping me. I mean it.' },
      { choices: [
        { text: 'Thanks, Dev! How do you like people to ask questions?', effects: { rel: { dev: 4 } },
          reply: { who: 'dev', text: 'Tell me what you\'re trying to do, what you tried, and what happened. That\'s it. You\'ll be amazed how often you solve it while writing that down.' } },
        { text: 'Cool, I\'ll let you know.', effects: { rel: { dev: 1 } },
          reply: { who: 'dev', text: 'Sounds good. My desk has the rubber duck on it, you can\'t miss it.' } },
      ] },
      { who: 'rosa', text: 'Your first tasks are in the Task Board: safety training and an intro post for the intern channel. The other interns are Jordan, Sam, Priya and Tyler. You\'ll work with all of them. Have a magical first day! ✨' },
    ],
  };

  S.standup = function (s) {
    const next = nextDueTask(s);
    const last = lastSubmitted(s);
    const intern = U.pick(IS.INTERNS);
    const internLines = {
      jordan: 'Jordan: Finished the color-contrast audit yesterday, today I\'m prototyping the board layout. No blockers!',
      sam: 'Sam: Uh, yesterday I… investigated things. Today I will investigate them more. Productively.',
      priya: 'Priya: Cleaned last season\'s throughput data. Today: building the baseline model. Blocked on nothing.',
      tyler: 'Tyler: Recalibrated two queue sensors in the lab. Today: cable management, the unsung hero of engineering.',
    };
    return {
      title: 'Daily Standup', place: '🧍 Team Standup (Zoom)', time: 10,
      steps: [
        { who: 'maya', text: U.pick(['Morning, everyone! Quick round, let\'s keep it snappy.', 'Good morning! Standup time. Updates, plans, blockers.', 'Hi all! Let\'s go around the room.']) },
        { who: intern, text: internLines[intern] },
        { who: 'maya', text: `${name(s)}, what\'s your update?` },
        { choices: [
          { text: `Yesterday I ${last ? 'wrapped up "' + last.title + '"' : 'got my environment set up'}. Today I'm focused on ${next ? '"' + next.title + '"' : 'reviewing docs and helping out'}. No blockers.`,
            effects: { rel: { maya: 2 } }, reply: { who: 'maya', text: 'Clear and specific. Love it. Thanks!' } },
          { text: `I'm working on ${next ? '"' + next.title + '"' : 'my tasks'} and could use 15 minutes with Dev later to sanity-check my approach.`,
            effects: { rel: { maya: 2, dev: 1 } }, reply: { who: 'dev', text: 'Happy to. Ping me whenever. Asking early is the move.' } },
          { text: 'Uh… just working on stuff.', effects: { rel: { maya: -2 } },
            reply: { who: 'maya', text: 'Can you be a bit more specific next time? It helps me spot risks early.' } },
        ] },
      ],
    };
  };

  S.oneOnOne1 = function (s) {
    const g = IS.engine.gradeSummary();
    const lates = s.stats.lateCount;
    let fb;
    if (!g.count) fb = 'I haven\'t seen much submitted work yet, which worries me a bit. Let\'s make sure next week you\'re shipping things.';
    else if (g.avg >= 90) fb = `Honestly? Great first week. You're averaging ${Math.round(g.avg)}%. Your work is clean and on time.`;
    else if (g.avg >= 80) fb = `Solid first week, averaging ${Math.round(g.avg)}%. A few rough edges, which is normal. Keep testing your edge cases.`;
    else fb = `This week was bumpy, averaging ${Math.round(g.avg)}%. That's OK, but I want you to lean on Dev more next week.`;
    return {
      title: 'Week 1 Check-in with Maya', place: '☕ 1:1 Meeting Room', time: 20,
      steps: [
        { who: 'maya', text: `Thanks for making time, ${name(s)}. How was your first week?` },
        { who: 'maya', text: fb },
        { who: 'maya', text: lates ? `One thing: you had ${lates} late submission${lates > 1 ? 's' : ''}. If you see a deadline slipping, request an extension before it passes. I say yes more often than you'd think.` : 'And zero late submissions. That reliability matters more than you know.' },
        { choices: [
          { text: 'What\'s one thing I could do better next week?', effects: { rel: { maya: 4 }, morale: 2 },
            reply: { who: 'maya', text: 'Communicate progress before I ask. A two-line update when you finish something goes a long way.' } },
          { text: 'How do return offers work?', effects: { rel: { maya: 1 } },
            reply: { who: 'maya', text: 'Rosa\'s team runs it, but my input is quality of work, reliability, and how the team feels working with you. It\'s the whole package.' } },
          { text: 'No questions, all good!', effects: {},
            reply: { who: 'maya', text: 'Alright! My door is always open. Well, my Slack DMs are.' } },
        ] },
      ],
    };
  };

  S.g1Kickoff = {
    title: 'Group Project Kickoff: Queue Time Display Board', place: '🗣️ Conference Room "Tomorrowland"', time: 25,
    steps: [
      { who: 'maya', text: 'Group project time! Team: Jordan, Sam, and you. You\'re building the wait-time display board for the park entrance. Demo is Friday.' },
      { who: 'maya', text: 'I\'ve assigned you the design doc and the core sort logic. Jordan and Sam will own the UI and the API hookup. How you run the team is up to you three.' },
      { who: 'jordan', text: 'I\'m pumped. I already have sketches! How do we want to split things up?' },
      { choices: [
        { text: 'Let\'s play to strengths: Jordan on UI, Sam on the API hookup, I\'ll take the data logic and design doc. Five-minute check-ins every morning?', effects: { health: { g1: 15 }, rel: { jordan: 3, sam: 3 } },
          reply: [{ who: 'jordan', text: 'Love it. Clear owners, quick check-ins. 🙌' }, { who: 'sam', text: 'API hookup, got it. I will absolutely not procrastinate on this.' }] },
        { text: 'I\'ll just assign everything. Jordan: UI. Sam: API. Done. Let\'s go.', effects: { health: { g1: 0 }, rel: { jordan: -2, sam: -2 } },
          reply: { who: 'jordan', text: 'Uh, okay. Would\'ve been nice to be asked, but sure.' } },
        { text: 'Whatever works! Let\'s just start and figure it out as we go.', effects: { health: { g1: -8 } },
          reply: { who: 'sam', text: 'Chaos mode. My favorite. (This is how things get dropped, isn\'t it.)' } },
      ] },
    ],
  };

  S.g1Event = {
    title: 'Uh-oh: The Demo Is Tomorrow', place: '💬 Slack DM from Jordan', time: 5,
    steps: [
      { who: 'jordan', text: 'Hey, quick thing. Sam hasn\'t pushed any of the API code and the demo is tomorrow. He\'s been kind of quiet. What should we do?' },
      { choices: [
        { text: 'Message Sam kindly and offer to pair on it for 20 minutes.', effects: { time: 20, health: { g1: 15 }, rel: { sam: 6, jordan: 2 } },
          reply: [{ who: 'sam', text: 'Oh man. I got stuck on a CORS error two days ago and got embarrassed and just… didn\'t say anything. Pairing would be amazing.' }, { who: 'sam', text: '…and it works! Thank you. Seriously. I owe you a churro.' }] },
        { text: 'Tell Maya that Sam is slacking.', effects: { health: { g1: -10 }, rel: { sam: -6, maya: 1 } },
          reply: { who: 'maya', text: 'Thanks for flagging. For next time, try talking to Sam directly first. It usually resolves faster and keeps trust on the team.' } },
        { text: 'Just do Sam\'s part yourself.', effects: { time: 40, energy: -20, health: { g1: -3 }, rel: { sam: -2 } },
          reply: { who: 'jordan', text: 'Wow, OK, you knocked it out. But Sam seems kind of hurt nobody asked him what was going on.' } },
        { text: 'Ignore it. His part, his problem.', effects: { health: { g1: -20 }, rel: { jordan: -3 } },
          reply: { who: 'jordan', text: '…OK. I guess we\'ll see what happens tomorrow. 😬' } },
      ] },
    ],
  };

  S.midpointReview = function (s) {
    const g = IS.engine.gradeSummary();
    const great = g.avg >= 88 && s.stats.missedCount === 0;
    return {
      title: 'Midpoint Performance Review', place: '📋 Maya\'s Office', time: 20,
      steps: [
        { who: 'maya', text: `Halfway there, ${name(s)}! Let's do your midpoint review.` },
        { who: 'maya', text: `So far: ${g.count} graded assignment${g.count === 1 ? '' : 's'}, averaging ${Math.round(g.avg)}% (${U.letter(g.avg)}). ${s.stats.lateCount} late, ${s.stats.missedCount} missed.` },
        { who: 'maya', text: great ? 'This is genuinely strong work. I\'m nominating you for the Rising Star award. Rosa announces it today!'
          : g.avg >= 80 ? 'You\'re on track. For the second half I want to see you own the capstone more end-to-end.'
            : 'I\'ll be honest, you\'re below where I\'d like. Let\'s set a goal: every assignment on time, and ask Dev for help early.' },
        { choices: [
          { text: 'Thank you. What would make the second half a clear "exceeds expectations"?', effects: { rel: { maya: 4 } },
            reply: { who: 'maya', text: 'Lead the capstone integration, communicate risks early, and nail the final presentation. Harriet will be there.' } },
          { text: 'That\'s fair. I\'ll work on it.', effects: { rel: { maya: 2 } },
            reply: { who: 'maya', text: 'I believe you. Let\'s check in again at the end.' } },
        ] },
      ],
      after: great ? 'risingStar' : null,
    };
  };

  S.g2Kickoff = {
    title: 'Capstone Kickoff: Guest Flow Optimizer', place: '🗣️ Big Idea Room', time: 30,
    steps: [
      { who: 'maya', text: 'Capstone time. Team: Priya (data), Tyler (sensors), and you (routing and integration). You present to Harriet Lin, our VP of Creative Technology, on Day 29.' },
      { who: 'priya', text: 'I have opinions about crowd modeling. Many opinions.' },
      { who: 'tyler', text: 'Heads up: the new walkway sensors are still being calibrated. Real data might be late.' },
      { choices: [
        { text: 'Priya on throughput analytics, Tyler on sensor ingest, me on routing + integration. And let\'s build mock sensor data on day one so nobody\'s blocked on hardware.',
          effects: { health: { g2: 20 }, rel: { priya: 3, tyler: 4 }, flag: 'mockData' },
          reply: [{ who: 'tyler', text: 'Mock data from day one? You just saved me a week of stress.' }, { who: 'priya', text: 'I\'ll generate it from last season\'s logs. Done by tomorrow.' }] },
        { text: 'Let\'s each build our part independently and merge everything at the end.', effects: { health: { g2: -10 } },
          reply: { who: 'dev', text: '(from across the room) Ah yes, the classic "integrate on the last day" plan. Bold.' } },
        { text: 'Priya, you\'re the strongest. Maybe you should lead and tell us what to do?', effects: { health: { g2: 5 }, rel: { priya: 3 } },
          reply: { who: 'priya', text: 'Flattering! But I want this to be a team plan, not my plan. Let\'s split it evenly.' } },
      ] },
    ],
  };

  S.g2Event = function (s) {
    const choices = [];
    if (s.flags.mockData) {
      choices.push({ text: 'No problem, we already have mock data! Keep building against it and swap in real data later.', effects: { health: { g2: 15 }, rel: { tyler: 5 } },
        reply: { who: 'tyler', text: 'Honestly, the mock data plan was the best call of this whole project.' } });
    }
    choices.push(
      { text: 'Let\'s generate mock data from last season\'s logs right now so we\'re unblocked.', effects: { time: 30, health: { g2: 10 }, rel: { tyler: 3 }, flag: 'mockData' },
        reply: { who: 'priya', text: 'On it together. Took 30 minutes but we\'re unblocked!' } },
      { text: 'Escalate to Maya and ask to cut the sensor scope.', effects: { rel: { maya: 1, tyler: -1 } },
        reply: { who: 'maya', text: 'Let\'s not cut it yet. Can you simulate the data? Come back to me if that doesn\'t work.' } },
      { text: 'Post in the team channel that Tyler\'s hardware is holding everyone back.', effects: { health: { g2: -25 }, rel: { tyler: -10, priya: -3 } },
        reply: { who: 'tyler', text: '…Wow. OK. I\'m doing my best with parts that shipped late.' } });
    return {
      title: 'Hardware Delay!', place: '🔧 Ride Lab', time: 5,
      steps: [
        { who: 'tyler', text: 'Bad news: the walkway sensors failed calibration. Real data won\'t be ready until next week.' },
        { choices },
      ],
    };
  };

  S.incident = {
    title: '🚨 SEV-2 Incident', place: '📟 Pager Alert', time: 5,
    steps: [
      { who: 'maya', text: 'Heads up, all hands! The guest app is showing negative and "Infinity" wait times. It\'s trending on social. I\'m assigning the fix to you. Dev will back you up. We need it by 11:00 AM.' },
      { choices: [
        { text: 'On it. I\'ll post updates in #incident every 20 minutes.', effects: { rel: { maya: 3 } },
          reply: { who: 'maya', text: 'Perfect. That\'s exactly what incident comms should look like.' } },
        { text: 'Can Dev take it instead? I don\'t want to break production.', effects: { rel: { maya: -2 } },
          reply: { who: 'maya', text: 'Dev is there to help, but you own this one. You\'re more ready than you think.' } },
      ] },
    ],
  };

  S.g2Conflict = {
    title: 'Team Disagreement', place: '🗣️ Capstone War Room', time: 15,
    steps: [
      { who: 'priya', text: 'We should do a LIVE demo. Harriet loves live demos. Recorded videos feel fake.' },
      { who: 'tyler', text: 'And if the lab Wi-Fi dies mid-demo? A recorded video is safe.' },
      { who: 'priya', text: '(looks at you) Tie-breaker?' },
      { choices: [
        { text: 'Live demo, with a recorded backup queued up in case anything breaks.', effects: { health: { g2: 15 }, rel: { priya: 2, tyler: 2 } },
          reply: { who: 'tyler', text: 'Best of both worlds. Fine, I\'m in.' } },
        { text: 'Priya\'s right. Live only.', effects: { health: { g2: -5 }, rel: { priya: 3, tyler: -3 } },
          reply: { who: 'tyler', text: 'OK… I\'ll pray to the Wi-Fi gods.' } },
        { text: 'Tyler\'s right. Video only.', effects: { health: { g2: -5 }, rel: { tyler: 3, priya: -3 } },
          reply: { who: 'priya', text: 'Fine. But it\'s going to feel canned.' } },
        { text: 'Let\'s just flip a coin.', effects: { health: { g2: -10 } },
          reply: { who: 'priya', text: 'Really? A coin? For our capstone?' } },
      ] },
    ],
  };

  S.finalReview = function (s) {
    const r = IS.engine.finalResult();
    const offerLine = r.offer === 'offer'
      ? 'And… I\'m thrilled to tell you that we\'re extending you a return offer for next summer. 🎉'
      : r.offer === 'maybe'
        ? 'We\'re not able to extend a return offer right now, but I\'d happily be a reference, and I hope you apply again.'
        : 'I\'m sorry, but we won\'t be extending a return offer this time. Let\'s talk about what to focus on for next year.';
    return {
      title: 'Final Performance Review', place: '📋 Maya\'s Office', time: 25,
      steps: [
        { who: 'maya', text: `${name(s)}, six weeks. Wow. Let's walk through your final review.` },
        { who: 'maya', text: `Final average: ${Math.round(r.overall)}% (${U.letter(r.overall)}). ${r.gradedCount} assignments graded, ${s.stats.lateCount} late, ${s.stats.missedCount} missed.` },
        { who: 'maya', text: r.overall >= 90 ? 'You exceeded expectations. Your work was reliable, well-tested and clearly communicated.'
          : r.overall >= 80 ? 'You met expectations, and in a few places exceeded them.'
            : 'You had some real wins, but consistency is the area to grow.' },
        { who: 'maya', text: offerLine },
        { choices: [
          { text: 'Thank you for everything, Maya. I learned so much from you.', effects: { rel: { maya: 3 } },
            reply: { who: 'maya', text: 'It was a pleasure. Now go get ready. The awards ceremony starts soon!' } },
          { text: 'Can I ask for one piece of advice for my career?', effects: { rel: { maya: 3 } },
            reply: { who: 'maya', text: 'Be the person who closes loops. Say what you\'ll do, do it, and tell people it\'s done. That\'s rarer than genius.' } },
        ] },
      ],
    };
  };

  S.farewell = {
    title: 'Last Day Goodbyes', place: '🎈 Intern Farewell Party', time: 15,
    steps: [
      { who: 'jordan', text: 'I can\'t believe it\'s over! Group chat stays alive forever, deal?' },
      { who: 'sam', text: 'I\'m framing my churro receipt from week two. Emotional artifact.' },
      { who: 'priya', text: 'Send me your resume. I\'ll refer you anywhere, anytime.' },
      { who: 'tyler', text: 'Come visit the ride lab when you\'re back. I\'ll let you watch a restraint cycle test.' },
      { who: 'dev', text: 'Proud of you. Remember: write down what you tried, then ask. Forever.' },
      { choices: [
        { text: 'Thank you all. This was the best summer of my life. ✨', effects: { morale: 10 }, reply: { who: 'rosa', text: 'Now THAT is how you end an internship. Stay magical.' } },
      ] },
    ],
  };

  // Random daily events. `when` gates availability.
  S.random = [
    { id: 'donuts', scene: {
      title: 'Break Room Surprise', place: '🍩 Break Room', time: 0,
      steps: [{ who: 'gus', text: 'Someone left two dozen donuts in the break room! Get \'em while they last.' },
        { choices: [{ text: 'Grab one (+energy)', effects: { time: 5, energy: 12, morale: 3 } }, { text: 'Stay focused', effects: {} }] }] } },
    { id: 'firedrill', scene: {
      title: '🚨 Fire Drill', place: '🅿️ Parking Lot', time: 15,
      steps: [{ who: 'rosa', text: 'Fire drill! Everyone out to the parking lot. (You lose 15 minutes, but at least it\'s sunny.)' }] } },
    { id: 'laptop', scene: {
      title: 'Laptop Update', place: '💻 Your Desk', time: 10,
      steps: [{ who: 'dev', text: 'Oof, your laptop decided it\'s update time. That\'s 10 minutes of staring at a progress bar.' }] } },
    { id: 'coffeechat', scene: {
      title: 'Networking Coffee Chat', place: '☕ Studio Café',
      steps: [{ who: 'rosa', text: 'A Principal Imagineer, Carmen Reyes, has an open coffee-chat slot this morning. Want it? (30 min)' },
        { choices: [
          { text: 'Absolutely!', effects: { time: 30, networking: 2, morale: 5, rel: { rosa: 2 } },
            reply: { who: 'rosa', text: 'Carmen said you asked great questions about how ride software gets safety-certified. Nice!' } },
          { text: 'Not today, I have deadlines.', effects: {} }] }] } },
    { id: 'labtour', scene: {
      title: 'Ride Lab Tour', place: '🎢 Ride Lab',
      steps: [{ who: 'tyler', text: 'I\'ve got 25 minutes. Want a tour of the ride lab? We have a full-size vehicle on a test track.' },
        { choices: [
          { text: 'Yes!! (25 min)', effects: { time: 25, morale: 8, networking: 1, rel: { tyler: 4 }, flag: 'labTour' },
            reply: { who: 'tyler', text: 'And THAT is a ride vehicle doing a brake test. Pretty cool for "just wires," huh?' } },
          { text: 'Maybe next time.', effects: {} }] }] } },
    { id: 'techtalk', scene: {
      title: 'Lunch & Learn', place: '🎤 Auditorium',
      steps: [{ who: 'dev', text: 'There\'s a lunch-and-learn in 5: "How Animatronics See the World." 30 minutes. Coming?' },
        { choices: [
          { text: 'Sure, sounds awesome.', effects: { time: 30, morale: 4, networking: 1, rel: { dev: 2 } } },
          { text: 'I\'ll catch the recording.', effects: {} }] }] } },
    { id: 'birthday', scene: {
      title: 'Birthday Card', place: '🎂 Team Area',
      steps: [{ who: 'rosa', text: 'Psst, it\'s Jordan\'s birthday! Want to sign the card?' },
        { choices: [
          { text: 'Sign it with a nice note (5 min)', effects: { time: 5, rel: { jordan: 5 } } },
          { text: 'Skip it', effects: {} }] }] } },
    { id: 'shoutout', when: (s) => IS.engine.gradeSummary().avg >= 85, scene: {
      title: 'Shout-out!', place: '💬 #ride-systems',
      steps: [{ who: 'dev', text: 'Shout-out to our intern for super clean work this week. Tests and everything. 🙌' },
        { who: 'maya', text: '+1! 🎉' }], effects: { morale: 6 } } },
  ];

  return S;
})();
