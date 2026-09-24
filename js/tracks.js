// Internship tracks (10 of them). Each track file calls IS.registerTrack(def).
// Role placeholders in tasks (from: 'manager' | 'mentor' | 'intern1'..'intern4')
// are resolved to the track's cast when registered.
IS.tracks = [];

IS.registerTrack = function (def) {
  const roles = {
    manager: def.cast.manager, mentor: def.cast.mentor,
    intern1: def.cast.interns[0], intern2: def.cast.interns[1], intern3: def.cast.interns[2], intern4: def.cast.interns[3],
    rosa: 'rosa', harriet: 'harriet', theo: 'theo', ava: 'ava', lena: 'lena',
  };
  const who = (r) => roles[r] || r;
  def.tasks.forEach((t) => {
    t.from = who(t.from || 'manager');
    if (t.peer) t.peer.who = who(t.peer.who);
    if (t.questions && t.type === 'presentation') t.questions.forEach((q) => { q.who = who(q.who); });
    if (t.audience) t.audience = t.audience.map(who);
    t.lang = t.lang || def.lang;
  });
  def.groups.g1.members = def.groups.g1.members.map(who);
  def.groups.g2.members = def.groups.g2.members.map(who);
  def.interview.coding.forEach((p) => { p.lang = p.lang || def.lang; });
  IS.tracks[def.n - 1] = def;
};

IS.trackAt = (level) => IS.tracks[level];

