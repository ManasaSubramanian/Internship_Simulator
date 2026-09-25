// Conversations: pick a topic and have a real exchange. Interns talk about
// their previous internships, how they got this one, and their specialty
// (which teaches a Learning Center concept). Mentors, managers and the studio
// staff have role-specific topics, and people ask about YOUR experience too.
IS.talk = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const D = () => IS.talkData;
  const plain = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  function roleOf(id) {
    const c = E().cast();
    if (c.interns.includes(id)) return 'intern';
    if (id === c.mentor) return 'mentor';
    if (id === c.manager) return 'manager';
    if (D().cast[id]) return 'cast';
    if (D().interns[id]) return 'intern';
    return 'other';
  }

  function memory(id) {
    const s = st();
    s.talked = s.talked || {};
    s.talked[id] = s.talked[id] || { heard: {}, asked: 0 };
    return s.talked[id];
  }

  // Teaching lines built from a Learning Center topic.
  function lessonSteps(id, trackId, topicId, intro) {
    const topic = IS.learn.topic(trackId, topicId);
    if (!topic) return [{ who: id, text: intro }];
    const analogy = (topic.words.match(/<div class="analogy">([\s\S]*?)<\/div>/) || [])[1];
    const term = topic.terms && topic.terms[0];
    const ex = topic.example;
    const steps = [{ who: id, text: intro }, { who: id, text: 'The short version: ' + topic.summary }];
    if (analogy) steps.push({ who: id, text: 'The way I explain it to people: ' + plain(analogy) });
    if (term) steps.push({ who: id, text: `One word you'll hear a lot: "${plain(term[0])}". ${plain(term[1])}` });
    const first = ex && ex.steps && ex.steps.find((x) => x.lines && x.lines.length);
    steps.push({ choices: [
      { text: 'Can you show me a quick example?', effects: { rel: { [id]: 2 } },
        reply: first ? [{ who: id, text: `Sure. Picture this line: "${ex.code.split('\n')[first.lines[0] - 1].trim()}"` }, { who: id, text: plain(first.text) + ' The full walkthrough is in the Learning Center lesson.' }]
          : { who: id, text: 'The Learning Center lesson has a great step-by-step example. Start there.' } },
      { text: 'That makes sense. Thanks for explaining!', effects: { rel: { [id]: 1 } }, reply: { who: id, text: 'Anytime. Teaching it is how I learned it.' } },
    ] });
    return steps;
  }

  // Questions people ask about you, built from your real career so far.
  function askSteps(id, role) {
    const s = st();
    const t = E().track();
    const mem = memory(id);
    const hist = s.career.history;
    const last = hist[hist.length - 1];
    const lastIv = s.career.lastInterview;
    const pool = [];
    if (last) {
      pool.push([{ who: id, text: `You interned with ${last.team} before, right? What was that like?` }, { choices: [
        { text: `It was great. I worked on ${IS.tracks[last.level].langLabel} with ${last.team} and got ${last.offer === 'offer' ? 'a return offer' : 'a lot of practice'}. My biggest lesson was to ask for help early.`, effects: { rel: { [id]: 4 }, networking: 1 },
          reply: { who: id, text: role === 'intern' ? `That's so useful. ${IS.tracks[last.level].langLabel} ideas carry over more than you'd think. I might pick your brain later!` : 'Asking early is the habit that separates good interns from great ones. Glad it stuck.' } },
        { text: 'Honestly, it was hard. I missed a deadline and learned to plan better.', effects: { rel: { [id]: 4 } },
          reply: { who: id, text: 'Thanks for being honest. Everyone misses one. What matters is what you changed after.' } },
        { text: 'It was fine, I guess.', effects: { rel: { [id]: 0 } },
          reply: { who: id, text: 'Just fine? Come on, tell me one thing you learned next time! Stories like that are great in interviews.' } },
      ] }]);
    } else {
      pool.push([{ who: id, text: 'Is this your first internship? How did the interview go?' }, { choices: [
        { text: lastIv && lastIv.attempts > 1 ? `It took me ${lastIv.attempts} tries. The training between attempts really helped.` : 'I prepared STAR stories and practiced coding out loud. It worked!', effects: { rel: { [id]: 4 }, networking: 1 },
          reply: { who: id, text: lastIv && lastIv.attempts > 1 ? 'Respect. Persistence is underrated. Half the people here needed more than one try.' : 'That\'s exactly the right way to prepare. You\'d be surprised how many people don\'t.' } },
        { text: 'I was really nervous, but I made it!', effects: { rel: { [id]: 3 } }, reply: { who: id, text: 'Everyone\'s nervous. Being nervous means you care.' } },
        { text: 'It was easy.', effects: { rel: { [id]: -1 } }, reply: { who: id, text: 'Must be nice! Maybe don\'t say that too loudly around the other interns, though. (laughs)' } },
      ] }]);
    }
    pool.push([{ who: id, text: role === 'manager' ? `What made you want to work on ${t.team}?` : 'What do you want to specialize in, long term?' }, { choices: t.skills.slice(0, 3).map((sk) => ({
      text: role === 'manager' ? `I want to get really good at ${sk}, and this team does it for real guests.` : `Probably ${sk}. This internship is a great place to start.`,
      effects: { rel: { [id]: 3 } },
      reply: { who: id, text: `${sk}? Great choice. Ask ${IS.characters[t.cast.mentor].short} for their favorite resource on it, and do the related Learning Center lessons.` },
    })).concat([{ text: 'I\'m not sure yet, honestly.', effects: { rel: { [id]: 2 } }, reply: { who: id, text: 'That\'s completely fine. Try a bit of everything. That\'s what these internships are for.' } }]) }]);
    pool.push([{ who: id, text: 'How did you find out about the internship program in the first place?' }, { choices: [
      { text: 'Rosa came to my university\'s career fair, and I applied that week.', effects: { rel: { [id]: 3, rosa: 1 } }, reply: { who: id, text: 'Rosa is the best. Career fairs are underrated. Talking to a real person beats a cold application.' } },
      { text: 'A friend who interned here told me about it.', effects: { rel: { [id]: 3 } }, reply: { who: id, text: 'Referrals are huge. Keep in touch with people you meet here, and you\'ll pay it forward someday.' } },
      { text: 'I found it online and applied on a whim.', effects: { rel: { [id]: 2 } }, reply: { who: id, text: 'Hey, it worked! Always apply. The worst they can say is "not yet."' } },
    ] }]);
    const pick = pool[mem.asked % pool.length];
    mem.asked++;
    return pick;
  }

  function topicsFor(id) {
    const role = roleOf(id);
    const t = E().track();
    const c = IS.characters[id];
    const list = [];
    if (role === 'intern' && D().interns[id]) {
      const d = D().interns[id];
      const topic = IS.learn.topic(t.id, d.spec);
      list.push({ id: 'prev', label: '🎓 Ask about their previous internships', steps: () => [{ who: id, text: d.prev }, { choices: [
        { text: 'What was the biggest thing you learned there?', effects: { rel: { [id]: 2 } }, reply: { who: id, text: 'That real users do things you never expect. Test with real people as early as you can.' } },
        { text: 'That sounds like great experience.', effects: { rel: { [id]: 1 } }, reply: { who: id, text: 'It was! Every internship teaches you something different.' } },
      ] }] });
      list.push({ id: 'path', label: '📝 Ask how they got this internship', steps: () => [{ who: id, text: d.path }, { who: id, text: 'My advice for your next application: ' + U.pick(['keep a list of your wins as they happen, so your STAR stories are ready.', 'practice explaining your code out loud, every time.', 'ask your manager for feedback before the final review, not after.']) }] });
      if (topic) list.push({ id: 'spec', label: `🔧 Ask about their specialty (${topic.title})`, lesson: [t.id, d.spec], steps: () => lessonSteps(id, t.id, d.spec, d.specLine) });
    }
    if (role === 'mentor' && D().mentors[id]) {
      const d = D().mentors[id];
      list.push({ id: 'journey', label: '🧭 Ask how they became an engineer', steps: () => [{ who: id, text: d.journey }] });
      const topic = IS.learn.topic(t.id, d.craft);
      if (topic) list.push({ id: 'craft', label: `🔧 Ask them to explain ${topic.title}`, lesson: [t.id, d.craft], steps: () => lessonSteps(id, t.id, d.craft, 'Oh, I love this topic. Let me explain it the way my mentor explained it to me.') });
      list.push({ id: 'advice', label: '💡 Ask for their best advice', steps: () => [{ who: id, text: d.advice }, { who: id, text: 'And practice. The Learning Center has problems for every topic. Do one a day and it adds up fast.' }] });
    }
    if (role === 'manager') {
      const d = D().managers[id] || {};
      list.push({ id: 'team', label: '🏢 Ask what the team does', steps: () => [{ who: id, text: `${t.team}: ${t.blurb}` }, { who: id, text: `The skills that matter most here: ${t.skills.join(', ')}.` }] });
      if (d.story) list.push({ id: 'story', label: '📖 Ask about a lesson from their career', steps: () => [{ who: id, text: d.story }] });
      list.push({ id: 'offer', label: '🎯 Ask what earns a return offer', steps: () => [{ who: id, text: 'Three things: quality work, delivered on time, and communication. Tell me early when something\'s off.' }, { who: id, text: 'Concretely: an 85%+ overall grade, no more than one missed assignment, and a good working relationship with the team. Your standups count too.' }] });
    }
    if (role === 'cast') D().cast[id].forEach((x) => list.push({ id: x.id, label: '💬 ' + x.label, steps: () => x.lines.map((line) => ({ who: id, text: line })) }));
    if (role === 'intern' || role === 'mentor' || role === 'manager' || id === 'rosa') list.push({ id: 'ask', label: `🙋 Let ${c.short} ask you something`, repeatable: true, steps: () => askSteps(id, role) });
    if (!list.length) list.push({ id: 'chat', label: '💬 Small talk', repeatable: true, steps: () => [{ who: id, text: U.pick(c.chat || ['Nice to see you!']) }] });
    return list;
  }

  // Open a conversation with someone: choose what to talk about.
  function open(id) {
    const s = st();
    const j = s.job;
    const c = IS.characters[id];
    const mem = memory(id);
    const list = topicsFor(id);
    const greet = U.pick(c.chat || ['Hey!']);
    IS.ui.talk({
      id, text: `${U.pick(['Hey!', 'Oh, hi!', 'Good to see you!', 'What\'s up?'])} ${greet}`,
      options: list.map((x) => ({ label: `${x.label}${!x.repeatable && !mem.heard[x.id] ? ' <span class="pill gold">new</span>' : ''}`, cls: 'choice', onClick: (cl) => { cl(); play(id, x); } }))
        .concat([{ label: 'Bye!', cls: 'ghost', onClick: (cl) => { cl(); IS.ui.after(); } }]),
    });
    if (j && j.clockedIn) E().chat(id); // relationship + networking bookkeeping
  }

  // A conversation over coffee: talk about something new, then keep chatting or wrap up.
  function chatOver(id, done) {
    const mem = memory(id);
    const list = topicsFor(id);
    const x = list.find((t) => !t.repeatable && !mem.heard[t.id]) || list.find((t) => t.id === 'ask') || list[0];
    play(id, x, done);
  }

  function play(id, x, done) {
    const mem = memory(id);
    const first = !mem.heard[x.id];
    mem.heard[x.id] = (mem.heard[x.id] || 0) + 1;
    if (first && !x.repeatable) {
      E().changeRel(id, 3);
      const j = st().job;
      if (j) j.stats.learnedFromTalks = (j.stats.learnedFromTalks || 0) + 1;
    }
    IS.ui.playScenes([{ title: `Talking with ${IS.characters[id].short}`, place: done ? '☕ Studio Café' : '💬 Conversation', steps: x.steps() }], () => {
      IS.state.save();
      if (done) {
        const more = topicsFor(id).filter((t) => t.id !== x.id);
        return IS.ui.talk({ id, text: U.pick(['This is nice. What else is new?', 'I needed this break.', 'Okay, one more topic before we head back?']), options: more.slice(0, 3).map((t) => ({ label: t.label, cls: 'choice', onClick: (cl) => { cl(); play(id, t, done); } }))
          .concat(x.lesson ? [{ label: '📚 Save that lesson for later', onClick: (cl) => { cl(); IS.ui.toast('Look for it in the Learning Center: ' + (IS.learn.topic(x.lesson[0], x.lesson[1]) || {}).title, 'gold'); done(); } }] : [])
          .concat([{ label: '☕ Finish up and head back', cls: 'primary', onClick: (cl) => { cl(); done(); } }]) });
      }
      const opts = [{ label: '💬 Keep talking', cls: 'primary', onClick: (cl) => { cl(); open(id); } }];
      if (x.lesson) opts.unshift({ label: '📚 Open that lesson', cls: 'gold', onClick: (cl) => { cl(); IS.learn.open(x.lesson[0], x.lesson[1]); } });
      opts.push({ label: 'Thanks, bye!', cls: 'ghost', onClick: (cl) => { cl(); IS.ui.after(); } });
      IS.ui.talk({ id, text: U.pick(['Anything else on your mind?', 'That was fun. Want to keep chatting?', 'Happy to talk more anytime.']), options: opts });
    });
  }

  return { open, chatOver, topicsFor, roleOf, askSteps };
})();
