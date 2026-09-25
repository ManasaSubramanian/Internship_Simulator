// Learning Center: Interview prep and Assignment prep sections, built for each
// internship from its own interview questions, tasks and language.
// (The Concepts section is the hand-written lessons in js/data/learn/lNN-*.js.)
IS.learnPrep = (function () {
  const cache = {};
  const plain = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const choice = (id, title, brief, options, answer, explain, hint) => ({ id, type: 'choice', title, brief: `<p>${brief}</p>`, options, answer, explain, hint, solution: options[answer] });

  const QUALITY = {
    javascript: ['No leftover console.log calls', 'A short // comment explaining your approach', 'const/let instead of var'],
    python: ['No leftover print() debugging', 'A # comment or docstring explaining your approach', 'No global variables'],
    cpp: ['No cout/printf debugging inside functions', 'A // comment explaining your approach', 'No mutable global variables'],
    sql: ['Name the columns (no SELECT *)', 'A -- comment saying what the query answers', 'SQL keywords in CAPITALS'],
    web: ['<html lang="en"> for screen readers', 'addEventListener instead of onclick="…"', 'Semantic elements (main, button, label…)'],
    yaml: ['# comments on non-obvious settings', 'Consistent 2-space indentation', 'No tabs or trailing spaces'],
    shell: ['Every objective completed', 'Check your work with cat or ls', 'Never delete what you don\'t understand'],
  };

  function trackLangs(track) {
    const kinds = new Set(track.tasks.map((t) => (t.type === 'coding' ? t.lang : t.type === 'sql' ? 'sql' : t.type === 'web' ? 'web' : t.type === 'config' ? 'yaml' : t.type === 'terminal' ? 'shell' : null)).filter(Boolean));
    return Array.from(kinds);
  }

  const solLines = (p) => (Array.isArray(p.solution) ? p.solution : p.solution.replace(/\n+$/, '').split('\n'));

  // A worked example from one of the track's own practice solutions.
  function sampleSolution(track) {
    const concepts = IS.learnData[track.id] || [];
    for (const topic of concepts) {
      const p = topic.practice.find((x) => typeof x.solution === 'string' && x.type !== 'choice' && x.type !== 'web' && x.solution.split('\n').length >= 3 && x.solution.split('\n').length <= 12);
      if (p) return { p, topic };
    }
    return null;
  }

  function interviewTopics(track) {
    const concepts = track.interview.concepts;
    const ex = concepts[concepts.length - 1];
    const wrong = ex.options.map((o, i) => ({ o, i })).filter((x) => x.i !== ex.answer);
    const live = track.interview.coding;
    const sample = sampleSolution(track);
    const list = [];
    list.push({
      id: 'iv-how', section: 'interview', icon: '🗺️', title: 'How the interview works',
      summary: `What happens in the ${track.title} interview, how it\'s scored, and what happens if you don\'t pass.`,
      tags: ['interview', 'offer', 'training', 'round'],
      words: `<p>Every internship starts with an interview in two rounds. You need a score of <b>70 or more on each round</b> to get the offer.</p>
        <ul><li><b>Behavioral round:</b> five questions about how you handle situations (teamwork, mistakes, deadlines) plus one short written answer about why you want the role. If you're coming back with a return offer, this round is skipped.</li>
        <li><b>Technical round:</b> four multiple-choice concept questions about ${esc(track.langLabel)}, then a <b>live problem</b> with a 20-minute timer. The live problem counts more: 60% of the technical score.</li></ul>
        <p>Didn't pass? That's normal and fixable. You go through <b>training</b>: work through the lessons here and solve practice problems. Each completed training adds a <b>+5 prep bonus</b> to both rounds (up to +15). Then you retry, with different questions.</p>
        <div class="analogy">🎢 <b>Like a ride height check:</b> it isn't personal and it isn't final. Grow a little (practice) and come back.</div>`,
      terms: [['Behavioral round', 'Questions about how you act in real situations.'], ['Technical round', 'Concept questions plus a timed live problem.'], ['Prep bonus', 'Extra points on each round for every training you complete (max +15).']],
      example: { lang: 'text', heading: 'See the interview day, step by step', code: 'Welcome letter from Rosa\nBehavioral: 5 situation questions\nBehavioral: 1 written answer (why this role?)\nTechnical: 4 concept questions\nTechnical: 1 live problem, 20-minute timer\nResult letter: offer, or training then retry', steps: [
        { lines: [1], text: 'You start from the Career Center. Study first in the Learning Center if you like. There\'s no time limit before you begin.' },
        { lines: [2, 3], text: 'The behavioral round. Pick the answers a great teammate would give, and write a specific answer, 50 words or more.' },
        { lines: [4], text: 'Concept questions. Read every option before choosing.' },
        { lines: [5], text: 'The live problem. Run the visible tests often. Hidden tests run when you submit.' },
        { lines: [6], text: 'Pass both rounds for the offer. Otherwise the letter lists what to work on.' },
      ] },
      practice: [
        choice('iv-how-1', 'Passing score', 'What do you need to get the offer?', ['70+ on the behavioral round OR the technical round', '70+ on EACH round', 'An average of 50', 'A perfect score on the live problem'], 1, 'Both rounds must be 70 or higher. A great technical score can\'t make up for a weak behavioral round.', 'Think "each".'),
        choice('iv-how-2', 'If you don\'t pass', 'You scored 64 on the technical round. What happens?', ['You can never apply again', 'You complete training, earn a prep bonus, and retry with new questions', 'You get the offer anyway', 'You must wait a month'], 1, 'Training plus a retry, as many times as you need. Each training adds +5 (max +15) to each round.', 'Look for the hopeful answer.'),
        choice('iv-how-3', 'Return offers', 'You earned a return offer from your last internship. How is your next interview different?', ['It\'s canceled', 'The behavioral round is skipped', 'The live problem is easier', 'You get double time'], 1, 'Your team already vouched for how you work, so only the technical round remains.', 'Which round measures teamwork?'),
      ],
    });
    list.push({
      id: 'iv-behavioral', section: 'interview', icon: '🗂️', title: 'Behavioral round: build a story bank',
      summary: 'Prepare four stories once and reuse them for almost any behavioral question.',
      tags: ['behavioral', 'star', 'story', 'interview'],
      words: `<p>Behavioral questions all sound different ("a time you disagreed", "a time you failed", "a time you helped someone") but they come from a small set of themes. So instead of preparing for every question, prepare a <b>story bank</b>: four real stories from your life, each told with <b>STAR</b> (Situation, Task, Action, Result).</p>
        <ul><li><b>A challenge</b> you worked through (a hard project, a tough bug).</li>
        <li><b>A mistake</b> you owned and fixed.</li>
        <li><b>A teamwork moment</b>: a disagreement you resolved, or someone you helped.</li>
        <li><b>Something you're proud of</b>, with a measurable result.</li></ul>
        <p>In the interview, pick the story that fits the question best and adapt the ending to what they asked. In this game, pick the answer that is specific, honest, owns the problem and shows teamwork.</p>
        <div class="analogy">🧰 <b>Like a toolbox:</b> four good tools handle almost any job. You don't need a new tool for every screw.</div>`,
      terms: [['Story bank', 'A few prepared STAR stories you reuse.'], ['STAR', 'Situation, Task, Action, Result.'], ['Owning it', 'Saying "I" did it, including mistakes.']],
      example: { lang: 'text', heading: 'See an example story bank', code: 'Challenge: rebuilt our club website in 2 weeks when the old one broke\nMistake: deleted a shared file, told the team at once, restored the backup\nTeamwork: paired with a stuck teammate the night before our demo\nProud of: my bus-tracker app, used by 200 students a day', steps: [
        { lines: [1], text: 'A <b>challenge</b> story works for "hardest project", "tight deadline" and "something you learned quickly".' },
        { lines: [2], text: 'A <b>mistake</b> story: own it, show the fix, say what you changed. Works for "failure" and "feedback" questions.' },
        { lines: [3], text: 'A <b>teamwork</b> story covers "conflict", "helping others" and "working with different people".' },
        { lines: [4], text: 'A <b>proud of</b> story with a number (200 students) covers "impact" and "why should we hire you".' },
      ] },
      practice: [
        choice('iv-beh-1', 'Pick the story', 'The question is "Tell me about a time you received critical feedback." Which story from the bank fits best?', ['The mistake story: you acted on what went wrong', 'The proud-of story', 'Talk about your favorite class', 'Say you never get feedback'], 0, 'Feedback and mistake questions pair naturally: what you heard, what you changed, what improved.', 'Which story involves learning from something that went wrong?'),
        choice('iv-beh-2', 'The best answer', 'A teammate isn\'t doing their part a day before a demo. What does a strong candidate say?', ['I did their part myself without telling anyone', 'I reported them to the manager right away', 'I asked them privately if they were stuck, offered to pair, and we finished together', 'I let the demo fail so they\'d learn'], 2, 'Talk to the person first, offer help and protect the team goal. Escalate only if that doesn\'t work.', 'Talk first, escalate later.'),
        choice('iv-beh-3', 'Why this role?', 'Which written answer to "Why do you want this internship?" will score best?', ['I need a job.', `I love theme parks and want to learn ${track.langLabel} on real systems. At school I built a small app that 50 people used, and I want to grow with a mentor on ${track.team}.`, 'It seemed OK.', 'Because I\'m the best programmer.'], 1, 'Specific motivation, a concrete example with a number, and a growth goal tied to the team.', 'Specific, enthusiastic, and about growth.'),
      ],
    });
    list.push({
      id: 'iv-concepts', section: 'interview', icon: '🧠', title: `Concept questions: ${track.langLabel}`,
      summary: 'A reliable method for multiple-choice questions, practiced on real interview questions for this internship.',
      tags: ['concept', 'interview', 'question', 'multiple choice'],
      words: `<p>The technical round starts with four multiple-choice questions about ${esc(track.langLabel)} and how the team works. They check understanding, not memorization. A calm method helps:</p>
        <ol><li><b>Read the whole question</b>, including words like "not", "first" and "best".</li>
        <li><b>Predict the answer</b> in your head before looking at the options.</li>
        <li><b>Eliminate</b> options that are clearly wrong, joke answers or unsafe practices.</li>
        <li><b>Choose</b> between what's left. Prefer the answer a careful, safe professional would give.</li></ol>
        <p>The Concepts section of this internship teaches everything these questions cover. Below you'll practice three real questions from this internship's interview bank.</p>
        <div class="analogy">🔎 <b>Like a detective:</b> rule out suspects one by one until only one answer fits the evidence.</div>`,
      terms: [['Eliminate', 'Cross out options that can\'t be right.'], ['Distractor', 'A tempting wrong option designed to catch rushing.']],
      example: { lang: 'text', heading: 'See the method on a real question', code: `Q: ${ex.q}\n${ex.options.map((o, i) => String.fromCharCode(65 + i) + ') ' + o).join('\n')}`, steps: [
        { lines: [1], text: 'Read the question slowly and predict an answer before looking at the options.' },
        { lines: [2 + wrong[0].i], text: `Eliminate: "${esc(wrong[0].o)}" doesn't fit what the question asks.` },
        { lines: [2 + wrong[1].i], text: `Eliminate: "${esc(wrong[1].o)}" is another distractor.` },
        { lines: [2 + ex.answer], text: `Choose: "${esc(ex.options[ex.answer])}" is correct. It's the careful, accurate answer.` },
      ] },
      practice: concepts.slice(0, 3).map((q, i) => choice(`iv-con-${i + 1}`, `Interview question ${i + 1}`, esc(q.q), q.options, q.answer, `Correct: "${esc(q.options[q.answer])}". If this one surprised you, review the Concepts lessons for this internship.`, 'Eliminate the clearly wrong options first.')),
    });
    list.push({
      id: 'iv-live', section: 'interview', icon: '⏱️', title: 'The live problem: solving under a timer',
      summary: 'A step-by-step routine for the 20-minute problem, practiced on this internship\'s interview problems.',
      tags: ['interview', 'live', 'problem', 'timer', 'edge case', 'test'],
      words: `<p>The live problem is the biggest part of the technical score. You get <b>20 minutes</b>. Visible tests show examples, and <b>hidden tests</b> run when you submit, usually on edge cases. A routine keeps you calm:</p>
        <ol><li><b>Restate the problem</b> in one sentence. What goes in, what comes out?</li>
        <li><b>Work one example by hand</b> using the visible tests.</li>
        <li><b>List edge cases</b>: empty input, zero, negatives, ties, one item, missing data.</li>
        <li><b>Write the simplest correct solution first.</b> Fancy can come later.</li>
        <li><b>Run the visible tests</b>, fix what fails, then check your edge cases before submitting.</li></ol>
        <p>Don't leave it unfinished. A simple working answer beats a clever broken one, and time running out submits whatever is in the editor.</p>
        <div class="analogy">🧗 <b>Like climbing with a guide rope:</b> small, safe steps you can check, not one giant leap.</div>`,
      terms: [['Visible tests', 'Examples you can run anytime.'], ['Hidden tests', 'Extra checks run on submit, usually edge cases.'], ['Edge case', 'An unusual input: empty, zero, negative, a tie…']],
      example: sample ? {
        lang: sample.p.lang || (sample.p.type === 'sql' ? 'sql' : sample.p.type === 'terminal' ? 'bash' : sample.p.type === 'config' ? 'yaml' : track.lang),
        heading: 'See a solved practice problem',
        intro: `From the Concepts lesson "${esc(sample.topic.title)}": <i>${esc(plain(sample.p.brief)).slice(0, 180)}</i>`,
        code: solLines(sample.p).join('\n'),
        steps: (() => {
          const n = solLines(sample.p).length;
          const mid = Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2);
          return [
            { lines: [1], text: 'Start from the signature (or first line): be clear about what goes in and what must come out.' },
            { lines: mid.length ? mid : [1], text: 'The core logic: the simplest steps that turn the input into the answer. Each line does one thing.' },
            { lines: [n], text: 'The finish: return (or produce) the answer. Then think about edge cases: what if the input is empty?' },
          ];
        })(),
      } : null,
      practice: live.map((p) => Object.assign({}, p, { id: 'iv-' + p.id, expectedId: p.id, hint: 'Follow the routine: restate, example by hand, edge cases, simplest solution, then test.', solution: null, noSolution: true })),
    });
    return list;
  }

  function assignmentTopics(track) {
    const langs = trackLangs(track);
    const review = track.tasks.find((t) => t.type === 'review');
    const design = track.tasks.find((t) => t.id === 'w-design1') || track.tasks.find((t) => t.type === 'written');
    const concepts = IS.learnData[track.id] || [];
    const techPractice = concepts.map((t) => t.practice.find((p) => p.type !== 'choice' && p.solution != null)).filter(Boolean).slice(0, 3)
      .map((p) => Object.assign({}, p, { id: 'as-' + p.id, expectedId: p.id }));
    const sample = sampleSolution(track);
    const q = QUALITY[langs[0]] || QUALITY.javascript;
    const list = [];
    list.push({
      id: 'as-grading', section: 'assignments', icon: '📏', title: 'How your work is graded',
      summary: 'Rubrics, tests, deadlines, focus time and what counts toward your final grade.',
      tags: ['grade', 'rubric', 'deadline', 'late', 'focus', 'submit'],
      words: `<p>Every assignment is graded with a <b>visible rubric</b>, a list of what earns points. You'll see the full breakdown after you submit, so you can learn from it.</p>
        <ul><li><b>Technical work</b> (code, SQL, pages, configs, terminal): 85% from passing tests (visible <i>and</i> hidden), 15% from code quality.</li>
        <li><b>Writing</b> (design docs, emails, postmortems): the right sections, key terms and enough detail.</li>
        <li><b>Code reviews</b>: finding the real problems, avoiding false alarms, and a kind, specific comment.</li>
        <li><b>Presentations and standups</b>: structure, clarity and how you handle questions.</li></ul>
        <p><b>Time:</b> each task needs real <b>focus time</b> (minutes with it open on your computer) before you can submit. <b>Deadlines:</b> late work loses 10% per workday and costs pay, and more than two days late counts as missed. Ask for an extension <i>before</i> the deadline.</p>
        <p><b>Final grade:</b> 75% assignments, 10% daily tickets, 15% standups. About 85%+ with at most one missed assignment earns a return offer.</p>
        <div class="analogy">🧾 <b>Like a recipe contest scorecard:</b> the judges tell you exactly what they're scoring, so read the card before you cook.</div>`,
      terms: [['Rubric', 'The list of graded criteria.'], ['Focus time', 'Real minutes spent with the task open.'], ['Hidden tests', 'Checks you can\'t see until you submit.']],
      example: { lang: 'text', heading: 'See a graded rubric', code: 'Tests passing (visible + hidden) ...... 85 / 85\n' + q.map((x) => (x + ' ').padEnd(38, '.') + ' 5 / 5').join('\n') + '\nTotal ................................ 100 / 100', steps: [
        { lines: [1], text: 'Most of the grade: every visible and hidden test passing. Edge cases matter!' },
        { lines: [2, 3, 4], text: `Quality points for ${esc(track.langLabel)}. They\'re easy to earn if you know the rules.` },
        { lines: [5], text: 'Submitted on time, so no late penalty.' },
      ] },
      practice: [
        choice('as-gr-1', 'Where the points are', 'On a coding assignment, what earns most of the grade?', ['Code length', 'Passing the visible AND hidden tests', 'Using advanced features', 'Submitting early'], 1, '85% comes from tests, including hidden ones, so edge cases really matter.', 'Look at the rubric example.'),
        choice('as-gr-2', 'Running late', 'It\'s the day before a deadline and you won\'t finish. What\'s best?', ['Submit late without saying anything', 'Ask your manager for an extension now, before the deadline', 'Skip it entirely', 'Ask after the deadline'], 1, 'Extensions must be requested before the deadline, and asking early is seen as professional.', 'Timing matters.'),
        choice('as-gr-3', 'Focus time', 'Why can\'t you submit a task right after opening it?', ['A bug', 'Each task needs its full focus time: real minutes with it open while you work', 'You need your manager\'s approval', 'Submissions only open on Fridays'], 1, 'Work takes real time here. Focus time grows while the task is open and you\'re active.', 'What does the focus bar measure?'),
      ],
    });
    list.push({
      id: 'as-tech', section: 'assignments', icon: '💻', title: `Technical assignments in ${track.langLabel}`,
      summary: 'A workflow for technical tasks, plus the quality rules graders check for this internship.',
      tags: ['coding', 'test', 'quality', 'comment', 'edge case', 'bug'],
      words: `<p>Technical assignments come with a <b>brief</b>, <b>starter code</b> and <b>visible tests</b>. A reliable workflow:</p>
        <ol><li>Read the brief twice. Underline the inputs, outputs and special rules ("empty list → 0").</li>
        <li>Run the visible tests on the starter to see what fails.</li>
        <li>Make one small change at a time, then run the tests again.</li>
        <li>Think about hidden tests: empty inputs, zeros, negatives, ties, bad data.</li>
        <li>Add a short comment explaining your approach, remove debug output, and submit.</li></ol>
        <p>Quality points for this internship: <b>${q.map(esc).join('</b>; <b>')}</b>.</p>
        <p>Stuck for more than 15 minutes? Ask a fellow intern or your mentor, check the wiki, or open the related lesson from the task's <b>Get help</b> panel.</p>
        <div class="analogy">🔧 <b>Like tuning a guitar:</b> small adjustment, listen (run the tests), adjust again.</div>`,
      terms: [['Brief', 'The task description.'], ['Starter code', 'The code you begin with.'], ['Debug output', 'Temporary print statements. Remove them before submitting.']],
      example: sample ? { lang: sample.p.lang || (sample.p.type === 'sql' ? 'sql' : sample.p.type === 'terminal' ? 'bash' : sample.p.type === 'config' ? 'yaml' : track.lang), heading: 'See a clean, submittable solution',
        intro: `A solved practice problem: <i>${esc(sample.p.title)}</i>`,
        code: solLines(sample.p).join('\n'),
        steps: (() => {
          const n = solLines(sample.p).length;
          return [
            { lines: [1], text: 'Clear names from the start, matching exactly what the brief asks for.' },
            { lines: Array.from({ length: Math.max(1, n - 2) }, (_, i) => Math.min(n, i + 2)), text: 'Small, readable steps. No debug output left behind.' },
            { lines: [n], text: 'One clear result. Before submitting, add a short comment explaining the approach. It\'s worth quality points.' },
          ];
        })() } : null,
      practice: techPractice,
    });
    list.push({
      id: 'as-writing', section: 'assignments', icon: '✍️', title: 'Writing assignments: docs, emails and postmortems',
      summary: 'What graders look for in each kind of written work, and how to structure it.',
      tags: ['design doc', 'email', 'postmortem', 'readme', 'status', 'self-evaluation', 'writing'],
      words: `<p>About a third of your assignments are writing. Each type has a job and a shape:</p>
        <ul><li><b>Design doc</b> (group projects): goals, approach, who does what, risks and a timeline. Written <i>before</i> building.</li>
        <li><b>Stakeholder email</b>: bottom line first, the reason, what's not affected, the next step, a polite close.</li>
        <li><b>Postmortem</b> (after an incident): summary, timeline, root cause, impact, action items. Blameless: about systems, not people.</li>
        <li><b>Status update / standup doc</b>: done, next, blocked.</li>
        <li><b>README</b>: what it is, how to run it, how to use it, known limitations.</li>
        <li><b>Self-evaluation</b>: strengths with examples, growth areas, goals.</li></ul>
        <p>The rubric checks for headings or sections, the key terms from the brief, and enough words to be complete. Use <b>headings</b> that match the brief's list, and be specific: names, dates, numbers.</p>
        <div class="analogy">🏗️ <b>Like a building permit:</b> the inspector has a checklist. Make each item easy to find.</div>`,
      terms: [['Design doc', 'A plan written before building.'], ['Postmortem', 'A blameless incident write-up.'], ['Action item', 'A concrete follow-up with an owner.']],
      example: { lang: 'text', heading: design ? `See an outline for "${esc(design.title)}"` : 'See a design doc outline', code: `# ${design ? design.title : 'Design Doc'}\n## Goals\n## Approach\n## Team & owners\n## Risks & mitigations\n## Timeline`, steps: [
        { lines: [1], text: 'A clear title that matches the assignment.' },
        { lines: [2], text: '<b>Goals:</b> what success looks like, ideally with a number ("updates every 60 seconds").' },
        { lines: [3], text: '<b>Approach:</b> how you\'ll build it, using the key terms from the brief.' },
        { lines: [4], text: '<b>Owners:</b> who does what. Group projects are graded on teamwork too.' },
        { lines: [5], text: '<b>Risks:</b> what could go wrong and your plan for each.' },
        { lines: [6], text: '<b>Timeline:</b> dates or days for each milestone.' },
      ] },
      practice: [
        choice('as-wr-1', 'Postmortem sections', 'Which section does NOT belong in a postmortem?', ['Timeline', 'Root cause', 'Who to blame', 'Action items'], 2, 'Postmortems are blameless. They fix systems and processes, not people.', 'Remember "blameless".'),
        choice('as-wr-2', 'Email first line', 'Your feature is delayed one day. What should the email\'s first line say?', ['A long apology', 'The new date and that it\'s one day late', 'Technical details of the bug', 'A question about their weekend'], 1, 'Bottom line first: what changed and by how much. Details come after.', 'Bottom line first.'),
        choice('as-wr-3', 'Getting full marks', 'What most improves a writing grade here?', ['Using a fancy font', 'Headings that match the sections the brief asks for, plus specific details', 'Writing as much as possible', 'Emojis'], 1, 'The rubric looks for the required sections and key terms. Headings make them easy to find.', 'Read the brief\'s list of sections.'),
      ],
    });
    if (review) {
      const real = review.issues.map((x, i) => ({ x, i })).filter((y) => y.x.real);
      const fake = review.issues.filter((x) => !x.real).map((x) => x.text);
      list.push({
        id: 'as-review', section: 'assignments', icon: '🔍', title: 'Code review assignments',
        summary: 'How to find real problems (and avoid false alarms), using this internship\'s own review as an example.',
        tags: ['review', 'pull request', 'issue', 'feedback', 'comment'],
        words: `<p>In a code review assignment you see a small piece of code, a list of possible issues, and a comment box. You're graded on:</p>
          <ul><li><b>Real issues found</b> (70%): check each item against the code. Is it truly a problem?</li>
          <li><b>False alarms</b>: flagging non-problems <i>costs</i> points, so don't just tick everything.</li>
          <li><b>Your comment</b> (30%): specific (name the problems), constructive (suggest fixes), and kind.</li></ul>
          <p>Look for problems in this order: correctness and edge cases, security and privacy, reliability, then readability.</p>
          <div class="analogy">🩺 <b>Like a doctor's checkup:</b> find what's really wrong, don't invent problems, and explain the treatment kindly.</div>`,
        terms: [['False alarm', 'Flagging something that isn\'t actually a problem.'], ['Constructive', 'Suggesting how to fix it, not just what\'s wrong.']],
        example: { lang: /select|from/i.test(review.code) && !/def |function/.test(review.code) ? 'sql' : track.lang === 'shell' ? 'bash' : track.lang === 'web' ? 'html' : track.lang, heading: `See "${esc(review.title)}" reviewed`, intro: 'The code from this internship\'s first review, and what a strong reviewer notices:',
          code: review.code,
          steps: real.slice(0, 4).map((y) => ({ text: '<b>Real issue:</b> ' + esc(y.x.text) })).concat([{ text: 'And the false alarms to skip, for example: ' + esc(fake[0] || '') }]) },
        practice: real.slice(0, 3).map((y, k) => {
          const opts = [y.x.text].concat(fake.slice(0, 3));
          const order = [[1, 0, 2, 3], [2, 3, 0, 1], [3, 1, 2, 0]][k].filter((i) => i < opts.length);
          const shuffled = order.map((i) => opts[i]);
          return choice(`as-rv-${k + 1}`, `Spot the real issue ${k + 1}`, `Reviewing "${esc(review.title)}": which of these is a <b>real</b> problem?`, shuffled, shuffled.indexOf(y.x.text), 'Real issue: ' + esc(y.x.text) + ' The others are false alarms.', 'Check each option against the code. Is it truly wrong?');
        }),
      });
    }
    list.push({
      id: 'as-present', section: 'assignments', icon: '🎤', title: 'Presentations and daily standups',
      summary: 'How standup decks and project presentations are graded, and how to ace both.',
      tags: ['presentation', 'standup', 'slides', 'demo', 'deck'],
      words: `<p>You present every day at <b>standup</b> (1–2 slides) and at a few bigger project <b>presentations</b>.</p>
        <p><b>Standup slides</b> are graded on: naming the <b>specific task</b> you worked on (30), showing <b>progress</b> (15), saying what's <b>next</b> (20), mentioning <b>blockers</b> or "no blockers" (15), a title and content on each slide (10), and being <b>concise</b>, 12 to 80 words (10). Standups are 15% of your final grade.</p>
        <p><b>Presentations</b> are graded on your deck (the required slide types, enough slides, key terms), your opening, how you handle a surprise, and your answers to audience questions.</p>
        <div class="analogy">📣 <b>Like a weather report:</b> short, specific and useful. What happened, what's coming, and anything to watch out for.</div>`,
      terms: [['Standup', 'A daily 5-minute team check-in.'], ['Blocker', 'Something stopping your progress.'], ['Deck', 'A set of slides.']],
      example: { lang: 'text', heading: 'See a full-marks standup deck', code: `Slide 1: Yesterday\nFinished "${(track.tasks.find((t) => t.type === 'coding') || track.tasks[0]).title}". All tests pass.\nSlide 2: Today & blockers\nNext I will start my daily ticket and the design doc.\nNo blockers.`, steps: [
        { lines: [1, 2], text: 'Slide 1 names the <b>specific task</b> and shows <b>progress</b> ("all tests pass").' },
        { lines: [3, 4], text: 'Slide 2 says what\'s <b>next</b> today.' },
        { lines: [5], text: 'It always mentions <b>blockers</b>, even when there aren\'t any.' },
      ] },
      practice: [
        choice('as-pr-1', 'Best standup', 'Which standup update scores highest?', ['Working on stuff.', 'Yesterday I finished the login form tests; today I\'ll start the search page. Blocked: need the API key from IT.', 'I have been very busy with many things and will continue to be busy.', 'Nothing to report.'], 1, 'Specific task, progress, next step and a blocker, all in one line.', 'Look for done, next and blockers.'),
        choice('as-pr-2', 'Standup length', 'How long should a standup update be?', ['A 5-minute speech', 'A few specific sentences (12–80 words)', 'One word', 'As long as possible'], 1, 'Standups are short by design. Everyone gets a turn in 5 minutes.', 'Check the rubric numbers.'),
        choice('as-pr-3', 'Hard question', 'During your presentation a VP asks something you don\'t know. What do you say?', ['Make something up', '"Great question. I don\'t know yet, but I\'ll find out and follow up today."', 'Change the subject', 'Say it\'s not important'], 1, 'Honesty plus a follow-up builds trust.', 'What builds trust?'),
      ],
    });
    return list.filter((t) => t.practice && t.practice.length);
  }

  function build(trackId) {
    if (cache[trackId]) return cache[trackId];
    const track = IS.tracks.find((t) => t && t.id === trackId);
    if (!track) return [];
    const out = interviewTopics(track).concat(assignmentTopics(track)).map((t) => (t.example ? t : Object.assign(t, {
      example: { lang: 'text', heading: 'See the checklist', code: 'Read the brief twice\nRun the visible tests early\nThink about edge cases\nSubmit before the deadline', steps: [{ lines: [1], text: 'Know exactly what\'s asked.' }, { lines: [2], text: 'Find out what fails right away.' }, { lines: [3], text: 'Hidden tests love edge cases.' }, { lines: [4], text: 'On time beats perfect.' }] },
    })));
    cache[trackId] = out;
    return out;
  }

  return { build, QUALITY };
})();