// ── Task templates shared by every track ─────────────────────
IS.T = (function () {
  const GENERIC_HINTS = {
    doc: ['Use a heading for every section the brief lists. Reviewers skim headings first.', 'Name specific risks AND how you would mitigate them.', 'Numbers make a doc credible: dates, targets, sizes.'],
    comms: ['Lead with the bottom line, then details.', 'Be specific: name the task, the status and the date.'],
  };

  function intro(o) {
    return {
      id: 'w-intro', type: 'written', title: `Introduce Yourself in #${o.channel}`, from: 'rosa', day: 1,
      due: { day: 2, minute: 60 }, effort: 15, kind: 'individual', category: 'Communication',
      brief: `<p>Post a short intro in the team Slack channel: a greeting, who you are, your school/major, your role on <b>${o.team}</b>, and something personal. Friendly and professional, 40+ words.</p>`,
      hints: ['3–5 sentences: hello, name + school, team + role, a fun fact, "say hi!"'],
      wiki: '<b>Culture Guide:</b> Good intros are warm, specific and short. Mention your team so people know what to ask you about.',
      peer: { who: 'intern1', text: 'I mentioned my team, my school and that I collect vintage theme-park maps. People DM\'d me about the maps all week.' },
      rubric: {
        minWords: 40, format: 'post',
        sections: [
          { label: 'Greeting', keys: ['hi', 'hello', 'hey', 'greetings', 'howdy', 'good morning'] },
          { label: 'Who you are', keys: ["i'm", 'i am', 'my name', 'name is', 'im '] },
          { label: 'School / major', keys: ['university', 'college', 'school', 'studying', 'major', 'student', 'degree'] },
          { label: 'Team / role', keys: ['team', 'intern', 'engineer', 'engineering', 'data', 'software', o.teamKey || 'team'] },
          { label: 'Something personal', keys: ['love', 'enjoy', 'fun fact', 'hobby', 'favorite', 'excited', 'like to'] },
        ],
        terms: [],
      },
    };
  }

  function standup(o) {
    return {
      id: 'w-standup', type: 'written', title: 'Written Standup Update', from: 'manager', day: o.day,
      due: { day: o.day, minute: 150 }, effort: 20, kind: 'individual', category: 'Communication',
      brief: '<p>Your manager is traveling and asked for async standups. Write three parts: <b>what you did yesterday</b>, <b>what you\'re doing today</b>, and <b>blockers</b>. Be specific (40+ words).</p>',
      hints: ['Use Yesterday / Today / Blockers headers. "No blockers" is a fine answer.', 'Specific beats vague: name tasks and results.'],
      wiki: '<b>Team Norms:</b> Standups are for coordination. Name the task, the progress, and anything you need.',
      peer: { who: 'intern2', text: 'Bullet points under Yesterday / Today / Blockers. Managers love it.' },
      rubric: {
        minWords: 40, format: 'doc',
        sections: [
          { label: 'Yesterday', keys: ['yesterday', 'completed', 'finished', 'did ', 'worked on', 'wrapped up'] },
          { label: 'Today', keys: ['today', 'plan', 'will ', 'going to', 'next'] },
          { label: 'Blockers', keys: ['blocker', 'blocked', 'stuck', 'no blockers', 'none', 'need help', 'waiting on'] },
        ],
        terms: o.terms, termsNeeded: 2,
      },
    };
  }

  function designDoc(o) {
    const sections = [
      { label: 'Overview / Problem', keys: ['overview', 'summary', 'background', 'problem'] },
      { label: 'Goals', keys: ['goal', 'objective', 'success'] },
      { label: 'Proposed design', keys: ['design', 'architecture', 'approach', 'solution', 'component'] },
      { label: 'Data / Interfaces', keys: ['data', 'api', 'interface', 'input', 'schema', 'endpoint'] },
      { label: 'Risks', keys: ['risk', 'concern', 'trade-off', 'tradeoff', 'mitigat', 'edge case'] },
      { label: 'Timeline', keys: ['timeline', 'milestone', 'schedule', 'week'] },
    ];
    if (o.metrics) sections.push({ label: 'Metrics', keys: ['metric', 'measure', 'kpi', 'success criteria', '%'] });
    return {
      id: o.id, type: 'written', title: 'Design Doc: ' + o.title, from: 'manager', day: o.day, due: o.due,
      effort: o.effort || 90, kind: o.group ? 'group' : 'individual', group: o.group, category: 'Design',
      brief: `<p>${o.brief}</p><p>Include: ${sections.map((s) => '<b>' + s.label + '</b>').join(', ')}. Aim for ${o.minWords || 150}+ words.</p>`,
      hints: GENERIC_HINTS.doc.concat(o.hints || []),
      wiki: '<b>Design Doc Template:</b> Overview · Goals / Non-goals · Proposed Design · Data & Interfaces · Risks & Mitigations · ' + (o.metrics ? 'Success Metrics · ' : '') + 'Timeline.',
      peer: o.peer || { who: 'intern1', text: 'Put a risks section with mitigations. Reviewers always ask "what if it breaks?"' },
      rubric: { minWords: o.minWords || 150, format: 'doc', sections, terms: o.terms, termsNeeded: o.termsNeeded || Math.ceil(o.terms.length * 0.6) },
    };
  }

  function email(o) {
    return {
      id: o.id || 'w-email', type: 'written', title: `Email: ${o.subject} to ${o.to}`, from: 'manager', day: o.day, due: o.due,
      effort: 30, kind: 'individual', category: 'Communication',
      brief: `<p>${o.brief} Write to <b>${o.to} (${o.toTitle})</b>: what happened, the impact, your plan and new date, and an apology if appropriate. Concise and professional (80+ words) with a greeting and sign-off.</p>`,
      hints: ['Greeting → What happened → Impact → Plan + date → Thanks → Sign-off.', 'Stakeholders want dates and impact, not stack traces.'],
      wiki: '<b>Stakeholder Comms:</b> Lead with the bottom line. Own the problem without blaming anyone. Always give a new date.',
      peer: { who: 'intern3', text: 'BLUF: bottom line up front. First sentence = the new date.' },
      rubric: {
        minWords: 80, format: 'email',
        sections: [
          { label: 'Greeting', keys: ['hi ', 'hello', 'dear', 'good morning', 'good afternoon', o.to.split(' ')[0].toLowerCase()] },
          { label: 'What happened', keys: ['bug', 'issue', 'found', 'problem', 'error', 'delay'] },
          { label: 'Impact', keys: ['impact', 'delay', 'affect', 'means', 'push'] },
          { label: 'Plan + new date', keys: ['plan', 'fix', 'will be ready', 'by ', 'new date', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
          { label: 'Sign-off', keys: ['thanks', 'thank you', 'best', 'regards', 'sincerely', 'cheers'] },
        ],
        terms: o.terms, termsNeeded: o.termsNeeded || 4,
      },
    };
  }

  function postmortem(o) {
    return {
      id: 'w-postmortem', type: 'written', title: 'Blameless Postmortem: ' + o.title, from: 'manager', day: o.day, due: o.due,
      effort: 60, kind: 'individual', category: 'Communication',
      brief: `<p>Write the postmortem for today's incident. Include <b>Summary</b>, <b>Timeline</b>, <b>Root Cause</b>, <b>Impact</b> and <b>Action Items</b>. Postmortems here are <b>blameless</b>: systems and processes, not people (120+ words).</p>`,
      hints: ['Root cause: what input or condition did the code not handle?', 'Action items should be specific and owned: "Add tests for X (owner: me, Friday)".', 'Avoid "fault", "careless", "blame".'],
      wiki: '<b>SRE Handbook:</b> Blameless postmortems ask "what made this possible?" not "who did this?"',
      peer: { who: 'mentor', text: 'Blameless. The question is why our tests and monitoring didn\'t catch it.' },
      rubric: {
        minWords: 120, format: 'doc', blameless: true,
        sections: [
          { label: 'Summary', keys: ['summary', 'overview', 'tl;dr', 'what happened'] },
          { label: 'Timeline', keys: ['timeline', ' am', ' pm', ':'] },
          { label: 'Root cause', keys: ['root cause', 'cause', 'because', 'why'] },
          { label: 'Impact', keys: ['impact', 'guests', 'affected', 'users'] },
          { label: 'Action items', keys: ['action item', 'follow-up', 'follow up', 'next step', 'prevent', 'todo'] },
        ],
        terms: o.terms, termsNeeded: o.termsNeeded || 4,
      },
    };
  }

  function status(o) {
    return {
      id: 'w-status', type: 'written', title: 'Weekly Status Report', from: 'manager', day: o.day,
      due: { day: o.day, minute: 150 }, effort: 30, kind: 'individual', category: 'Communication',
      brief: '<p>Send your manager a status report: <b>Progress</b>, <b>Risks/Blockers</b>, <b>Next Steps</b> and <b>Asks</b>. 80+ words.</p>',
      hints: ['Traffic-light status helps: on track / at risk / blocked.', 'End with a concrete ask.'],
      wiki: '<b>Team Norms:</b> Progress · Risks · Next steps · Asks. Surface risks early.',
      peer: { who: 'intern2', text: 'Always end with an ask. It makes it easy for your manager to help.' },
      rubric: {
        minWords: 80, format: 'doc',
        sections: [
          { label: 'Progress', keys: ['progress', 'completed', 'done', 'shipped', 'finished', 'merged'] },
          { label: 'Risks / blockers', keys: ['risk', 'blocker', 'concern', 'delay', 'at risk'] },
          { label: 'Next steps', keys: ['next week', 'next step', 'plan', 'upcoming', 'next'] },
          { label: 'Asks', keys: ['ask', 'need', 'help', 'request', 'support', 'could you'] },
        ],
        terms: o.terms, termsNeeded: 3,
      },
    };
  }

  function readme(o) {
    return {
      id: 'w-readme', type: 'written', title: 'Capstone README', from: 'mentor', day: o.day, due: o.due,
      effort: 60, kind: 'group', group: 'g2', category: 'Design',
      brief: `<p>Write the README for the ${o.project} repo: <b>Overview</b>, <b>Setup</b>, <b>Usage</b> (with an example), <b>API/Functions</b>, <b>Testing</b> and <b>Contributing</b>. 150+ words.</p>`,
      hints: ['Document each function you wrote with its inputs and outputs.', 'Show one copy-pasteable example in Usage.'],
      wiki: '<b>Docs Standards:</b> What is it · Getting started · Usage · Reference · Running tests · Contributing.',
      peer: { who: 'mentor', text: 'Future-you in six months is the main audience. Be kind to future-you.' },
      rubric: {
        minWords: 150, format: 'doc',
        sections: [
          { label: 'Overview', keys: ['overview', 'about', 'description', 'what is', 'introduction'] },
          { label: 'Setup', keys: ['install', 'setup', 'set up', 'getting started', 'clone'] },
          { label: 'Usage', keys: ['usage', 'example', 'how to use', 'run '] },
          { label: 'API / Functions', keys: ['api', 'function', 'parameter', 'returns', 'reference', 'query', 'command'] },
          { label: 'Testing', keys: ['test'] },
          { label: 'Contributing', keys: ['contribut', 'pull request', 'license', 'code review'] },
        ],
        terms: o.terms, termsNeeded: 4,
      },
    };
  }

  function selfEval(o) {
    return {
      id: 'w-selfeval', type: 'written', title: 'Self-Evaluation for Final Review', from: 'rosa', day: o.day, due: o.due,
      effort: 60, kind: 'individual', category: 'Communication',
      brief: '<p>Write your self-evaluation: <b>Accomplishments</b>, <b>Challenges</b>, <b>What you learned</b>, <b>Feedback you received</b> and <b>Career goals</b>. Honest and specific (150+ words).</p>',
      hints: ['Name specific projects and results.', 'Challenges + what you did about them > excuses.'],
      wiki: '<b>Intern Program:</b> Self-evaluations are read by your manager and the return-offer committee.',
      peer: { who: 'intern1', text: 'I included one piece of feedback and how I acted on it.' },
      rubric: {
        minWords: 150, format: 'doc',
        sections: [
          { label: 'Accomplishments', keys: ['accomplish', 'proud', 'delivered', 'built', 'shipped', 'completed'] },
          { label: 'Challenges', keys: ['challenge', 'difficult', 'struggle', 'hard', 'mistake'] },
          { label: 'Learning', keys: ['learn', 'grew', 'growth', 'improved', 'skill'] },
          { label: 'Feedback', keys: ['feedback', 'mentor', 'manager', 'advice'] },
          { label: 'Goals', keys: ['goal', 'future', 'want to', 'career', 'next'] },
        ],
        terms: o.terms, termsNeeded: 4,
      },
    };
  }

  function groupDemo(o) {
    return {
      id: 'p-demo', type: 'presentation', title: 'Group Demo: ' + o.project, from: 'manager', day: o.day, due: o.due,
      effort: 90, kind: 'group', group: 'g1', category: 'Presentation',
      brief: `<p>Your team demos <b>${o.project}</b>. Build a <b>4–7 slide</b> deck with a <b>Title</b>, the <b>Problem</b>, your <b>Solution or Demo</b>, and <b>Next Steps</b>. Then present live and answer questions.</p>`,
      slideRange: [4, 7], required: ['title', 'problem', ['solution', 'demo'], 'next'], terms: o.terms,
      audience: ['manager', 'mentor', 'rosa'],
      questions: [
        { who: 'manager', q: o.failQ || 'What happens if a dependency goes down in production?', options: [
          { text: o.failBest || 'We degrade gracefully: show the last good data with a timestamp and alert the on-call engineer.', pts: 10 },
          { text: 'We would notice and restart it.', pts: 5 },
          { text: 'It would probably just break?', pts: 2 },
          { text: 'That won\'t happen.', pts: 0 }] },
        { who: 'mentor', q: 'How did you test it?', options: [
          { text: 'We tried a couple of inputs and it looked right.', pts: 4 },
          { text: 'Unit tests for edge cases (empty input, ties, bad data) plus a manual end-to-end check.', pts: 10 },
          { text: 'It\'s simple, it doesn\'t need tests.', pts: 0 },
          { text: 'Someone else tested it, I think.', pts: 2 }] },
        { who: 'rosa', q: 'What did your team learn about working together?', options: [
          { text: 'It was fine mostly.', pts: 3 },
          { text: 'Honestly, I did most of the work.', pts: 0 },
          { text: 'We named owners on day one, did quick daily check-ins, and paired when someone got stuck.', pts: 10 },
          { text: 'That group projects are hard.', pts: 2 }] },
      ],
      hints: ['Problem → Solution → Demo → Next steps.', 'One idea per slide, 1–3 bullets.'],
      wiki: '<b>Presenting Guide:</b> Open with the user problem. One idea per slide. End with next steps and questions.',
      peer: { who: 'intern1', text: 'I\'ll run the live demo. You take the problem and next steps?' },
    };
  }

  function midpoint(o) {
    return {
      id: 'p-mid', type: 'presentation', title: 'Midpoint Showcase: My Internship So Far', from: 'rosa', day: 11,
      due: { day: 15, minute: 120 }, effort: 120, kind: 'individual', category: 'Presentation',
      brief: '<p>Give a <b>5–8 slide</b> midpoint presentation: <b>Title</b>, <b>Agenda</b>, your <b>Results</b>, <b>Challenges & Learnings</b>, and <b>Next Steps</b>.</p>',
      slideRange: [5, 8], required: ['title', 'agenda', 'results', 'challenges', 'next'],
      terms: ['learn', 'test', 'team', 'feedback', 'goal', 'review', 'deadline'].concat(o.terms || []),
      audience: ['manager', 'mentor', 'rosa', 'intern1'],
      questions: [
        { who: 'manager', q: 'Which piece of work are you most proud of so far, and why?', options: [
          { text: 'All of it, equally.', pts: 3 },
          { text: o.proudBest || 'The group project deliverable: it handled the edge cases, shipped on time, and had tests.', pts: 10 },
          { text: 'Probably the training quiz?', pts: 2 },
          { text: 'I\'m not really proud of anything yet.', pts: 1 }] },
        { who: 'mentor', q: 'What\'s one thing you\'d do differently?', options: [
          { text: 'Nothing, really.', pts: 1 },
          { text: 'Ask for help sooner. I\'d write down what I tried and bring it to you instead of staying stuck.', pts: 10 },
          { text: 'Get easier tasks.', pts: 0 },
          { text: 'Work faster, I guess.', pts: 4 }] },
        { who: 'rosa', q: 'What do you want from the second half?', options: [
          { text: 'Own a bigger piece of the capstone end-to-end and present it to leadership.', pts: 10 },
          { text: 'Just finish, honestly.', pts: 2 },
          { text: 'A return offer.', pts: 5 },
          { text: 'More free churros.', pts: 3 }] },
      ],
      hints: ['Results slides land best with numbers.', 'Be honest in Challenges.'],
      wiki: '<b>Intern Program:</b> The midpoint is a check-in: what you did, learned and want next.',
      peer: { who: 'intern3', text: 'I put a chart of my grades on the results slide. Nerdy but effective.' },
    };
  }

  function finalPres(o) {
    return {
      id: 'p-final', type: 'presentation', title: 'Final Capstone Presentation: ' + o.project, from: 'harriet', day: 26,
      due: { day: 33, minute: 150 }, effort: 150, kind: 'group', group: 'g2', category: 'Presentation',
      brief: `<p>The big one: your team presents <b>${o.project}</b> to <b>Harriet Lin (VP, Creative Technology)</b> and your team. Build <b>6–10 slides</b> with a <b>Title</b>, <b>Problem</b>, <b>Solution</b>, <b>Architecture</b>, <b>Demo</b>, <b>Results/Metrics</b> and <b>Next Steps</b>.</p>`,
      slideRange: [6, 10], required: ['title', 'problem', 'solution', 'architecture', 'demo', 'results', 'next'],
      terms: o.terms, audience: ['harriet', 'manager', 'mentor', 'rosa'], questions: o.questions,
      hints: ['Open with a guest story.', 'Architecture: inputs → processing → outputs.', 'Have a privacy/safety answer ready.'],
      wiki: '<b>Exec Presentations:</b> Lead with guest impact, show a crisp architecture, prove it with a demo and numbers, close with next steps.',
      peer: { who: 'intern3', text: 'I\'ll run the demo. You take architecture and Q&A?' },
    };
  }

  return { intro, standup, designDoc, email, postmortem, status, readme, selfEval, groupDemo, midpoint, finalPres };
})();

// Presentation slide types available in the deck builder.
IS.slideTypes = [
  { id: 'title', label: 'Title', icon: '🎬', tip: 'Project name, team, date' },
  { id: 'agenda', label: 'Agenda', icon: '🗂️', tip: 'What you will cover' },
  { id: 'problem', label: 'Problem', icon: '❓', tip: 'The guest or business problem' },
  { id: 'solution', label: 'Solution', icon: '💡', tip: 'What you built / propose' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️', tip: 'How the pieces fit together' },
  { id: 'demo', label: 'Demo', icon: '🖥️', tip: 'Show it working' },
  { id: 'results', label: 'Results & Metrics', icon: '📈', tip: 'Numbers, outcomes, impact' },
  { id: 'challenges', label: 'Challenges & Learnings', icon: '🧗', tip: 'What was hard, what you learned' },
  { id: 'timeline', label: 'Timeline', icon: '🗓️', tip: 'Milestones' },
  { id: 'team', label: 'Team & Thanks', icon: '🤝', tip: 'Credit people' },
  { id: 'next', label: 'Next Steps', icon: '➡️', tip: 'What happens after today' },
  { id: 'qa', label: 'Q&A', icon: '🙋', tip: 'Invite questions' },
  { id: 'meme', label: 'Meme Slide', icon: '🐸', tip: 'Risky...' },
];
