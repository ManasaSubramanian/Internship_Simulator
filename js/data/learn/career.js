// Learning Center: career skills shared by every internship.
IS.learnData = IS.learnData || {};
IS.learnData.career = [
  {
    id: 'star', icon: '⭐', title: 'Answering interview questions with STAR',
    summary: 'A simple four-part recipe for telling a clear, convincing story about something you did.',
    tags: ['interview', 'star', 'behavioral'],
    words: `<p>In a <b>behavioral interview</b>, the interviewer asks about times you handled real situations: <i>"Tell me about a time you disagreed with a teammate."</i> They aren't looking for a perfect person. They want to see <b>how you think and act</b>.</p>
      <p>The easiest way to answer well is the <b>STAR</b> recipe. You tell your story in four short parts, in this order:</p>
      <ul><li><b>S – Situation:</b> set the scene in one or two sentences. Where were you, and what was going on?</li>
      <li><b>T – Task:</b> what were <i>you</i> responsible for? What was the goal or problem?</li>
      <li><b>A – Action:</b> what did <i>you</i> do, step by step? This is the longest part. Say "I", not "we", so they know your role.</li>
      <li><b>R – Result:</b> how did it end? Use a number if you can ("finished two days early", "cut errors by half") and say what you learned.</li></ul>
      <div class="analogy">🍳 <b>Think of it like a recipe card:</b> the situation and task are the ingredients, the actions are the cooking steps, and the result is the finished dish. Skip a part and the dish doesn't come out right.</div>
      <p>Good answers are <b>specific</b> (a real moment, not "I always work hard"), <b>honest</b> (it's fine to admit a mistake if you show what you learned), and <b>short</b> (about one to two minutes).</p>`,
    terms: [['Behavioral question', 'A question about how you acted in a past situation, often starting with "Tell me about a time…".'], ['STAR', 'Situation, Task, Action, Result: the order to tell your story in.'], ['Result', 'The outcome of your actions, ideally with a number and a lesson learned.']],
    example: {
      lang: 'text', heading: 'See an example answer',
      intro: 'Question: <i>"Tell me about a time you missed a deadline, or almost did."</i> Here is a strong answer, one sentence per line:',
      code: `In my software class, our team had one week to build a bus-tracker app.
I was in charge of the map screen, which was due Friday.
On Wednesday I realized the map library didn't work on phones.
I told my teammates right away instead of hoping it would fix itself.
I found a different library, rebuilt the screen in two evenings,
and asked a classmate to test it on three phones.
We shipped on time, the map worked on every phone we tried,
and I learned to test on real devices from day one.`,
      steps: [
        { lines: [1], text: '<b>Situation.</b> One sentence sets the scene: what class, what project, how much time.' },
        { lines: [2], text: '<b>Task.</b> Says exactly what <i>they</i> owned (the map screen) and the deadline.' },
        { lines: [3], text: 'The <b>problem</b> that makes the story interesting. Every good story has a challenge.' },
        { lines: [4, 5, 6], text: '<b>Actions.</b> Three concrete things "I" did: spoke up early, found a fix, got it tested. Notice "I", not "we".' },
        { lines: [7, 8], text: '<b>Result.</b> A clear outcome (shipped on time, worked on every phone) plus a lesson learned.' },
      ],
    },
    practice: [
      { id: 'c-star1', type: 'choice', title: 'Which part is missing?',
        brief: '<p>A candidate says: <i>"On my team project, a teammate stopped replying to messages. I was responsible for our final report. I scheduled a quick call, split the remaining work into small pieces, and checked in every two days."</i></p><p>Which STAR part is missing?</p>',
        options: ['Situation', 'Task', 'Action', 'Result'], answer: 3,
        explain: 'They never say how it ended! A strong finish would be: "We turned the report in on time, got an A, and I learned to set check-ins from the start."',
        hint: 'Read it again. Do you know how the story ended?', solution: 'Result' },
      { id: 'c-star2', type: 'choice', title: 'Pick the strongest answer',
        brief: '<p>The question is: <i>"Tell me about a time you helped a teammate."</i> Which answer is strongest?</p>',
        options: [
          'I\'m a really helpful person and I always help my teammates.',
          'Last spring a teammate was stuck on a login bug the night before our demo. I sat with them for an hour, we found a typo in the password check, and the demo went smoothly. Now we pair up whenever someone is stuck for more than 30 minutes.',
          'We helped each other a lot and the project went fine.',
          'I don\'t really need help from teammates, so I don\'t ask for it.',
        ], answer: 1,
        explain: 'Answer 2 is a real, specific story with a situation, a task, clear actions by "I", and a result plus a habit they kept. The others are vague or don\'t answer the question.',
        hint: 'Look for a specific moment, "I" actions and a result.', solution: 'The specific story' },
      { id: 'c-star3', type: 'choice', title: 'Talking about a mistake',
        brief: '<p>The question is: <i>"Tell me about a mistake you made."</i> What is the best approach?</p>',
        options: [
          'Say you have never made a mistake.',
          'Pick a tiny mistake and blame someone else for it.',
          'Pick a real mistake, own it, explain how you fixed it, and share what you do differently now.',
          'Talk about a mistake your manager made.',
        ], answer: 2,
        explain: 'Interviewers know everyone makes mistakes. They want to see honesty, ownership and learning. That\'s exactly what the third option shows.',
        hint: 'What would you want to hear if you were hiring a teammate?', solution: 'Own it, fix it, learn from it' },
    ],
  },
  {
    id: 'writing', icon: '✍️', title: 'Writing at work: emails, docs and updates',
    summary: 'How to write short, clear messages that busy people can read in 30 seconds.',
    tags: ['email', 'doc', 'readme', 'postmortem', 'status', 'intro'],
    words: `<p>At work, most of your writing is read by <b>busy people who skim</b>. Your job is to make the important part impossible to miss.</p>
      <p>Four habits make almost any work message better:</p>
      <ol><li><b>Bottom line first.</b> Put the main point (the decision, the ask, or the news) in the first sentence. Details come after.</li>
      <li><b>Be specific.</b> Say which task, which date, and what number. "Soon" and "some issues" make readers guess.</li>
      <li><b>Use structure.</b> Short paragraphs, bullet points and headings (like <i>Goals</i>, <i>Risks</i>, <i>Timeline</i>) let people jump to what they need.</li>
      <li><b>End with the next step.</b> What happens now, and who does it?</li></ol>
      <div class="analogy">📰 <b>Think like a newspaper:</b> the headline tells you the story, the first line gives the key facts, and the rest is for readers who want more.</div>
      <p>Different documents have different jobs: a <b>design doc</b> explains a plan before building it, a <b>postmortem</b> explains what went wrong and how to prevent it (without blaming people), a <b>README</b> explains how to use a project, and a <b>status update</b> says what's done, what's next and what's blocked.</p>`,
    terms: [['Bottom line', 'The single most important point of the message.'], ['Design doc', 'A written plan for how you\'ll build something, shared before you build it.'], ['Postmortem', 'A write-up after an incident: what happened, why, and how to prevent it. Blameless, so it focuses on systems, not people.'], ['Stakeholder', 'Anyone who cares about or is affected by your work.']],
    example: {
      lang: 'text', heading: 'See an example email',
      intro: 'You need to tell a producer that a feature will be one day late:',
      code: `Subject: Parade app update moves to Thursday (1 day)
Hi Theo,
The parade-schedule update will ship Thursday instead of Wednesday.
Why: we found a bug in the time-zone handling during testing,
and fixing it safely takes one more day.
What's not affected: the current app keeps working as-is.
Next step: I'll send you a link to try it Wednesday at 4 PM.
Sorry for the change, and thanks for your patience!`,
      steps: [
        { lines: [1], text: 'The <b>subject line</b> already contains the news and how big it is.' },
        { lines: [3], text: '<b>Bottom line first:</b> the new date, in the very first sentence.' },
        { lines: [4, 5], text: 'A short, specific <b>reason</b>. No long excuses or technical jargon the reader doesn\'t need.' },
        { lines: [6], text: 'Answers the worry the reader probably has: <b>is anything broken right now?</b>' },
        { lines: [7], text: 'A concrete <b>next step</b> with a time.' },
        { lines: [8], text: 'A polite, human close.' },
      ],
    },
    practice: [
      { id: 'c-wr1', type: 'choice', title: 'Best first sentence',
        brief: '<p>You\'re emailing your manager that your task is finished early. Which first sentence is best?</p>',
        options: ['So this week has been really busy and I tried a lot of things.', 'The wait-time report is done and ready for review, two days early.', 'Hi! Hope you\'re well! Just a quick note!', 'I have some thoughts about the report I would like to share at some point.'], answer: 1,
        explain: 'It states the news (done), what (the wait-time report), and a helpful detail (two days early). Your manager knows everything important in one line.',
        hint: 'Which sentence gives the news right away?', solution: 'The wait-time report is done…' },
      { id: 'c-wr2', type: 'choice', title: 'Blameless postmortems',
        brief: '<p>Which sentence belongs in a <b>blameless postmortem</b>?</p>',
        options: ['Jordan broke production because he was careless.', 'The config change was deployed without an automated check, so the wrong port reached production.', 'Nobody knows what happened.', 'This was probably the intern\'s fault.'], answer: 1,
        explain: 'Blameless writing describes what the <i>system</i> allowed to happen (no automated check) so the team can fix the process. Blaming people makes others hide mistakes.',
        hint: 'Focus on the process, not a person.', solution: 'The config change was deployed without an automated check…' },
      { id: 'c-wr3', type: 'choice', title: 'Being specific',
        brief: '<p>Which status update is the most useful?</p>',
        options: ['Things are going OK. Some issues but working on it.', 'Done: login page. Next: search bar (by Thu). Blocked: need the API key from IT. Asked Lena this morning.', 'I did a lot of coding today.', 'Will update later.'], answer: 1,
        explain: 'It uses the classic done / next / blocked structure, includes a date, and says who is helping with the blocker.',
        hint: 'Look for done, next and blocked.', solution: 'Done / Next / Blocked update' },
    ],
  },
  {
    id: 'code-review', icon: '🔍', title: 'Code reviews: giving helpful feedback',
    summary: 'How teams check each other\'s code before it ships, and how to comment kindly and usefully.',
    tags: ['review', 'pull request', 'feedback'],
    words: `<p>Before code joins the main project, another engineer reads it. This is a <b>code review</b>. The changes are shared as a <b>pull request</b> (a "PR"): a list of lines added and removed, with room for comments.</p>
      <p>A reviewer looks for things that would hurt users or the team, roughly in this order:</p>
      <ol><li><b>Correctness:</b> does it do what it should? What about empty lists, zero, missing data?</li>
      <li><b>Security and privacy:</b> could someone abuse it? Are passwords or personal data exposed?</li>
      <li><b>Reliability:</b> what happens when something fails?</li>
      <li><b>Readability:</b> will the next person understand it?</li></ol>
      <p>Just as important is <b>how</b> you comment: be kind, be specific, explain <i>why</i>, and suggest a fix. Don't flag things that aren't really problems. False alarms waste everyone's time.</p>
      <div class="analogy">📝 <b>Like proofreading a friend's essay:</b> you point out the real mistakes, explain them, and say what works, so they want to ask you again.</div>`,
    terms: [['Pull request (PR)', 'A proposed set of code changes that others review before it is merged.'], ['Merge', 'Adding the reviewed changes to the main project.'], ['Nit', 'A tiny, optional suggestion (like naming). Label it so the author knows it isn\'t blocking.']],
    example: {
      lang: 'javascript', heading: 'See a review in action',
      intro: 'Here is a small function someone wants to merge. Read it, then see what a good reviewer notices:',
      code: `function averageWait(waits) {
  let total = 0;
  for (const w of waits) {
    total += w;
  }
  return total / waits.length;
}`,
      steps: [
        { lines: [1], text: 'The name is clear: it averages wait times. 👍 Worth saying something positive!' },
        { lines: [2, 3, 4, 5], text: 'Adds up every wait. That part is correct.' },
        { lines: [6], text: '<b>Bug:</b> if <code>waits</code> is empty, this divides 0 by 0 and returns <code>NaN</code> ("not a number"), which could show up on a guest\'s screen.' },
        { lines: [6], text: 'A kind, useful comment: <i>"Nice and readable! One thing: an empty list returns NaN here. Could we return 0 (or null) when waits is empty? That way the app never shows NaN."</i>' },
      ],
    },
    practice: [
      { id: 'c-cr1', type: 'choice', title: 'Which comment is best?',
        brief: '<p>A teammate\'s code puts a user\'s search text straight into a database query. Which review comment is best?</p>',
        options: ['This is terrible.', 'LGTM! (looks good to me)', 'Putting the search text directly into the SQL allows SQL injection. Could we use a parameterized query instead? Example: db.query("... WHERE name = ?", [text]). Happy to pair on it!', 'Rename the variable to searchTxt.'], answer: 2,
        explain: 'It names the real problem, explains why it matters, suggests a concrete fix and offers help, all in a friendly tone.',
        hint: 'A good comment says what, why and how to fix.', solution: 'The one explaining SQL injection with a fix' },
      { id: 'c-cr2', type: 'choice', title: 'Real issue or false alarm?',
        brief: '<p>Which of these is a <b>real</b> problem to flag in a review?</p>',
        options: ['The function uses const instead of let for a value that never changes.', 'A password is written directly in the source code.', 'The code has a comment explaining the approach.', 'The file ends with a newline.'], answer: 1,
        explain: 'A password in source code can be read by anyone with access to the code (or its history). That\'s a security problem. The others are fine.',
        hint: 'What could hurt users or the company?', solution: 'A password written in the source code' },
      { id: 'c-cr3', type: 'choice', title: 'Receiving feedback',
        brief: '<p>A reviewer points out a bug in your pull request. What\'s the best response?</p>',
        options: ['Argue that it works on your computer.', 'Thank them, fix it (or ask a question if you disagree), and add a test so it can\'t come back.', 'Ignore the comment and merge anyway.', 'Delete the pull request.'], answer: 1,
        explain: 'Reviews are teamwork, not criticism. Thanking the reviewer, fixing the issue and adding a test is exactly what senior engineers do.',
        hint: 'How would a great teammate react?', solution: 'Thank, fix, add a test' },
    ],
  },
  {
    id: 'presenting', icon: '🎤', title: 'Presenting your work',
    summary: 'How to build a short, clear presentation and handle questions calmly.',
    tags: ['presentation', 'demo', 'slides'],
    words: `<p>Engineers present all the time: demos, project updates, final showcases. A good technical talk tells a <b>simple story</b>:</p>
      <ol><li><b>The problem:</b> who has it and why it matters (for us, usually the guests).</li>
      <li><b>What you built:</b> the solution, shown (a demo or screenshot beats a wall of text).</li>
      <li><b>How well it works:</b> numbers, tests, what you measured.</li>
      <li><b>What\'s next:</b> what you\'d improve, and what you learned.</li></ol>
      <p>Slides should have <b>few words</b>. One idea per slide, big text, a picture if possible. <b>You</b> are the presentation; the slides just help.</p>
      <p>For <b>questions</b>: listen to the whole question, pause, answer the part you know honestly, and if you don\'t know, say so and offer to follow up. Nobody expects you to know everything.</p>
      <div class="analogy">🎬 <b>Like a movie trailer:</b> hook them with the problem, show the best parts, and leave them knowing exactly what the story is.</div>`,
    terms: [['Demo', 'Showing the working product live (or in a recording).'], ['Audience', 'Who is listening. Engineers want details; executives want impact.'], ['Q&A', 'Questions and answers after (or during) the talk.']],
    example: {
      lang: 'text', heading: 'See an example outline',
      intro: 'A five-slide outline for a 5-minute project demo:',
      code: `Slide 1: Title: "Shorter lines with the Wait Board"
Slide 2: Problem: guests don't know which rides have short waits
Slide 3: Demo: the board sorts open rides by wait time, live
Slide 4: Results: 12 tests passing; updates every 60 seconds
Slide 5: Next steps: add ride photos; lesson: test with real data early`,
      steps: [
        { lines: [1], text: 'The title says the <b>benefit</b>, not just the name of the project.' },
        { lines: [2], text: 'Starts with the <b>guest\'s problem</b>, so everyone knows why it matters.' },
        { lines: [3], text: 'Shows, doesn\'t tell: a live <b>demo</b>.' },
        { lines: [4], text: '<b>Evidence</b> it works, using numbers.' },
        { lines: [5], text: 'Ends with <b>what\'s next</b> and an honest lesson learned.' },
      ],
    },
    practice: [
      { id: 'c-pr1', type: 'choice', title: 'Best opening',
        brief: '<p>How should you open a 5-minute demo to a VP?</p>',
        options: ['"Um, so, I guess I\'ll start. Sorry, I\'m nervous."', '"Guests spend 20 minutes a day just deciding where to go. We built a planner that cuts that down, and I\'ll show you it live."', '"First, let me explain every function in our code."', '"This slide has a lot of text, so please read it."'], answer: 1,
        explain: 'It opens with the guest problem and a promise of what they\'ll see: confident, short and focused on impact.',
        hint: 'Start with why it matters.', solution: 'Start with the guest problem' },
      { id: 'c-pr2', type: 'choice', title: 'A question you can\'t answer',
        brief: '<p>Someone asks a question and you don\'t know the answer. What do you do?</p>',
        options: ['Make something up confidently.', 'Say "Great question. I don\'t know yet, but I\'ll find out and follow up with you today."', 'Pretend you didn\'t hear it.', 'Say the question is off-topic.'], answer: 1,
        explain: 'Honesty builds trust. Following up shows ownership. Making things up is the worst option. People remember when answers turn out to be wrong.',
        hint: 'What builds trust?', solution: 'Admit it and follow up' },
      { id: 'c-pr3', type: 'choice', title: 'Slide design',
        brief: '<p>Which slide is best?</p>',
        options: ['A slide with 12 bullet points in small text.', 'A slide with a big screenshot of the working app and one line: "Open rides, sorted by wait."', 'A slide with only your code.', 'A blank slide.'], answer: 1,
        explain: 'One idea, big and visual. The audience listens to you instead of reading a wall of text.',
        hint: 'One idea per slide.', solution: 'The screenshot slide' },
    ],
  },
];
