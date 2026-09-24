// Internship 1: JavaScript, Ride Systems Software.
IS.addCharacters({
  maya: {
    name: 'Maya Chen', title: 'Engineering Manager, Ride Systems Software', role: 'Manager',
    bio: 'Maya has shipped software for six attractions and still rides every one on opening day. Direct, fair, and serious about deadlines and clear communication.',
    look: { skin: '#f1d0b5', hair: 'bun', hairColor: '#1c1714', eyes: '#3b2618', top: 'blazer', topColor: '#2b2622', bottom: 'skirt', bottomColor: '#2b2622', shoes: 'flats', accessory: 'glasses' },
    chat: ['The best interns tell me early when something is off track.', 'Write things down. Design docs feel slow until the day they save you a week.', 'If you are going to miss a deadline, tell me before it passes, not after.', 'Safety first, then show, then efficiency.'],
  },
  dev: {
    name: 'Dev Patel', title: 'Software Engineer II (your mentor)', role: 'Mentor',
    bio: 'Dev was an intern on this exact team three summers ago. Loves rubber-duck debugging, bad puns and very strong cold brew.',
    look: { skin: '#a8704a', hair: 'short', hairColor: '#1c1714', eyes: '#3b2618', facial: 'beard', top: 'hoodie', topColor: '#3e6b48', bottom: 'pants', bottomColor: '#8a6d4b', shoes: 'sneakers', accessory: 'headphones', build: 'broad' },
    chat: ['Read the failing test name first. Half the time it tells you exactly what is wrong.', 'Nobody judges you for asking questions. I asked roughly nine thousand my first summer.', 'Stuck 30 minutes? Write down what you tried, then ask.'],
  },
  jordan: {
    name: 'Jordan Rivera', title: 'UX Engineering Intern', role: 'Intern', reliability: 0.9,
    bio: 'Front-end and accessibility nerd who sketches ride-queue ideas on napkins. Very dependable.',
    look: { skin: '#d9a57c', hair: 'curly', hairColor: '#2f2019', eyes: '#5a3a22', top: 'tee', topColor: '#c2593f', bottom: 'pants', bottomColor: '#c9b18a', shoes: 'sneakers', hat: 'beanie' },
    chat: ['Good queue design is storytelling. The wait IS part of the ride.', 'I always check color contrast first.', 'Churro after this? Asking for a friend. The friend is me.'],
  },
  sam: {
    name: 'Sam Okafor', title: 'Software Engineering Intern', role: 'Intern', reliability: 0.6,
    bio: 'Hilarious, brilliant at algorithms, not great at calendars. Tends to go quiet when stuck.',
    look: { skin: '#6b4029', hair: 'buzz', hairColor: '#1c1714', eyes: '#3b2618', top: 'hawaiian', topColor: '#6f8f5e', bottom: 'shorts', bottomColor: '#c9b18a', shoes: 'sneakers', build: 'slim' },
    chat: ['I solved it in my head at 2 AM. Unfortunately my head does not push to GitHub.', 'Tabs vs spaces matters less than whether you wrote tests.', 'I am definitely starting my part today. Probably.'],
  },
  priya: {
    name: 'Priya Nair', title: 'Data Science Intern', role: 'Intern', reliability: 0.95,
    bio: 'Graduate student who models crowd flow for fun. Precise, fast, a little intimidating until you know her.',
    look: { skin: '#a8704a', hair: 'ponytail', hairColor: '#1c1714', eyes: '#3b2618', top: 'button', topColor: '#f3ece0', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers', accessory: 'glasses' },
    chat: ['Crowds behave like fluids until they behave like people.', 'What decision will this chart help someone make?', 'If our demo lacks a live graph I will be personally offended.'],
  },
  tyler: {
    name: 'Tyler Brooks', title: 'Controls Engineering Intern', role: 'Intern', reliability: 0.7,
    bio: 'Lives in the ride lab with the sensors and PLCs. Great hands-on engineer; hardware delays tend to cascade.',
    look: { skin: '#f8e1cf', hair: 'sidepart', hairColor: '#a8412a', eyes: '#4f6b3a', facial: 'stubble', top: 'labcoat', bottom: 'pants', bottomColor: '#4b5a3a', shoes: 'boots', hat: 'cap' },
    chat: ['It is never "just wires."', 'Four hundred restraint cycles. Zero faults. Chef\'s kiss.', 'Weird sensor data? It\'s always a loose connector.'],
  },
});

IS.registerTrack({
  id: 'javascript', n: 1, icon: '🎢', lang: 'javascript', langLabel: 'JavaScript', rate: 24,
  title: 'Software Engineering Intern', team: 'Ride Systems Software',
  blurb: 'Write JavaScript for wait times, show schedules, ride sensors and guest routing.',
  skills: ['JavaScript', 'Testing & edge cases', 'Code review', 'Algorithms (BFS, intervals, sorting)'],
  channel: 'ride-systems', lab: { name: 'Ride Systems Lab', art: 'ride' },
  cast: { manager: 'maya', mentor: 'dev', interns: ['jordan', 'sam', 'priya', 'tyler'] },
  groups: {
    g1: { name: 'Queue Time Display Board', members: ['jordan', 'sam'] },
    g2: { name: 'Guest Flow Optimizer', members: ['priya', 'tyler'] },
  },
  incident: 'The guest app is showing negative and "Infinity" wait times.',
  scenario: { conflictA: 'a LIVE demo', conflictB: 'a recorded video', delay: 'the walkway sensors failed calibration', delayFix: 'mock sensor data' },
  tasks: [
  // ───────────────────────────── WEEK 1: ONBOARDING ─────────────────────────────
  {
    id: 'q1', type: 'quiz', title: 'Safety & Security Training', from: 'rosa', day: 1,
    due: { day: 1, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
    brief: `<p>Every cast member completes safety and information-security training before touching anything. You need <b>80%+</b> to be considered compliant.</p>`,
    hints: ['When in doubt, the answer is almost always "report it through the proper channel."', 'Anything unreleased is confidential under your NDA, even if it looks harmless.'],
    wiki: '<b>Security Handbook §2:</b> Never allow tailgating into badge-controlled areas. Report suspicious emails with the "Report Phishing" button. Unreleased concept art, ride data and project names are confidential.',
    peer: { who: 'jordan', text: 'I just finished it! Big themes: no tailgating, report stuff, stay behind the yellow lines in the lab.' },
    questions: [
      { q: 'Someone without a visible badge asks you to hold the secure door open because they "forgot it at their desk." What do you do?',
        options: ['Hold it. Being friendly matters.', 'Politely direct them to the front desk to get a temporary badge.', 'Ignore them and walk in quickly.', 'Lend them your badge for a minute.'], answer: 1 },
      { q: 'A technician is running a ride vehicle test in the lab. You want a closer look. You should:',
        options: ['Step past the barrier line quietly so you don\'t distract them.', 'Stay behind the marked lines and wear the required PPE.', 'Take a quick selfie next to the vehicle.', 'Ask to press the dispatch button.'], answer: 1 },
      { q: 'You see gorgeous concept art for an unannounced attraction. What can you do with it?',
        options: ['Post it with a vague caption, since nobody will know.', 'Share it only with close friends.', 'Nothing outside the team. It is confidential under your NDA.', 'Blur the logo and post it.'], answer: 2 },
      { q: 'An email from "IT Support" says your password expires in 1 hour and to click a link to keep your account. You:',
        options: ['Click the link quickly.', 'Reply with your password so IT can fix it.', 'Report it as phishing and don\'t click anything.', 'Forward it to the other interns as a warning with the link intact.'], answer: 2 },
      { q: 'You notice a frayed power cable under a lab workstation. You:',
        options: ['Wrap it in tape yourself.', 'Report it to the lab lead / facilities right away.', 'Leave a sticky note on it.', 'Ignore it. Not your area.'], answer: 1 },
    ],
  },
  {
    id: 'w1', type: 'written', title: 'Introduce Yourself in #summer-interns', from: 'rosa', day: 1,
    due: { day: 2, minute: 60 }, effort: 15, kind: 'individual', category: 'Communication',
    brief: `<p>Post a short introduction in the intern Slack channel. Include a greeting, who you are, your school/major, what team you are on, and something fun about you. Keep it friendly and professional (40+ words).</p>`,
    hints: ['A good intro is 3–5 sentences: hello, name + school, team + role, one fun fact, a closing line like "say hi!"'],
    wiki: '<b>Culture Guide:</b> Intern intros that land well are warm, specific, and short. Mention your team so people know who to ask you about.',
    peer: { who: 'sam', text: 'Mine was "hey im sam i like code." Rosa said it was "a start." Probably write more than that.' },
    rubric: {
      minWords: 40, format: 'post',
      sections: [
        { label: 'Greeting', keys: ['hi', 'hello', 'hey', 'greetings', 'howdy', 'good morning'] },
        { label: 'Who you are', keys: ["i'm", 'i am', 'my name', 'name is', 'im '] },
        { label: 'School / major', keys: ['university', 'college', 'school', 'studying', 'major', 'student', 'degree'] },
        { label: 'Team / role', keys: ['team', 'intern', 'software', 'ride systems', 'engineer', 'engineering'] },
        { label: 'Something personal', keys: ['love', 'enjoy', 'fun fact', 'hobby', 'favorite', 'excited', 'like to'] },
      ],
      terms: [],
    },
  },
  {
    id: 'q2', type: 'quiz', title: 'Git & Team Workflow Check', from: 'dev', day: 2,
    due: { day: 2, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
    brief: `<p>Dev wants to make sure you are comfortable with how the team ships code before you get repo access.</p>`,
    hints: ['Think about what keeps main safe: branches, reviews, tests.', 'Secrets that leak must be treated as compromised: rotate them first.'],
    wiki: '<b>Team Workflow:</b> Branch from latest main → small commits with clear messages → open PR → 1 approval + green CI → squash merge. Never force-push shared branches.',
    peer: { who: 'priya', text: 'Remember git pull = fetch + merge. And a good commit message says WHAT and WHY.' },
    questions: [
      { q: 'You are starting a new feature. First step?', options: ['Commit directly to main.', 'Create a feature branch from the latest main.', 'Fork the repo to your personal account.', 'Copy the files to your desktop.'], answer: 1 },
      { q: 'Which commit message is best?', options: ['stuff', 'final final v2', 'Fix off-by-one in vehicle count for partial loads', 'asdfgh'], answer: 2 },
      { q: 'You hit a merge conflict. What is the right move?', options: ['Delete the other person\'s changes.', 'Force push your branch.', 'Understand both changes, resolve, run the tests, then commit.', 'Abandon the branch and start over.'], answer: 2 },
      { q: 'What is the main purpose of code review?', options: ['To slow people down.', 'Catch bugs, share knowledge and keep code consistent.', 'To let seniors show off.', 'It is optional paperwork.'], answer: 1 },
      { q: 'What does `git pull` do?', options: ['Only downloads remote changes without touching your branch.', 'Fetches remote changes and merges (or rebases) them into your branch.', 'Pushes your commits.', 'Deletes local branches.'], answer: 1 },
      { q: 'You accidentally committed an API key and pushed it. What now?', options: ['Delete the file in the next commit and hope nobody saw.', 'Rotate the key immediately, remove it from history and tell your manager.', 'Make the repo private.', 'Nothing. It is an internal repo.'], answer: 1 },
    ],
  },
  {
    id: 'c1', type: 'coding', title: 'Welcome Badge Name Formatter', from: 'dev', day: 2,
    due: { day: 3, minute: 180 }, effort: 60, kind: 'individual', category: 'Coding',
    brief: `<p>The guest welcome kiosks print names on badges, but guests type names in every possible way. Write <code>formatBadgeName(fullName)</code> that:</p>
      <ul><li>trims leading and trailing spaces and collapses repeated spaces into one</li>
      <li>capitalizes the first letter of every word and lowercases the rest</li>
      <li>returns <code>""</code> for empty or whitespace-only input</li></ul>
      <p><code>"  ada   LOVELACE "</code> → <code>"Ada Lovelace"</code></p>`,
    fnName: 'formatBadgeName',
    starter: `// Format a guest's name for their welcome badge.
// Example: "  ada   LOVELACE " -> "Ada Lovelace"
function formatBadgeName(fullName) {
  // TODO: your code here
}
`,
    tests: [
      { args: ['ada lovelace'], expected: 'Ada Lovelace' },
      { args: ['  GRACE   hopper '], expected: 'Grace Hopper' },
      { args: ['yen'], expected: 'Yen' },
    ],
    hidden: [
      { args: [''], expected: '' },
      { args: ['   '], expected: '' },
      { args: ['mARY ann JACKSON'], expected: 'Mary Ann Jackson' },
      { args: ["o'neil"], expected: "O'neil" },
      { args: ['x  y'], expected: 'X Y' },
    ],
    hints: [
      'Start with fullName.trim(), then split on one-or-more whitespace: .split(/\\s+/).',
      'For each word: word[0].toUpperCase() + word.slice(1).toLowerCase().',
      'Watch out: "".split(/\\s+/) gives [""]. Handle the empty case first and return "".',
    ],
    wiki: '<b>MDN:</b> <code>String.prototype.split(/\\s+/)</code> splits on runs of whitespace. <code>Array.prototype.map</code> transforms each element; <code>.join(" ")</code> glues them back.',
    peer: { who: 'jordan', text: 'I did trim → split on whitespace → map to capitalize → join. Don\'t forget the empty string!' },
  },
  {
    id: 'c2', type: 'coding', title: 'Average Wait Time (with sensor noise)', from: 'maya', day: 3,
    due: { day: 4, minute: 180 }, effort: 60, kind: 'individual', category: 'Coding',
    brief: `<p>Queue sensors report wait times in minutes, but faulty sensors send <code>null</code>, <code>NaN</code> or negative numbers. Write <code>averageWaitTime(waits)</code>:</p>
      <ul><li>ignore any value that is not a finite number ≥ 0</li>
      <li>return the average of the valid values, rounded to <b>1 decimal place</b></li>
      <li>return <code>0</code> if there are no valid values</li></ul>`,
    fnName: 'averageWaitTime',
    starter: `// Average the valid wait times (minutes), rounded to 1 decimal.
function averageWaitTime(waits) {
  // TODO
}
`,
    tests: [
      { args: [[10, 20, 30]], expected: 20 },
      { args: [[15, -1, 25, null]], expected: 20 },
      { args: [[]], expected: 0 },
    ],
    hidden: [
      { args: [[5]], expected: 5 },
      { args: [[1, 2]], expected: 1.5 },
      { args: [[10, 20, 25]], expected: 18.3 },
      { args: [[-5, null]], expected: 0 },
      { args: [[0, 0, 3]], expected: 1 },
      { args: [[7, 8, 8]], expected: 7.7 },
    ],
    hints: [
      'Filter first: waits.filter(w => typeof w === "number" && Number.isFinite(w) && w >= 0).',
      'Round to one decimal with Math.round(x * 10) / 10.',
      'If the filtered list is empty, return 0 before dividing (avoid 0/0 = NaN).',
    ],
    wiki: '<b>MDN:</b> <code>Number.isFinite(v)</code> is false for NaN, Infinity and non-numbers. <code>Array.prototype.reduce</code> can sum an array.',
    peer: { who: 'priya', text: 'Classic data cleaning. Filter, then reduce. Round at the very end, not before summing.' },
  },
  {
    id: 'r1', type: 'review', title: 'Code Review: Wait Time Endpoint (PR #212)', from: 'dev', day: 3,
    due: { day: 5, minute: 120 }, effort: 40, kind: 'individual', category: 'Code Review',
    brief: `<p>Dev asked you to review a teammate's pull request. Select every <b>real problem</b> you find (don't flag things that are fine) and leave a constructive review comment.</p>`,
    code: `// routes/waitTimes.js
app.get('/api/wait/:rideId', async (req, res) => {
  const rows = await db.query(
    "SELECT queue_length, riders_per_hour FROM rides WHERE id = '" +
      req.params.rideId + "'"
  );
  const ride = rows[0];
  const wait = ride.queue_length / ride.riders_per_hour * 60;
  res.json({ wait: wait });
});`,
    issues: [
      { text: 'SQL is built by concatenating user input (SQL injection risk). Use a parameterized query.', real: true },
      { text: 'No handling when the ride is not found. rows[0] is undefined and the route crashes.', real: true },
      { text: 'Division by zero when riders_per_hour is 0 (a closed ride returns Infinity).', real: true },
      { text: 'No try/catch around the database call, so DB errors are unhandled.', real: true },
      { text: 'Should use var instead of const for the query result.', real: false },
      { text: 'Arrow functions are not allowed as Express route handlers.', real: false },
      { text: 'async/await is slower than callbacks and should be removed.', real: false },
    ],
    keywords: ['sql', 'injection', 'parameter', 'undefined', '404', 'not found', 'zero', 'closed', 'try', 'catch'],
    hints: ['Look for anything that trusts user input.', 'Ask "what if?" for every line: what if no rows? what if the ride is closed? what if the DB is down?'],
    wiki: '<b>Review Guidelines:</b> Comment on correctness, security and edge cases first. Be kind and specific: "Consider X because Y" beats "this is wrong."',
    peer: { who: 'sam', text: 'Pretty sure that string-concatenated SQL is a crime in 12 states.' },
  },
  {
    id: 'w2', type: 'written', title: 'Written Standup Update', from: 'maya', day: 4,
    due: { day: 4, minute: 150 }, effort: 20, kind: 'individual', category: 'Communication',
    brief: `<p>Maya is traveling and asked everyone to post async standups. Write your update with three parts: <b>what you did yesterday</b>, <b>what you are doing today</b>, and <b>any blockers</b>. Be specific (40+ words).</p>`,
    hints: ['Use the classic three headers: Yesterday / Today / Blockers. "No blockers" is a valid answer.', 'Specific > vague: "Finished badge formatter, all 8 tests passing" beats "worked on stuff."'],
    wiki: '<b>Team Norms:</b> Standups are for coordination, not status theater. Name the task, the progress and anything you need.',
    peer: { who: 'jordan', text: 'I do bullet points under Yesterday / Today / Blockers. Maya loves it.' },
    rubric: {
      minWords: 40, format: 'doc',
      sections: [
        { label: 'Yesterday', keys: ['yesterday', 'completed', 'finished', 'did ', 'worked on', 'wrapped up'] },
        { label: 'Today', keys: ['today', 'plan', 'will ', 'going to', 'next'] },
        { label: 'Blockers', keys: ['blocker', 'blocked', 'stuck', 'no blockers', 'none', 'need help', 'waiting on'] },
      ],
      terms: ['badge', 'wait', 'review', 'test', 'bug', 'pr', 'code', 'vehicle'], termsNeeded: 2,
    },
  },
  {
    id: 'c3', type: 'coding', bugfix: true, title: 'Bug Fix: Ride Vehicles Needed', from: 'maya', day: 4,
    due: { day: 5, minute: 180 }, effort: 45, kind: 'individual', category: 'Coding',
    brief: `<p>🐞 <b>Bug ticket RIDE-1042:</b> The load planner under-counts vehicles when the last vehicle is partly full, leaving guests on the platform.</p>
      <p>Fix <code>vehiclesNeeded(guests, seatsPerVehicle)</code> so that:</p>
      <ul><li>partly-full vehicles still count (10 guests, 4 seats → 3 vehicles)</li>
      <li>0 or negative guests → <code>0</code></li>
      <li>seatsPerVehicle ≤ 0 is invalid → <code>-1</code></li></ul>`,
    fnName: 'vehiclesNeeded',
    starter: `// Returns how many ride vehicles are needed to seat all guests.
function vehiclesNeeded(guests, seatsPerVehicle) {
  return Math.floor(guests / seatsPerVehicle);
}
`,
    tests: [
      { args: [10, 4], expected: 3 },
      { args: [8, 4], expected: 2 },
      { args: [0, 6], expected: 0 },
    ],
    hidden: [
      { args: [1, 8], expected: 1 },
      { args: [25, 5], expected: 5 },
      { args: [26, 5], expected: 6 },
      { args: [10, 0], expected: -1 },
      { args: [-3, 4], expected: 0 },
      { args: [100, -2], expected: -1 },
    ],
    hints: ['floor rounds down. Which Math function rounds up?', 'Check seatsPerVehicle <= 0 first (return -1), then guests <= 0 (return 0).'],
    wiki: '<b>MDN:</b> <code>Math.ceil(x)</code> returns the smallest integer ≥ x.',
    peer: { who: 'tyler', text: 'In the lab we\'d call that "leaving guests on the platform." Very bad. Round up!' },
  },

  // ───────────────────────────── WEEK 2: GROUP PROJECT 1 ─────────────────────────────
  {
    id: 'w3', type: 'written', title: 'Design Doc: Queue Time Display Board', from: 'maya', day: 6,
    due: { day: 8, minute: 120 }, effort: 90, kind: 'group', group: 'g1', category: 'Design',
    brief: `<p>Your team (you, Jordan and Sam) is building a <b>wait-time display board</b> for the park entrance. You own the design doc. Include: <b>Overview/Problem</b>, <b>Goals</b>, <b>Proposed Design</b>, <b>Data/API</b>, <b>Risks</b> and <b>Timeline</b>. Aim for 150+ words.</p>
      <p>Things reviewers care about: how often data refreshes, what happens to closed rides, sorting, accessibility and API failures.</p>`,
    hints: ['Use markdown headings like "## Goals" for each section. Reviewers skim.', 'A risk section that names a mitigation ("if the API fails we show the last known value") scores far better than one that just lists fears.'],
    wiki: '<b>Design Doc Template:</b> Overview · Goals / Non-goals · Proposed Design · Data & APIs · Risks & Mitigations · Timeline / Milestones.',
    peer: { who: 'jordan', text: 'Please mention accessibility: large fonts, contrast, and not relying on color alone for "closed."' },
    rubric: {
      minWords: 150, format: 'doc',
      sections: [
        { label: 'Overview / Problem', keys: ['overview', 'summary', 'background', 'problem'] },
        { label: 'Goals', keys: ['goal', 'objective', 'success'] },
        { label: 'Proposed design', keys: ['design', 'architecture', 'approach', 'solution', 'component'] },
        { label: 'Data / API', keys: ['data', 'api', 'endpoint', 'json', 'poll'] },
        { label: 'Risks', keys: ['risk', 'concern', 'trade-off', 'tradeoff', 'mitigat', 'edge case'] },
        { label: 'Timeline', keys: ['timeline', 'milestone', 'schedule', 'day ', 'week'] },
      ],
      terms: ['wait', 'display', 'refresh', 'accessib', 'closed', 'sort', 'api', 'guest'], termsNeeded: 5,
    },
  },
  {
    id: 'c4', type: 'coding', title: 'Display Board: Sort Open Attractions', from: 'maya', day: 6,
    due: { day: 8, minute: 180 }, effort: 75, kind: 'group', group: 'g1', category: 'Coding',
    brief: `<p>Your part of the display board: the data logic. Write <code>sortAttractions(attractions)</code>. Each attraction looks like <code>{ name, wait, open }</code>.</p>
      <ul><li>return an array of <b>names</b> of <b>open</b> attractions only</li>
      <li>sorted by <code>wait</code> ascending</li>
      <li>ties broken alphabetically by name</li></ul>`,
    fnName: 'sortAttractions',
    starter: `// Returns names of open attractions, shortest wait first.
function sortAttractions(attractions) {
  // TODO
}
`,
    tests: [
      { args: [[{ name: 'Galaxy Coaster', wait: 45, open: true }, { name: 'Sky Tram', wait: 10, open: true }, { name: 'Haunted Manor', wait: 30, open: false }]], expected: ['Sky Tram', 'Galaxy Coaster'] },
      { args: [[]], expected: [] },
    ],
    hidden: [
      { args: [[{ name: 'Pirate Lagoon', wait: 20, open: true }, { name: 'Dino Dig', wait: 20, open: true }, { name: 'Carousel', wait: 5, open: true }]], expected: ['Carousel', 'Dino Dig', 'Pirate Lagoon'] },
      { args: [[{ name: 'A', wait: 1, open: false }, { name: 'B', wait: 2, open: false }]], expected: [] },
      { args: [[{ name: 'Teacups', wait: 0, open: true }, { name: 'Rapids', wait: 60, open: true }, { name: 'Rocket', wait: 15, open: true }]], expected: ['Teacups', 'Rocket', 'Rapids'] },
    ],
    hints: ['filter → sort → map.', 'In the comparator: return a.wait - b.wait if different, otherwise compare names (a.name < b.name ? -1 : 1).', 'Use [...attractions] or filter() first so you do not mutate the input array.'],
    wiki: '<b>MDN:</b> <code>Array.prototype.sort(compareFn)</code>: a negative return puts a first. <code>String.prototype.localeCompare</code> compares strings.',
    peer: { who: 'sam', text: 'Oh I actually love this one. Sort by wait, then name. Two-key comparator.' },
  },
  {
    id: 'c5', type: 'coding', title: 'Filter Sensor Spikes', from: 'dev', day: 7,
    due: { day: 9, minute: 120 }, effort: 75, kind: 'individual', category: 'Coding',
    brief: `<p>A queue-length sensor occasionally reports wild spikes. Write <code>removeSpikes(readings, maxJump)</code> that returns a new array where:</p>
      <ul><li>the first reading is always accepted</li>
      <li>each later reading is accepted if it differs from the <b>last accepted reading</b> by at most <code>maxJump</code></li>
      <li>otherwise it is replaced by the last accepted reading</li></ul>
      <p><code>[10, 11, 50, 12, 13]</code>, maxJump 5 → <code>[10, 11, 11, 12, 13]</code></p>`,
    fnName: 'removeSpikes',
    starter: `// Replace readings that jump too far from the last accepted value.
function removeSpikes(readings, maxJump) {
  // TODO
}
`,
    tests: [
      { args: [[10, 11, 50, 12, 13], 5], expected: [10, 11, 11, 12, 13] },
      { args: [[], 3], expected: [] },
    ],
    hidden: [
      { args: [[5], 1], expected: [5] },
      { args: [[0, 100, 100, 100], 10], expected: [0, 0, 0, 0] },
      { args: [[1, 3, 6, 10], 3], expected: [1, 3, 6, 6] },
      { args: [[10, 5, 0], 5], expected: [10, 5, 0] },
      { args: [[-2, -4, -20, -5], 3], expected: [-2, -4, -4, -5] },
    ],
    hints: ['Keep a variable `last` for the last ACCEPTED value (not the last raw reading).', 'Use Math.abs(r - last) > maxJump to detect a spike. A difference exactly equal to maxJump is fine.'],
    wiki: '<b>Signal Processing 101:</b> A "hold last good value" filter is the simplest glitch filter. It trades responsiveness for stability.',
    peer: { who: 'tyler', text: 'We do this on the PLC side too. Compare against the last GOOD value, otherwise one spike poisons everything after it.' },
  },
  {
    id: 'q3', type: 'quiz', title: 'Accessibility & Guest Experience', from: 'jordan', day: 8,
    due: { day: 8, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
    brief: `<p>Jordan is running a quick accessibility primer for the display board team. Every guest should be able to use what we build.</p>`,
    hints: ['WCAG AA contrast for normal text is 4.5:1.', 'Color should never be the only way information is shown.'],
    wiki: '<b>Accessibility Guide:</b> Use semantic HTML, meaningful alt text, 4.5:1 contrast for body text, captions for media, and never rely on color alone.',
    peer: { who: 'jordan', text: 'Ha, I wrote it, so no answers! But think about guests who are colorblind, deaf, or using screen readers.' },
    questions: [
      { q: 'Minimum WCAG AA contrast ratio for normal-size text?', options: ['2:1', '3:1', '4.5:1', '10:1'], answer: 2 },
      { q: 'Good alt text should:', options: ['Say "image"', 'Describe the purpose/content of the image', 'Repeat the file name', 'Be left blank always'], answer: 1 },
      { q: 'Why shouldn\'t a wait-time board show "closed" using only a red color?', options: ['Red is expensive to print', 'Colorblind guests may not see the difference', 'Red is not a real color', 'It is fine to use only color'], answer: 1 },
      { q: 'Screen readers work best when the page uses:', options: ['Lots of <div>s with click handlers', 'Semantic HTML (buttons, headings, lists)', 'Images of text', 'Tiny fonts'], answer: 1 },
      { q: 'Captions on a queue pre-show video help:', options: ['Nobody', 'Only deaf guests', 'Deaf/hard-of-hearing guests AND anyone in a noisy queue', 'Only children'], answer: 2 },
    ],
  },
  {
    id: 'p1', type: 'presentation', title: 'Group Demo: Queue Time Display Board', from: 'maya', day: 8,
    due: { day: 10, minute: 150 }, effort: 90, kind: 'group', group: 'g1', category: 'Presentation',
    brief: `<p>Your team demos the display board to Maya, Dev and Rosa on Friday. Build a <b>4–7 slide</b> deck. Must include a <b>Title</b>, the <b>Problem</b>, your <b>Solution or Demo</b>, and <b>Next Steps</b>. Then present live and answer questions.</p>`,
    slideRange: [4, 7], required: ['title', 'problem', ['solution', 'demo'], 'next'],
    terms: ['wait', 'display', 'refresh', 'guest', 'accessib', 'sort', 'closed'],
    audience: ['maya', 'dev', 'rosa'],
    questions: [
      { who: 'maya', q: 'What happens if the wait-time API goes down during park hours?', options: [
        { text: 'The board keeps the last good values with a "last updated" time, and shows a friendly message if data is stale over 5 minutes.', pts: 10 },
        { text: 'We would notice and restart the server.', pts: 5 },
        { text: 'The board would probably just go blank?', pts: 2 },
        { text: 'That won\'t happen, the API is reliable.', pts: 0 }] },
      { who: 'dev', q: 'How did you test the sort logic?', options: [
        { text: 'We tried a few rides and it looked right.', pts: 4 },
        { text: 'Unit tests for ties, closed rides and empty lists, plus a manual check on the real board.', pts: 10 },
        { text: 'It\'s just sorting, it doesn\'t need tests.', pts: 0 },
        { text: 'Sam tested it, I think.', pts: 2 }] },
      { who: 'rosa', q: 'What did your team learn about working together?', options: [
        { text: 'It was fine mostly.', pts: 3 },
        { text: 'Honestly, I did most of the work.', pts: 0 },
        { text: 'We named owners on day one and did quick daily check-ins. When someone got stuck we paired instead of waiting.', pts: 10 },
        { text: 'That group projects are hard.', pts: 2 }] },
    ],
    hints: ['Tell a story: Problem → Solution → Demo → What\'s next.', 'Keep each slide to 1–3 short bullets. Too many words and people read instead of listening.'],
    wiki: '<b>Presenting Guide:</b> Open with the guest problem. One idea per slide. End with next steps and an invitation for questions.',
    peer: { who: 'jordan', text: 'I can cover the UI part live. You handle the data + next steps?' },
  },

  // ───────────────────────────── WEEK 3: MIDPOINT ─────────────────────────────
  {
    id: 'p2', type: 'presentation', title: 'Midpoint Showcase: My Internship So Far', from: 'rosa', day: 11,
    due: { day: 15, minute: 120 }, effort: 120, kind: 'individual', category: 'Presentation',
    brief: `<p>Every intern gives a <b>5–8 slide</b> midpoint presentation to their manager, mentor and the program team. Include a <b>Title</b>, an <b>Agenda</b>, your <b>Results</b> so far, <b>Challenges & Learnings</b>, and <b>Next Steps</b> for the second half.</p>`,
    slideRange: [5, 8], required: ['title', 'agenda', 'results', 'challenges', 'next'],
    terms: ['learn', 'test', 'team', 'feedback', 'goal', 'code', 'review', 'deadline'],
    audience: ['maya', 'dev', 'rosa', 'jordan'],
    questions: [
      { who: 'maya', q: 'Which piece of work are you most proud of so far, and why?', options: [
        { text: 'All of it, equally.', pts: 3 },
        { text: 'The display board data logic: it handles ties and closed rides and it shipped on time with tests.', pts: 10 },
        { text: 'Probably the quizzes?', pts: 2 },
        { text: 'I\'m not really proud of anything yet.', pts: 1 }] },
      { who: 'dev', q: 'What is one thing you would do differently?', options: [
        { text: 'Nothing, really.', pts: 1 },
        { text: 'Ask for help sooner. I\'d write down what I tried and bring it to you instead of staying stuck.', pts: 10 },
        { text: 'Get easier tasks.', pts: 0 },
        { text: 'Work faster, I guess.', pts: 4 }] },
      { who: 'rosa', q: 'What do you want to get out of the second half?', options: [
        { text: 'Own a bigger piece of the capstone end-to-end and present it to leadership.', pts: 10 },
        { text: 'Just finish, honestly.', pts: 2 },
        { text: 'A return offer.', pts: 5 },
        { text: 'More free churros.', pts: 3 }] },
    ],
    hints: ['Results slides land best with numbers: tasks shipped, tests written, grades, bugs fixed.', 'Be honest in Challenges. Managers love self-awareness.'],
    wiki: '<b>Intern Program:</b> The midpoint is a check-in, not an exam. Show what you did, what you learned, and what you want next.',
    peer: { who: 'priya', text: 'I put a chart of my task grades on my results slide. Very nerdy. Very effective.' },
  },
  {
    id: 'c6', type: 'coding', title: 'Show Schedule Conflict Detector', from: 'maya', day: 11,
    due: { day: 12, minute: 180 }, effort: 90, kind: 'individual', category: 'Coding',
    brief: `<p>The entertainment team keeps double-booking the castle stage. Write <code>findShowConflicts(shows)</code>. Each show is <code>{ name, start, end }</code> in minutes since midnight.</p>
      <ul><li>two shows conflict if their time ranges overlap (a show ending at 10 and another starting at 10 do <b>not</b> overlap)</li>
      <li>first sort shows by <code>start</code> (ties: by <code>name</code> alphabetically)</li>
      <li>return every conflicting pair as <code>[earlierName, laterName]</code>, in sorted order: pair (i, j) for i &lt; j</li></ul>`,
    fnName: 'findShowConflicts',
    starter: `// Returns [[nameA, nameB], ...] for every pair of overlapping shows.
function findShowConflicts(shows) {
  // TODO
}
`,
    tests: [
      { args: [[{ name: 'Parade', start: 600, end: 660 }, { name: 'Fireworks', start: 1260, end: 1280 }, { name: 'Castle Show', start: 630, end: 650 }]], expected: [['Parade', 'Castle Show']] },
      { args: [[{ name: 'A', start: 0, end: 10 }, { name: 'B', start: 10, end: 20 }]], expected: [] },
    ],
    hidden: [
      { args: [[{ name: 'X', start: 0, end: 30 }, { name: 'Y', start: 10, end: 40 }, { name: 'Z', start: 20, end: 25 }]], expected: [['X', 'Y'], ['X', 'Z'], ['Y', 'Z']] },
      { args: [[{ name: 'Beta', start: 5, end: 15 }, { name: 'Alpha', start: 5, end: 6 }]], expected: [['Alpha', 'Beta']] },
      { args: [[]], expected: [] },
      { args: [[{ name: 'Late', start: 100, end: 200 }, { name: 'Early', start: 50, end: 120 }]], expected: [['Early', 'Late']] },
    ],
    hints: ['Copy and sort first: [...shows].sort((a, b) => a.start - b.start || (a.name < b.name ? -1 : 1)).', 'Two ranges overlap when a.start < b.end && b.start < a.end.', 'A double loop (i from 0, j from i+1) is totally fine for show schedules.'],
    wiki: '<b>Algorithms Wiki:</b> Interval overlap test: <code>startA &lt; endB &amp;&amp; startB &lt; endA</code> (half-open intervals).',
    peer: { who: 'sam', text: 'Interval problems! You could do a sweep line, but a double loop is fine for like 20 shows.' },
  },
  {
    id: 'c7', type: 'coding', bugfix: true, title: 'Bug Fix: Fireworks Cue Timing', from: 'dev', day: 12,
    due: { day: 13, minute: 180 }, effort: 60, kind: 'individual', category: 'Coding',
    brief: `<p>🎆 <b>Bug ticket SHOW-771:</b> In rehearsal, the fireworks fired at the wrong moments. The cue converter is broken.</p>
      <p>Fix <code>cueToMs(cue)</code> to convert timestamps into <b>milliseconds</b> (rounded to a whole number). It must support <code>"m:ss"</code>, <code>"m:ss.s"</code> (fractional seconds) and <code>"h:mm:ss"</code>.</p>
      <p><code>"2:05.5"</code> → <code>125500</code> · <code>"1:02:03"</code> → <code>3723000</code></p>`,
    fnName: 'cueToMs',
    starter: `// Convert a fireworks cue timestamp like "2:05.5" into milliseconds.
// Supports "m:ss", "m:ss.s" and "h:mm:ss" formats.
function cueToMs(cue) {
  const parts = cue.split(':');
  const minutes = parts[0];
  const seconds = parts[1];
  return minutes * 60 + seconds * 1000;
}
`,
    tests: [
      { args: ['0:01'], expected: 1000 },
      { args: ['2:05.5'], expected: 125500 },
      { args: ['1:00'], expected: 60000 },
    ],
    hidden: [
      { args: ['0:00'], expected: 0 },
      { args: ['10:30.25'], expected: 630250 },
      { args: ['1:02:03'], expected: 3723000 },
      { args: ['0:00.001'], expected: 1 },
      { args: ['1:00:00.5'], expected: 3600500 },
    ],
    hints: ['Minutes × 60 gives seconds, not milliseconds. Units!', 'Handle any number of parts: parts.reduce((total, p) => total * 60 + Number(p), 0) gives seconds.', 'Multiply by 1000 at the end and Math.round() it.'],
    wiki: '<b>Show Control Standards:</b> All cue times are stored as integer milliseconds from show start. SMPTE-style "h:mm:ss" appears in longer shows.',
    peer: { who: 'tyler', text: 'Unit bugs are the worst. We once had a servo in degrees talking to code in radians. RIP that animatronic eyebrow.' },
  },
  {
    id: 'w4', type: 'written', title: 'Email: Cue Tool Delay to Show Producer', from: 'maya', day: 13,
    due: { day: 13, minute: 180 }, effort: 30, kind: 'individual', category: 'Communication',
    brief: `<p>The fireworks cue tool will be <b>one day late</b> because of the timing bug you found. Write an email to <b>Luis Ortega (Show Producer)</b> explaining: what happened, the impact on rehearsal, your plan and new date, and an apology. Be concise and professional (80+ words). Include a greeting and a sign-off.</p>`,
    hints: ['Structure: Greeting → What happened (1–2 sentences) → Impact → Plan + new date → Apology/thanks → Sign-off.', 'Stakeholders want dates and impact, not stack traces. Keep jargon low.'],
    wiki: '<b>Stakeholder Comms:</b> Lead with the bottom line. Own the problem without blaming anyone. Always give a new date and what you are doing to hit it.',
    peer: { who: 'priya', text: 'BLUF: bottom line up front. First sentence should say "the tool will be ready Thursday instead of Wednesday."' },
    rubric: {
      minWords: 80, format: 'email',
      sections: [
        { label: 'Greeting', keys: ['hi luis', 'hello', 'dear', 'good morning', 'good afternoon', 'hi ', 'luis'] },
        { label: 'What happened', keys: ['cue', 'bug', 'issue', 'found', 'timing', 'error'] },
        { label: 'Impact', keys: ['impact', 'delay', 'affect', 'means', 'rehearsal'] },
        { label: 'Plan + new date', keys: ['plan', 'fix', 'will be ready', 'by ', 'new date', 'thursday', 'friday', 'tomorrow'] },
        { label: 'Sign-off', keys: ['thanks', 'thank you', 'best', 'regards', 'sincerely', 'cheers'] },
      ],
      terms: ['cue', 'rehearsal', 'fix', 'test', 'date', 'sorry|apolog'], termsNeeded: 4,
    },
  },
  {
    id: 'r2', type: 'review', title: 'Code Review: Wait Board Component (PR #245)', from: 'jordan', day: 13,
    due: { day: 14, minute: 180 }, effort: 45, kind: 'individual', category: 'Code Review',
    brief: `<p>Jordan wants a second pair of eyes on a React component for the wait board. Flag the real problems and leave a kind, specific comment.</p>`,
    code: `function WaitBoard({ rides }) {
  const [waits, setWaits] = useState({});

  useEffect(() => {
    rides.forEach(async (ride) => {
      const res = await fetch('/api/wait/' + ride.id);
      const data = await res.json();
      setWaits({ ...waits, [ride.id]: data.wait });
    });
  });

  return (
    <div style={{ color: '#9a9a9a', background: '#a0a0a0' }}>
      {rides.map((ride) => (
        <div>
          <img src={ride.icon} />
          {ride.name}: {waits[ride.id]} min
        </div>
      ))}
    </div>
  );
}`,
    issues: [
      { text: 'useEffect has no dependency array, so it re-runs after every render (and setWaits triggers a render → infinite fetch loop).', real: true },
      { text: 'setWaits spreads a stale `waits`; use the functional form setWaits(prev => ({ ...prev, ... })).', real: true },
      { text: 'List items are missing a `key` prop.', real: true },
      { text: '<img> is missing alt text.', real: true },
      { text: 'Gray text on a gray background fails color contrast.', real: true },
      { text: 'Component names should be lowercase in React.', real: false },
      { text: 'Hooks are deprecated; this should be a class component.', real: false },
      { text: 'String concatenation in the fetch URL will not work; it must be a template literal.', real: false },
    ],
    keywords: ['dependency', 'loop', 'key', 'alt', 'contrast', 'stale', 'prev', 'accessib'],
    hints: ['There are both React bugs and accessibility bugs here.', 'What happens after setWaits runs? Does the effect run again?'],
    wiki: '<b>React Docs:</b> <code>useEffect(fn, deps)</code>: omit deps and it runs after every render. Lists need stable <code>key</code>s. Use functional updates when new state depends on old state.',
    peer: { who: 'sam', text: 'I count at least three React bugs and two a11y ones. Jordan is going to be so mad they missed the alt text.' },
  },
  {
    id: 'c9', type: 'coding', title: '⭐ Stretch: Ticket Code Validator', from: 'dev', day: 14, optional: true,
    due: { day: 17, minute: 180 }, effort: 75, kind: 'individual', category: 'Coding',
    brief: `<p><b>Optional stretch task</b> (counts toward the Blue Sky Innovation Award). Ticket codes look like <code>"1234-5678-9015"</code>: three groups of 4 digits separated by dashes. The last digit is a <b>Luhn checksum</b>.</p>
      <p>Write <code>validateTicket(code)</code> that returns <code>true</code> only if the format is exactly right <b>and</b> the Luhn check passes.</p>
      <p><b>Luhn:</b> starting from the rightmost digit and moving left, double every second digit (subtract 9 if the result is over 9). Sum all digits. Valid if the sum is divisible by 10.</p>`,
    fnName: 'validateTicket',
    starter: `// Validate a ticket code like "1234-5678-9015" (format + Luhn checksum).
function validateTicket(code) {
  // TODO
}
`,
    tests: [
      { args: ['1234-5678-9015'], expected: true },
      { args: ['1234-5678-9012'], expected: false },
      { args: ['123456789015'], expected: false },
    ],
    hidden: [
      { args: ['4030-2010-5025'], expected: true },
      { args: ['9876-5432-1098'], expected: true },
      { args: ['9876-5432-1089'], expected: false },
      { args: ['5555-6666-7773'], expected: true },
      { args: ['5555-6666-7774'], expected: false },
      { args: ['abcd-efgh-ijkl'], expected: false },
      { args: [''], expected: false },
      { args: ['1234-5678-90155'], expected: false },
      { args: ['0000-0000-0000'], expected: true },
    ],
    hints: ['Validate the format with a regex: /^\\d{4}-\\d{4}-\\d{4}$/.', 'Remove dashes, then loop from the end: every second digit (from the right, not counting the last) is doubled.', 'if (doubled > 9) doubled -= 9; then check sum % 10 === 0.'],
    wiki: '<b>Wikipedia:</b> The Luhn algorithm (mod 10) catches all single-digit errors and most adjacent transpositions.',
    peer: { who: 'priya', text: 'Luhn is the same algorithm credit cards use. The trick is doubling from the RIGHT.' },
  },

  // ───────────────────────────── WEEK 4: CAPSTONE KICKOFF ─────────────────────────────
  {
    id: 'w5', type: 'written', title: 'Capstone Design Doc: Guest Flow Optimizer', from: 'maya', day: 16,
    due: { day: 17, minute: 180 }, effort: 120, kind: 'group', group: 'g2', category: 'Design',
    brief: `<p>The capstone: a <b>Guest Flow Optimizer</b> that uses walkway sensors to suggest less crowded routes and better ride loading. Your team is you, Priya (data) and Tyler (sensors). Write the design doc: <b>Overview</b>, <b>Goals</b>, <b>Design</b>, <b>Data</b>, <b>Risks</b>, <b>Metrics</b> and <b>Timeline</b> (180+ words).</p>
      <p>Leadership will ask about routing, sensor reliability, guest privacy and how you measure success.</p>`,
    hints: ['Mention the building blocks: a graph of walkways (shortest path), sensor counts (throughput) and row-packing for ride loading.', 'A metrics section needs numbers: e.g. "reduce average walk-plus-wait time by 10%."', 'Privacy: say explicitly that you only use anonymous, aggregate counts.'],
    wiki: '<b>Design Doc Template:</b> Overview · Goals / Non-goals · Proposed Design · Data & APIs · Risks & Mitigations · Success Metrics · Timeline.',
    peer: { who: 'priya', text: 'Put in a metrics section with real targets. Harriet ALWAYS asks "how will you know it worked?"' },
    rubric: {
      minWords: 180, format: 'doc',
      sections: [
        { label: 'Overview', keys: ['overview', 'summary', 'background', 'problem'] },
        { label: 'Goals', keys: ['goal', 'objective'] },
        { label: 'Design', keys: ['design', 'architecture', 'approach', 'component', 'solution'] },
        { label: 'Data', keys: ['data', 'api', 'sensor', 'input'] },
        { label: 'Risks', keys: ['risk', 'concern', 'mitigat', 'trade-off', 'tradeoff'] },
        { label: 'Metrics', keys: ['metric', 'measure', 'kpi', 'success criteria', '%'] },
        { label: 'Timeline', keys: ['timeline', 'milestone', 'week', 'schedule'] },
      ],
      terms: ['path', 'graph', 'sensor', 'crowd', 'throughput', 'wait', 'privacy', 'queue', 'mock'], termsNeeded: 6,
    },
  },
  {
    id: 'c8', type: 'coding', title: 'Capstone: Shortest Walking Route', from: 'maya', day: 16,
    due: { day: 19, minute: 180 }, effort: 105, kind: 'group', group: 'g2', category: 'Coding',
    brief: `<p>Core of the optimizer: route guests between park areas. The park map is an adjacency list, e.g. <code>{ Hub: ['Frontier', 'Tomorrow'], ... }</code> (walkways are listed in both directions).</p>
      <p>Write <code>shortestPath(map, start, goal)</code> that returns the list of areas from start to goal with the <b>fewest steps</b>.</p>
      <ul><li>use breadth-first search, visiting neighbors in the order they are listed</li>
      <li>if start === goal return <code>[start]</code></li>
      <li>if there is no route (or start is not on the map) return <code>[]</code></li></ul>`,
    fnName: 'shortestPath',
    starter: `// Breadth-first search for the route with the fewest steps.
function shortestPath(map, start, goal) {
  // TODO
}
`,
    tests: [
      { args: [{ Entrance: ['Main Street'], 'Main Street': ['Entrance', 'Hub'], Hub: ['Main Street', 'Frontier', 'Tomorrow'], Frontier: ['Hub', 'River'], Tomorrow: ['Hub'], River: ['Frontier'] }, 'Entrance', 'River'], expected: ['Entrance', 'Main Street', 'Hub', 'Frontier', 'River'] },
      { args: [{ Hub: ['A'], A: ['Hub'] }, 'Hub', 'Hub'], expected: ['Hub'] },
    ],
    hidden: [
      { args: [{ Entrance: ['Main Street'], 'Main Street': ['Entrance', 'Hub'], Hub: ['Main Street', 'Frontier', 'Tomorrow'], Frontier: ['Hub', 'River'], Tomorrow: ['Hub'], River: ['Frontier'] }, 'Tomorrow', 'River'], expected: ['Tomorrow', 'Hub', 'Frontier', 'River'] },
      { args: [{ A: ['B'], B: ['A'], C: [] }, 'A', 'C'], expected: [] },
      { args: [{ S: ['A', 'B'], A: ['S', 'G'], B: ['S', 'G'], G: ['A', 'B'] }, 'S', 'G'], expected: ['S', 'A', 'G'] },
      { args: [{ S: ['A', 'B'], A: ['S', 'C'], C: ['A', 'G'], B: ['S', 'G'], G: ['C', 'B'] }, 'S', 'G'], expected: ['S', 'B', 'G'] },
      { args: [{ A: ['B'], B: ['A'] }, 'Z', 'A'], expected: [] },
    ],
    hints: ['BFS uses a queue: const queue = [start]; plus a `prev` object to remember how you reached each node.', 'Mark nodes visited when you ENQUEUE them, not when you dequeue, so you don\'t add duplicates.', 'When you reach goal, walk back through prev[] and reverse the list.'],
    wiki: '<b>Algorithms Wiki:</b> BFS explores level by level, so the first time it reaches a node is via a shortest path (in steps). Use (map[node] || []) to handle missing nodes.',
    peer: { who: 'sam', text: 'BFS + parent pointers. I could do this in my sleep. I have, in fact, done it in my sleep.' },
  },
  {
    id: 'c10', type: 'coding', title: 'Parse Ride Error Logs', from: 'dev', day: 18,
    due: { day: 20, minute: 180 }, effort: 75, kind: 'individual', category: 'Coding',
    brief: `<p>Maintenance wants a daily summary of errors per attraction. Log lines look like:</p>
      <pre>2026-06-14T10:15:00 [ERROR] Galaxy Coaster: sensor timeout</pre>
      <p>Write <code>countErrors(lines)</code> that returns an object mapping attraction name → number of <code>ERROR</code> lines.</p>
      <ul><li>a valid line is: timestamp, space, level in square brackets, space, attraction name, colon, message</li>
      <li>only the exact uppercase level <code>ERROR</code> counts</li>
      <li>skip malformed lines. The message itself may contain more colons.</li></ul>`,
    fnName: 'countErrors',
    starter: `// Count ERROR log lines per attraction.
function countErrors(lines) {
  // TODO
}
`,
    tests: [
      { args: [['2026-06-14T10:15:00 [ERROR] Galaxy Coaster: sensor timeout', '2026-06-14T10:16:00 [INFO] Sky Tram: dispatch ok', '2026-06-14T10:17:30 [ERROR] Galaxy Coaster: brake fault']], expected: { 'Galaxy Coaster': 2 } },
      { args: [[]], expected: {} },
    ],
    hidden: [
      { args: [['garbage line', '2026-06-14T11:00:00 [ERROR] Pirate Lagoon: pump low', '2026-06-14T11:05:00 [WARN] Pirate Lagoon: water temp', '2026-06-14T11:06:00 [ERROR] Haunted Manor: door stuck', '[ERROR] no timestamp', '2026-06-14T11:07:00 [ERROR] Pirate Lagoon: pump low']], expected: { 'Pirate Lagoon': 2, 'Haunted Manor': 1 } },
      { args: [['2026-06-14T12:00:00 [error] Sky Tram: lowercase level']], expected: {} },
      { args: [['2026-06-14T12:01:00 [ERROR] Sky Tram: code: E42', '2026-06-14T12:02:00 [ERROR] Sky Tram: code: E43']], expected: { 'Sky Tram': 2 } },
    ],
    hints: ['A regex does most of the work: /^(\\S+) \\[([A-Z]+)\\] ([^:]+): (.*)$/.', 'Use match[2] === "ERROR" and counts[name] = (counts[name] || 0) + 1.', '[^:]+ stops the attraction name at the FIRST colon, so extra colons stay in the message.'],
    wiki: '<b>MDN:</b> <code>String.prototype.match(regex)</code> returns null when there is no match, so check it before using capture groups.',
    peer: { who: 'tyler', text: 'Those logs come straight off my ride controllers. Sometimes a line gets cut in half, so definitely skip garbage.' },
  },
  {
    id: 'c11', type: 'coding', title: 'Hourly Ride Throughput', from: 'priya', day: 19,
    due: { day: 21, minute: 180 }, effort: 75, kind: 'group', group: 'g2', category: 'Coding',
    brief: `<p>Priya needs throughput numbers for the capstone dashboard. Each dispatch is <code>{ minute, riders }</code> where <code>minute</code> is minutes since the park opened.</p>
      <p>Write <code>hourlyThroughput(dispatches)</code> that returns an array where index <i>h</i> is the total riders dispatched during hour <i>h</i> (minutes 0–59 are hour 0). The array runs from hour 0 through the last hour that has any dispatch, with 0 for empty hours. Empty input → <code>[]</code>.</p>`,
    fnName: 'hourlyThroughput',
    starter: `// Total riders per hour since park open.
function hourlyThroughput(dispatches) {
  // TODO
}
`,
    tests: [
      { args: [[{ minute: 5, riders: 20 }, { minute: 30, riders: 24 }, { minute: 70, riders: 18 }]], expected: [44, 18] },
      { args: [[]], expected: [] },
    ],
    hidden: [
      { args: [[{ minute: 130, riders: 10 }]], expected: [0, 0, 10] },
      { args: [[{ minute: 59, riders: 1 }, { minute: 60, riders: 2 }, { minute: 0, riders: 3 }]], expected: [4, 2] },
      { args: [[{ minute: 200, riders: 5 }, { minute: 10, riders: 5 }]], expected: [5, 0, 0, 5] },
    ],
    hints: ['Hour index = Math.floor(minute / 60).', 'Find the largest hour first, create new Array(maxHour + 1).fill(0), then add riders.'],
    wiki: '<b>Ops Metrics:</b> Throughput = riders per hour. Theoretical hourly capacity (THRC) vs actual throughput is a key efficiency metric.',
    peer: { who: 'priya', text: 'Don\'t assume the dispatches are sorted. The sensor batches arrive out of order.' },
  },

  // ───────────────────────────── WEEK 5: CRUNCH ─────────────────────────────
  {
    id: 'c14', type: 'coding', title: 'Capstone: Row Loading Planner', from: 'priya', day: 21,
    due: { day: 23, minute: 180 }, effort: 90, kind: 'group', group: 'g2', category: 'Coding',
    brief: `<p>Ride operators group parties into rows without splitting families. Write <code>rowsNeeded(partySizes, rowSize)</code> using <b>first-fit</b>:</p>
      <ul><li>process parties in order; put each party in the <b>first</b> existing row with enough empty seats, otherwise start a new row</li>
      <li>a party larger than <code>rowSize</code> gets <code>ceil(size / rowSize)</code> rows all to themselves (no one else joins those rows)</li>
      <li>ignore parties of size 0 or less</li>
      <li>return the total number of rows used</li></ul>`,
    fnName: 'rowsNeeded',
    starter: `// First-fit row loading. Returns the number of rows used.
function rowsNeeded(partySizes, rowSize) {
  // TODO
}
`,
    tests: [
      { args: [[4, 2, 2, 3, 1], 4], expected: 3 },
      { args: [[], 4], expected: 0 },
    ],
    hidden: [
      { args: [[3, 3, 3], 4], expected: 3 },
      { args: [[1, 1, 1, 1, 1], 4], expected: 2 },
      { args: [[6, 1], 4], expected: 3 },
      { args: [[3, 1, 2, 2], 4], expected: 2 },
      { args: [[2, 3, 2, 1], 4], expected: 2 },
      { args: [[5, 0, -1, 3], 4], expected: 3 },
    ],
    hints: ['Keep an array `free` of empty seats per shareable row.', 'For big parties, just add Math.ceil(size / rowSize) to a separate counter; do NOT push them into `free`.', 'Answer = free.length + bigPartyRows.'],
    wiki: '<b>Algorithms Wiki:</b> First-fit bin packing: place each item into the first bin with room. Not optimal, but simple and predictable for operators.',
    peer: { who: 'priya', text: 'It\'s bin packing! First-fit, not best-fit. Keep it in order or the tests will disagree with you.' },
  },
  {
    id: 'c12', type: 'coding', bugfix: true, title: '🚨 URGENT: Negative Wait Times in Production', from: 'maya', day: 22,
    due: { day: 22, minute: 120 }, effort: 40, kind: 'individual', category: 'Coding', urgent: true,
    brief: `<p>🚨 <b>SEV-2 incident:</b> The guest app is showing <b>"-5 min"</b> and <b>"Infinity min"</b> waits. Guests are screenshotting it. Fix <code>estimateWait(queueLength, ridersPerHour)</code> <b>by 11:00 AM</b>:</p>
      <ul><li>if ridersPerHour ≤ 0 the ride is closed → return <code>null</code></li>
      <li>negative queue lengths (sensor glitch) count as 0</li>
      <li>wait in minutes = queue ÷ ridersPerHour × 60, <b>rounded up to the nearest 5 minutes</b></li></ul>`,
    fnName: 'estimateWait',
    starter: `// Estimated wait in minutes shown in the guest app.
function estimateWait(queueLength, ridersPerHour) {
  return Math.round(queueLength / ridersPerHour * 60);
}
`,
    tests: [
      { args: [600, 1200], expected: 30 },
      { args: [0, 1000], expected: 0 },
      { args: [-40, 1000], expected: 0 },
    ],
    hidden: [
      { args: [100, 0], expected: null },
      { args: [101, 1200], expected: 10 },
      { args: [1, 1500], expected: 5 },
      { args: [1500, 1500], expected: 60 },
      { args: [50, -10], expected: null },
      { args: [700, 1400], expected: 30 },
    ],
    hints: ['Guard first: if (!(ridersPerHour > 0)) return null;', 'Clamp: const q = Math.max(0, queueLength);', 'Round up to 5: Math.ceil(minutes / 5) * 5.'],
    wiki: '<b>Incident Runbook:</b> 1) Mitigate first, root-cause second. 2) Ship the smallest safe fix. 3) Write a blameless postmortem within 24h.',
    peer: { who: 'jordan', text: 'People are posting the "Infinity min" screenshot everywhere. It\'s kind of funny but also please fix it 😅' },
  },
  {
    id: 'w6', type: 'written', title: 'Blameless Postmortem: Negative Wait Times', from: 'maya', day: 22,
    due: { day: 23, minute: 180 }, effort: 60, kind: 'individual', category: 'Communication',
    brief: `<p>Write the postmortem for the wait-time incident. Include: <b>Summary</b>, <b>Timeline</b>, <b>Root Cause</b>, <b>Impact</b>, and <b>Action Items</b>. Postmortems here are <b>blameless</b>: focus on systems and processes, not people (120+ words).</p>`,
    hints: ['Root cause: no guard for closed rides (division by zero → Infinity) and no clamp for negative sensor values.', 'Good action items are specific and owned: "Add unit tests for zero/negative inputs (owner: me, due Fri)".', 'Avoid words like "fault", "careless" or "blame". Describe what the system allowed to happen.'],
    wiki: '<b>SRE Handbook:</b> Blameless postmortems assume everyone acted reasonably with the information they had. Ask "what made this possible?" not "who did this?"',
    peer: { who: 'dev', text: 'Remember: blameless. The question is why our tests and monitoring didn\'t catch it, not who wrote the line.' },
    rubric: {
      minWords: 120, format: 'doc', blameless: true,
      sections: [
        { label: 'Summary', keys: ['summary', 'overview', 'tl;dr', 'what happened'] },
        { label: 'Timeline', keys: ['timeline', 'am', 'pm', ':'] },
        { label: 'Root cause', keys: ['root cause', 'cause', 'because', 'why'] },
        { label: 'Impact', keys: ['impact', 'guests', 'affected', 'users'] },
        { label: 'Action items', keys: ['action item', 'follow-up', 'follow up', 'next step', 'prevent', 'todo'] },
      ],
      terms: ['negative', 'zero', 'division|divide', 'sensor', 'test', 'monitor|alert', 'null|closed'], termsNeeded: 5,
    },
  },
  {
    id: 'r3', type: 'review', title: 'Code Review: Sensor Ingest Service (PR #301)', from: 'tyler', day: 23,
    due: { day: 24, minute: 180 }, effort: 45, kind: 'group', group: 'g2', category: 'Code Review',
    brief: `<p>Tyler wrote the capstone's sensor ingest service and needs your review before it can merge. Find the real issues and leave a constructive comment.</p>`,
    code: `const API_KEY = 'sk_live_9f8e7d6c5b4a';
let totalGuests = 0;

async function ingest(sensorIds) {
  await Promise.all(sensorIds.map(async (id) => {
    const count = await readSensor(id, API_KEY);
    const current = totalGuests;
    await logReading(id, count);
    totalGuests = current + count;
  }));
  return totalGuests;
}

// TODO: add tests later`,
    issues: [
      { text: 'A live API key is hard-coded and committed. Move it to env/secret storage and rotate it.', real: true },
      { text: 'Race condition: totalGuests is read before an await and written after, so concurrent updates are lost.', real: true },
      { text: 'totalGuests is module-level state that never resets, so every call adds to the previous total.', real: true },
      { text: 'No tests are included for a new service.', real: true },
      { text: 'Promise.all runs the callbacks one at a time, so this is slow.', real: false },
      { text: 'The function name `ingest` is too short to be readable.', real: false },
      { text: 'Should use .forEach instead of .map inside Promise.all.', real: false },
    ],
    keywords: ['key', 'secret', 'env', 'rotate', 'race', 'concurren', 'reset', 'global', 'test'],
    hints: ['One of these is a security incident waiting to happen.', 'Trace what happens when two sensors resolve at the same time. What does each callback think `current` is?'],
    wiki: '<b>Security Policy:</b> Credentials must never be committed. If one is, it is considered leaked: rotate immediately.',
    peer: { who: 'priya', text: 'The race condition is subtle but real. I simulated it and we lose about a third of the counts.' },
  },
  {
    id: 'c13', type: 'coding', title: 'Animatronic Servo Smoothing', from: 'tyler', day: 24,
    due: { day: 26, minute: 180 }, effort: 75, kind: 'individual', category: 'Coding',
    brief: `<p>A new animatronic figure's arm jerks when it gets big target changes. Each control tick, the servo should move toward its target <b>smoothly and safely</b>.</p>
      <p>Write <code>servoStep(current, target, maxStep, minAngle, maxAngle)</code> that returns the next angle:</p>
      <ul><li>clamp the target into [minAngle, maxAngle] first</li>
      <li>if the clamped target is within <code>maxStep</code> of current, return the clamped target</li>
      <li>otherwise move exactly <code>maxStep</code> toward it</li></ul>`,
    fnName: 'servoStep',
    starter: `// One control tick: move toward target by at most maxStep, within safe limits.
function servoStep(current, target, maxStep, minAngle, maxAngle) {
  // TODO
}
`,
    tests: [
      { args: [0, 90, 10, 0, 180], expected: 10 },
      { args: [85, 90, 10, 0, 180], expected: 90 },
      { args: [90, 200, 30, 0, 180], expected: 120 },
    ],
    hidden: [
      { args: [170, 200, 30, 0, 180], expected: 180 },
      { args: [50, -20, 15, 0, 180], expected: 35 },
      { args: [10, -20, 15, 0, 180], expected: 0 },
      { args: [45, 45, 5, 0, 180], expected: 45 },
      { args: [100, 0, 100, 20, 160], expected: 20 },
    ],
    hints: ['Clamp: const t = Math.min(maxAngle, Math.max(minAngle, target));', 'const diff = t - current; if (Math.abs(diff) <= maxStep) return t;', 'Otherwise return current + Math.sign(diff) * maxStep.'],
    wiki: '<b>Figure Animation Safety:</b> Every actuator has soft limits (software clamp) inside hard limits (mechanical stops). Rate limiting prevents mechanical stress.',
    peer: { who: 'tyler', text: 'Clamp FIRST, then rate-limit. Otherwise it\'ll happily try to drive past the mechanical stop.' },
  },
  {
    id: 'w7', type: 'written', title: 'Weekly Status Report to Maya', from: 'maya', day: 25,
    due: { day: 25, minute: 150 }, effort: 30, kind: 'individual', category: 'Communication',
    brief: `<p>Send Maya a weekly status report on your work and the capstone: <b>Progress</b>, <b>Risks/Blockers</b>, <b>Next Steps</b> and <b>Asks</b> (anything you need from her). 80+ words.</p>`,
    hints: ['Use RAG status if you like: 🟢 on track / 🟡 at risk / 🔴 blocked.', 'An "Ask" can be small: feedback on your deck, a room for the demo, intro to someone.'],
    wiki: '<b>Team Norms:</b> Weekly status: Progress · Risks · Next steps · Asks. Surface risks early. Nobody likes surprises at demo day.',
    peer: { who: 'jordan', text: 'I always end with a concrete ask. Maya said it makes it easy to help.' },
    rubric: {
      minWords: 80, format: 'doc',
      sections: [
        { label: 'Progress', keys: ['progress', 'completed', 'done', 'shipped', 'finished', 'merged'] },
        { label: 'Risks / blockers', keys: ['risk', 'blocker', 'concern', 'delay', 'at risk'] },
        { label: 'Next steps', keys: ['next week', 'next step', 'plan', 'upcoming', 'next'] },
        { label: 'Asks', keys: ['ask', 'need', 'help', 'request', 'support', 'could you'] },
      ],
      terms: ['capstone', 'incident', 'postmortem', 'review', 'test', 'demo', 'sensor', 'path'], termsNeeded: 3,
    },
  },

  // ───────────────────────────── WEEK 6: FINALS ─────────────────────────────
  {
    id: 'w8', type: 'written', title: 'Capstone README Documentation', from: 'dev', day: 26,
    due: { day: 28, minute: 180 }, effort: 60, kind: 'group', group: 'g2', category: 'Design',
    brief: `<p>Code nobody can run is code nobody uses. Write the README for the Guest Flow Optimizer repo: <b>Overview</b>, <b>Setup</b>, <b>Usage</b> (with an example), <b>API/Functions</b>, <b>Testing</b> and <b>Contributing</b>. 150+ words.</p>`,
    hints: ['Document each function you wrote: shortestPath, hourlyThroughput, rowsNeeded, with parameters and return values.', 'Show one code example in Usage. Readers copy-paste examples first.'],
    wiki: '<b>Docs Standards:</b> README sections: What is it · Getting started · Usage · API reference · Running tests · How to contribute.',
    peer: { who: 'dev', text: 'Future-you in 6 months is the main audience. Be kind to future-you.' },
    rubric: {
      minWords: 150, format: 'doc',
      sections: [
        { label: 'Overview', keys: ['overview', 'about', 'description', 'what is', 'introduction'] },
        { label: 'Setup', keys: ['install', 'setup', 'set up', 'getting started', 'npm', 'clone'] },
        { label: 'Usage', keys: ['usage', 'example', 'how to use', 'run '] },
        { label: 'API / Functions', keys: ['api', 'function', 'parameter', 'returns', 'reference'] },
        { label: 'Testing', keys: ['test'] },
        { label: 'Contributing', keys: ['contribut', 'pull request', 'license', 'code review'] },
      ],
      terms: ['shortestpath|shortest path', 'throughput', 'rows', 'sensor', 'mock', 'map'], termsNeeded: 4,
    },
  },
  {
    id: 'p3', type: 'presentation', title: 'Final Capstone Presentation to Leadership', from: 'harriet', day: 26,
    due: { day: 33, minute: 150 }, effort: 150, kind: 'group', group: 'g2', category: 'Presentation',
    brief: `<p>The big one. Your team presents the Guest Flow Optimizer to <b>Harriet Lin (VP, Creative Technology)</b>, Maya, Dev and Rosa. Build a <b>6–10 slide</b> deck with a <b>Title</b>, <b>Problem</b>, <b>Solution</b>, <b>Architecture</b>, <b>Demo</b>, <b>Results/Metrics</b> and <b>Next Steps</b>. Expect tough questions.</p>`,
    slideRange: [6, 10], required: ['title', 'problem', 'solution', 'architecture', 'demo', 'results', 'next'],
    terms: ['path', 'crowd', 'throughput', 'sensor', 'wait', 'guest', 'privacy', 'row'],
    audience: ['harriet', 'maya', 'dev', 'rosa'],
    questions: [
      { who: 'harriet', q: 'How does this change what a guest actually feels in the park?', options: [
        { text: 'It makes our algorithms more efficient.', pts: 4 },
        { text: 'Guests spend less time walking into crowds and waiting, and more time on experiences. Accurate waits also reduce frustration.', pts: 10 },
        { text: 'Guests won\'t notice, it\'s all backend.', pts: 1 },
        { text: 'Good question, we didn\'t think about that.', pts: 0 }] },
      { who: 'harriet', q: 'What about guest privacy with all these sensors?', options: [
        { text: 'The sensors are secure.', pts: 3 },
        { text: 'We only use anonymous, aggregate counts, with no cameras or personal identifiers, and raw data is deleted after 30 days.', pts: 10 },
        { text: 'Privacy is legal\'s job.', pts: 0 },
        { text: 'We could add privacy later.', pts: 2 }] },
      { who: 'maya', q: 'What\'s the biggest risk to shipping this?', options: [
        { text: 'Sensor reliability. We built spike filtering and mock data, and we\'d pilot on one land before scaling park-wide.', pts: 10 },
        { text: 'There are no real risks.', pts: 0 },
        { text: 'Probably something with the servers.', pts: 3 },
        { text: 'Tyler\'s hardware.', pts: 1 }] },
      { who: 'dev', q: 'How would this scale to the whole park?', options: [
        { text: 'Buy bigger servers.', pts: 2 },
        { text: 'BFS is linear in walkways; for real distances we\'d switch to Dijkstra with weighted edges and cache popular routes.', pts: 10 },
        { text: 'It should be fine.', pts: 2 },
        { text: 'Rewrite it in a faster language.', pts: 3 }] },
    ],
    hints: ['Open with a guest story: "It\'s 2 PM, the family has 90 minutes before the parade..."', 'Architecture slide: Sensors → Ingest (spike filter) → Graph routing + Throughput → Guest app.', 'Have a privacy answer ready. Harriet always asks.'],
    wiki: '<b>Exec Presentations:</b> Lead with guest impact, show a crisp architecture, prove it with a demo and numbers, and close with a clear ask or next step.',
    peer: { who: 'priya', text: 'I\'ll run the live dashboard during the demo slide. You take the architecture and Q&A?' },
  },
  {
    id: 'w9', type: 'written', title: 'Self-Evaluation for Final Review', from: 'rosa', day: 30,
    due: { day: 31, minute: 180 }, effort: 60, kind: 'individual', category: 'Communication',
    brief: `<p>Before your final review, write a self-evaluation: <b>Accomplishments</b>, <b>Challenges</b>, <b>What you learned</b>, <b>Feedback you received</b> and <b>Career goals</b>. Be honest and specific (150+ words).</p>`,
    hints: ['Name specific projects: the display board, the incident fix, the capstone.', 'Challenges + what you did about them > a list of excuses.'],
    wiki: '<b>Intern Program:</b> Self-evaluations are read by your manager and the return-offer committee. Specific, reflective and forward-looking wins.',
    peer: { who: 'jordan', text: 'I included one piece of feedback I got and how I acted on it. Felt very grown up.' },
    rubric: {
      minWords: 150, format: 'doc',
      sections: [
        { label: 'Accomplishments', keys: ['accomplish', 'proud', 'delivered', 'built', 'shipped', 'completed'] },
        { label: 'Challenges', keys: ['challenge', 'difficult', 'struggle', 'hard', 'mistake'] },
        { label: 'Learning', keys: ['learn', 'grew', 'growth', 'improved', 'skill'] },
        { label: 'Feedback', keys: ['feedback', 'mentor', 'manager', 'advice'] },
        { label: 'Goals', keys: ['goal', 'future', 'want to', 'career', 'next'] },
      ],
      terms: ['capstone', 'display', 'incident', 'presentation', 'team', 'test', 'deadline', 'review'], termsNeeded: 4,
    },
  },  {
    id: 'c15', type: 'coding', title: 'Capstone: Best Next Ride', from: 'priya', day: 27,
    due: { day: 30, minute: 180 }, effort: 75, kind: 'group', group: 'g2', category: 'Coding',
    brief: `<p>The guest app suggests what to ride next. Each ride is <code>{ name, wait, walk, open }</code> (minutes). Write <code>bestNextRide(rides)</code> that returns the <b>name</b> of the open ride with the smallest <code>wait + walk</code>. Ties: smaller walk wins, then alphabetical name. No open rides → <code>null</code>.</p>`,
    fnName: 'bestNextRide',
    starter: `// Suggest the open ride with the lowest total time (wait + walk).
function bestNextRide(rides) {
  // TODO
}
`,
    tests: [
      { args: [[{ name: 'Sky Tram', wait: 10, walk: 5, open: true }, { name: 'Galaxy Coaster', wait: 5, walk: 20, open: true }]], expected: 'Sky Tram' },
      { args: [[]], expected: null },
    ],
    hidden: [
      { args: [[{ name: 'A', wait: 10, walk: 10, open: false }]], expected: null },
      { args: [[{ name: 'Rapids', wait: 15, walk: 5, open: true }, { name: 'Carousel', wait: 5, walk: 15, open: true }]], expected: 'Rapids' },
      { args: [[{ name: 'Zebra Ride', wait: 5, walk: 5, open: true }, { name: 'Alpha Ride', wait: 5, walk: 5, open: true }]], expected: 'Alpha Ride' },
      { args: [[{ name: 'Teacups', wait: 0, walk: 2, open: true }, { name: 'Rocket', wait: 1, walk: 0, open: true }]], expected: 'Rocket' },
    ],
    hints: ['Filter open rides first; return null if none.', 'Sort with a three-key comparator: total, then walk, then name.'],
    wiki: '<b>Guest App Spec:</b> Recommendations must never suggest a closed ride. Walking time matters more than you think in the heat.',
    peer: { who: 'priya', text: 'Three-key sort: total, walk, name. Or a single loop that keeps the best so far.' },
  },
  ],
  interview: {
    coding: [
      {
        id: 'i-js1', title: 'Reverse the Words', fnName: 'reverseWords',
        brief: '<p>Write <code>reverseWords(s)</code> that returns the words of <code>s</code> in reverse order, separated by single spaces, ignoring extra whitespace. <code>"  hello   world "</code> → <code>"world hello"</code>.</p>',
        starter: 'function reverseWords(s) {\n  // TODO\n}\n',
        tests: [{ args: ['hello world'], expected: 'world hello' }, { args: ['  a  b c '], expected: 'c b a' }],
        hidden: [{ args: [''], expected: '' }, { args: ['one'], expected: 'one' }, { args: ['   '], expected: '' }],
      },
      {
        id: 'i-js2', title: 'Valid Palindrome', fnName: 'isPalindrome',
        brief: '<p>Write <code>isPalindrome(s)</code>: true if <code>s</code> reads the same forwards and backwards, ignoring case and any non-alphanumeric characters. <code>"Race car!"</code> → <code>true</code>.</p>',
        starter: 'function isPalindrome(s) {\n  // TODO\n}\n',
        tests: [{ args: ['Race car!'], expected: true }, { args: ['hello'], expected: false }],
        hidden: [{ args: [''], expected: true }, { args: ['A man, a plan, a canal: Panama'], expected: true }, { args: ['ab2a'], expected: false }],
      },
      {
        id: 'i-js3', title: 'Two Sum', fnName: 'twoSum',
        brief: '<p>Write <code>twoSum(nums, target)</code> that returns indices <code>[i, j]</code> (i &lt; j) of two numbers adding to <code>target</code>. If several pairs work, return the one with the smallest <code>j</code> (then smallest <code>i</code>). None → <code>[]</code>.</p>',
        starter: 'function twoSum(nums, target) {\n  // TODO\n}\n',
        tests: [{ args: [[2, 7, 11, 15], 9], expected: [0, 1] }, { args: [[3, 3], 6], expected: [0, 1] }],
        hidden: [{ args: [[1, 2, 3], 7], expected: [] }, { args: [[1, 4, 2, 3], 5], expected: [0, 1] }, { args: [[5, 1, 4, 0], 5], expected: [1, 2] }],
      },
    ],
    concepts: [
      { q: 'What does `[1, 2, 3].map(x => x * 2)` return?', options: ['6', '[2, 4, 6]', 'undefined', '[1, 2, 3]'], answer: 1 },
      { q: 'Which comparison avoids type coercion?', options: ['==', '===', '=', '!='], answer: 1 },
      { q: 'A variable declared with `const` holding an array…', options: ['can never change at all', 'can be reassigned but not mutated', 'cannot be reassigned, but the array can be mutated', 'is global'], answer: 2 },
      { q: 'What is `typeof null`?', options: ['"null"', '"undefined"', '"object"', '"number"'], answer: 2 },
      { q: 'In what order do these log? `console.log(1); setTimeout(() => console.log(2), 0); console.log(3);`', options: ['1 2 3', '1 3 2', '2 1 3', '3 2 1'], answer: 1 },
      { q: 'What is the average time complexity of looking up a key in a JavaScript `Map`?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 0 },
      { q: 'What does an `async` function always return?', options: ['A callback', 'A Promise', 'undefined', 'The awaited value synchronously'], answer: 1 },
      { q: '`let` differs from `var` because `let` is…', options: ['function-scoped', 'block-scoped', 'always global', 'immutable'], answer: 1 },
    ],
  },
  training: {
    lessons: [
      { title: 'Strings & arrays toolkit', html: '<p>Most interview string problems are <b>split → transform → join</b>.</p><pre>"  a  b ".trim().split(/\\s+/)   // ["a", "b"]\n["a", "b"].reverse().join(" ") // "b a"\n[1, 2, 3].filter(n => n > 1)   // [2, 3]\n[1, 2, 3].reduce((a, b) => a + b, 0) // 6</pre><p>Watch out: <code>"".split(/\\s+/)</code> is <code>[""]</code>, so handle empty input first.</p>' },
      { title: 'Edge cases first', html: '<p>Before coding, list edge cases out loud: <b>empty input, one element, duplicates, negatives, ties, no answer</b>. Interviewers score this habit highly. Write the guard clauses first:</p><pre>if (!nums.length) return [];</pre>' },
      { title: 'Hash maps for speed', html: '<p>Nested loops are O(n²). A <code>Map</code> remembers what you have seen so one pass is enough:</p><pre>const seen = new Map();\nfor (let j = 0; j &lt; nums.length; j++) {\n  const need = target - nums[j];\n  if (seen.has(need)) return [seen.get(need), j];\n  if (!seen.has(nums[j])) seen.set(nums[j], j);\n}\nreturn [];</pre>' },
    ],
  },
});
