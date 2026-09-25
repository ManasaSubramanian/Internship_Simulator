// Internship 10: Imagination Lab, full-stack capstone.
// Mixes everything from the earlier internships: JavaScript, Python, SQL (on the
// ticketing database from internship 6, with fresh seeds), web pages and a
// terminal incident.
(function () {
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const $ = (doc, s) => doc.querySelector(s);
  const $$ = (doc, s) => Array.from(doc.querySelectorAll(s));
  const shown = (el) => !!el && !el.hidden && el.style.display !== 'none' && !el.closest('[hidden]');
  const scripts = (doc) => $$(doc, 'script').map((s) => s.textContent).join('\n');
  const page = (body) => `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Park Pal</title>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  const HOME = '/home/intern';
  const MOTD = 'parkpal-api-01 · Imagination Lab (simulated)\nType `help` to list commands.';
  const API_LOG = [
    '09:58:01 INFO  GET /rides 200 41ms',
    '09:58:07 INFO  GET /itinerary 200 88ms',
    '10:00:00 INFO  deploy parkpal-api 3.2.0',
    '10:00:14 ERROR GET /itinerary 500 pool exhausted',
    '10:00:15 ERROR GET /recommend 500 pool exhausted',
    '10:00:19 INFO  GET /rides 200 39ms',
    '10:00:22 ERROR GET /itinerary 500 pool exhausted',
    '10:00:31 WARN  slow query 2400ms',
    '10:00:40 ERROR POST /booking 500 pool exhausted',
    '10:00:41 ERROR GET /itinerary 500 upstream timeout',
    '10:00:52 ERROR GET /recommend 500 pool exhausted',
  ].join('\n') + '\n';

  const DB = { schema: IS.sqlData.schema, seeds: [IS.sqlData.seed(41), IS.sqlData.seed(57)] };
  const START = '-- Write your query below\n';

  IS.addCharacters({
    celeste: {
      name: 'Celeste Laurent', title: 'Director, Imagination Lab', role: 'Manager',
      bio: 'Celeste runs the lab where new guest experiences go from napkin sketch to working prototype. She has shipped products in every language on the studio\'s stack.',
      look: { skin: '#d9a57c', hair: 'bun', hairColor: '#2f2019', eyes: '#3b2618', top: 'blazer', topColor: '#2b2622', bottom: 'skirt', bottomColor: '#6b3a2e', shoes: 'flats', accessory: 'glasses', accessory2: 'earrings' },
      chat: ['A prototype that guests can touch beats a slide deck every time.', 'Full-stack means you own the whole guest moment, from the database row to the button.', 'You\'ve done nine internships. I want to see how you lead.'],
    },
    kofi: {
      name: 'Kofi Mensah', title: 'Principal Engineer (your mentor)', role: 'Mentor',
      bio: 'Kofi designed the systems behind the park app, ride reservations and the ticket ledger. He mentors every capstone intern personally.',
      look: { skin: '#4d2c1d', hair: 'buzz', hairColor: '#1c1714', eyes: '#3b2618', facial: 'beard', top: 'cardigan', topColor: '#8a6d4b', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers', accessory: 'glasses', build: 'broad' },
      chat: ['Pick the right tool: SQL for sets, Python for analysis, JavaScript for the guest.', 'Every layer should fail gracefully. The guest shouldn\'t see our stack trace.', 'Boring technology is a feature.'],
    },
    mira: {
      name: 'Mira Okafor', title: 'Full-Stack Intern', role: 'Intern', reliability: 0.9,
      bio: 'Returning intern like you. Writes front ends by day and database migrations by night.',
      look: { skin: '#6b4029', hair: 'braids', hairColor: '#1c1714', eyes: '#3b2618', top: 'varsity', topColor: '#c2593f', bottom: 'pants', bottomColor: '#2b2622', shoes: 'sneakers' },
      chat: ['I keep a notebook of every bug I\'ve ever caused. It\'s my best teacher.'],
    },
    bruno: {
      name: 'Bruno Esposito', title: 'Back-End Intern', role: 'Intern', reliability: 0.6,
      bio: 'Brilliant API designer with a habit of starting three branches at once.',
      look: { skin: '#e7bf9c', hair: 'curly', hairColor: '#2f2019', eyes: '#5a3a22', facial: 'stubble', top: 'hawaiian', topColor: '#d99a2b', bottom: 'shorts', bottomColor: '#5a4636', shoes: 'sneakers' },
      chat: ['I have four branches open and I love them all equally.'],
    },
    anya: {
      name: 'Anya Petrova', title: 'Data Intern', role: 'Intern', reliability: 0.95,
      bio: 'Turns guest ratings into recommendations and never trusts a number she hasn\'t checked twice.',
      look: { skin: '#f8e1cf', hair: 'long', hairColor: '#e3cf9c', eyes: '#4f6b3a', top: 'sweater', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#2b2622', shoes: 'boots', accessory: 'glasses' },
      chat: ['A recommendation you can\'t explain is a recommendation you can\'t fix.'],
    },
    jonah: {
      name: 'Jonah Whitfield', title: 'Product Engineering Intern', role: 'Intern', reliability: 0.7,
      bio: 'Former ride operator who knows exactly what guests ask at 3 PM in July. Great instincts, loose deadlines.',
      look: { skin: '#c68b5f', hair: 'short', hairColor: '#1c1714', eyes: '#3b2618', top: 'polo', topColor: '#3e6b48', bottom: 'pants', bottomColor: '#8a6d4b', shoes: 'sneakers', hat: 'cap' },
      chat: ['Guests don\'t want "features." They want to ride Galaxy Coaster before lunch.'],
    },
  });

  const js = (o) => Object.assign({ type: 'coding', lang: 'javascript', kind: 'individual', category: 'Coding' }, o);
  const py = (o) => Object.assign({ type: 'coding', lang: 'python', kind: 'individual', category: 'Coding' }, o);
  const sqlTask = (o) => Object.assign({ type: 'sql', kind: 'individual', category: 'Coding', starter: START, fnName: undefined }, o);
  const webTask = (o) => Object.assign({ type: 'web', kind: 'individual', category: 'Coding' }, o);

  IS.registerTrack({
    id: 'capstone', n: 10, icon: '🏰', lang: 'javascript', langLabel: 'Full-Stack Capstone (JS, Python, SQL, Web, Bash)', rate: 45,
    title: 'Senior Full-Stack Engineering Intern', team: 'Imagination Lab',
    blurb: 'The final internship. Build "Park Pal", a guest companion app, end to end: JavaScript logic, Python recommendations, SQL over the ticketing data, the web UI, and a live production incident.',
    skills: ['Full-stack design', 'Choosing the right tool', 'Leading a team', 'Production ownership'],
    channel: 'imagination-lab', lab: { name: 'Imagination Lab', art: 'ride' },
    cast: { manager: 'celeste', mentor: 'kofi', interns: ['mira', 'bruno', 'anya', 'jonah'] },
    groups: { g1: { name: 'Park Pal Itinerary Planner', members: ['mira', 'bruno'] }, g2: { name: 'Park Pal Recommendations', members: ['anya', 'jonah'] } },
    incident: 'Park Pal is returning errors to guests: a new release shrank the database connection pool to zero.',
    scenario: { conflictA: 'a live demo on the show floor', conflictB: 'a recorded walkthrough', delay: 'the production ratings feed is still in legal review', delayFix: 'the anonymized sample dataset' },
    db: DB,
    tasks: [
      {
        id: 'q1', type: 'quiz', title: 'Launch Readiness & Guest Privacy', from: 'rosa', day: 1, due: { day: 1, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Park Pal will be in guests\' hands. Pass the launch readiness check (80%+).</p>',
        hints: ['Collect only what you need, explain why, and plan for failure before launch.'],
        wiki: '<b>Launch checklist:</b> privacy review, accessibility review, load test, monitoring and alerts, rollback plan, support runbook.',
        peer: { who: 'anya', text: 'Data minimization comes up every time. Collect less.' },
        questions: [
          { q: 'Park Pal could use a guest\'s precise location all day. The best default is:', options: ['Collect it always, silently', 'Ask for permission, explain the benefit, and use only what the feature needs', 'Sell it to partners', 'Store it forever just in case'], answer: 1 },
          { q: 'Before a guest-facing launch, which is NOT optional?', options: ['A rollback plan and monitoring', 'A launch party', 'A new logo', 'Dark mode'], answer: 0 },
          { q: 'Recommendations for kids\' accounts should:', options: ['Be identical to adults\'', 'Follow stricter data and content rules', 'Show ads', 'Be turned off entirely forever'], answer: 1 },
          { q: 'A load test mainly tells you:', options: ['If the code is pretty', 'How the system behaves at peak guest traffic', 'Who wrote the code', 'The color contrast'], answer: 1 },
          { q: 'A guest asks to delete their Park Pal data. You should:', options: ['Ignore it', 'Have a documented, working deletion path', 'Delete their tickets too', 'Ask them to call a manager'], answer: 1 },
        ],
      },
      IS.T.intro({ channel: 'imagination-lab', team: 'Imagination Lab', teamKey: 'full-stack' }),
      js({
        id: 'j1', title: 'Parse the Wait-Time Feed', from: 'mentor', day: 2, due: { day: 3, minute: 180 }, effort: 45, fnName: 'parseWaitFeed',
        brief: '<p>The ride sensors send lines like <code>"GC:45"</code> (ride id, minutes). Write <code>parseWaitFeed(lines)</code> returning an object <code>{ GC: 45, … }</code>. Trim spaces, skip malformed lines (not exactly one colon, empty id, empty or non-numeric wait) and negative waits. If a ride appears twice, the later line wins.</p>',
        starter: 'function parseWaitFeed(lines) {\n  const out = {};\n  for (const line of lines) {\n    const [id, wait] = line.split(\':\');\n    out[id] = wait;\n  }\n  return out;\n}\n',
        tests: [{ args: [['GC:45', 'ST:10']], expected: { GC: 45, ST: 10 } }, { args: [[]], expected: {} }],
        hidden: [{ args: [['GC:45', 'bad', 'ST:-5', 'GC:30']], expected: { GC: 30 } }, { args: [[' HM : 20 ', 'RR:', ':5', 'A:B:C']], expected: { HM: 20 } }],
        hints: ['const parts = line.split(\':\'); if (parts.length !== 2) continue;', 'Number(\'\') is 0, so check for an empty string before converting.', 'Number.isFinite(wait) && wait >= 0'],
        wiki: '<b>Defensive parsing:</b> sensor feeds are messy. Validate every field and skip what you can\'t trust.',
        peer: { who: 'mira', text: 'Number("") is 0. That one got me in my first internship.' },
      }),
      sqlTask({
        id: 's1', title: 'Average Rating per Land', from: 'manager', day: 3, due: { day: 4, minute: 180 }, effort: 45, ordered: true,
        brief: '<p>Park Pal\'s home screen highlights the best-loved lands. Return <code>land, avg_stars</code> (average rating stars, rounded to 2 decimals) for every land that has ratings, highest first, ties by land.</p>',
        hints: ['JOIN ratings to attractions ON attraction_id.', 'GROUP BY a.land and ROUND(AVG(r.stars), 2) AS avg_stars.', 'ORDER BY avg_stars DESC, a.land'],
        wiki: '<b>Aggregates:</b> AVG ignores NULLs; ROUND(x, 2) keeps two decimals.',
        peer: { who: 'anya', text: 'The ratings table is from the ticketing team\'s database. Same schema you used before.' },
      }),
      {
        id: 'r1', type: 'review', title: 'Code Review: Park Pal API Route', from: 'mentor', day: 3, due: { day: 5, minute: 120 }, effort: 40, kind: 'individual', category: 'Code Review',
        brief: '<p>Bruno wrote the first API route. Review it before it goes to staging.</p>',
        code: `app.get('/guest/:id/plan', async (req, res) => {
  const rows = await db.query(
    "SELECT * FROM plans WHERE guest_id = " + req.params.id);
  console.log('plan for', req.params.id, rows);
  res.json(rows);
});`,
        issues: [
          { text: 'The id is concatenated into SQL, which allows SQL injection. Use a parameterized query.', real: true },
          { text: 'There is no authorization check, so any guest can read any other guest\'s plan by changing the id.', real: true },
          { text: 'There is no error handling. A database failure crashes the request or leaks a stack trace.', real: true },
          { text: 'It logs the guest\'s whole plan, which is personal data, to the server logs.', real: true },
          { text: 'Arrow functions cannot be async.', real: false },
          { text: 'res.json can only send strings.', real: false },
          { text: 'Route paths may not contain parameters like :id.', real: false },
        ],
        keywords: ['injection', 'parameter', 'auth', 'permission', 'error', 'try', 'log', 'privacy'],
        hints: ['What happens if id is "1 OR 1=1"?', 'Who is allowed to see guest 42\'s plan?'],
        wiki: '<b>API checklist:</b> validate input, parameterize queries, authorize every request, handle errors, don\'t log personal data.',
        peer: { who: 'bruno', text: 'In my defense, it worked on my machine. Please be gentle. But not too gentle.' },
      },
      py({
        id: 'p1', title: 'Busiest Hour at the Gate', from: 'intern3', day: 4, due: { day: 5, minute: 180 }, effort: 45, fnName: 'busiest_hour',
        brief: '<p>Anya has gate scan times like <code>"09:15"</code>. Write <code>busiest_hour(entries)</code> returning the hour (an int, 0–23) with the most scans. Ties go to the earliest hour. No entries → <code>None</code>.</p>',
        starter: 'def busiest_hour(entries):\n    pass\n',
        tests: [{ args: [['09:15', '10:05', '10:40', '11:00']], expected: 10 }, { args: [[]], expected: null }],
        hidden: [{ args: [['23:59']], expected: 23 }, { args: [['08:00', '09:00']], expected: 8 }, { args: [['14:10', '14:50', '09:00', '09:30']], expected: 9 }],
        hints: ['int(e.split(":")[0]) gives the hour.', 'Count with a dict, then min(counts, key=lambda h: (-counts[h], h)).'],
        wiki: '<b>Counting:</b> a dict (or collections.Counter) of hour → count, then pick the max with a tie-break.',
        peer: { who: 'anya', text: 'Tie-breaks matter. Two people running the report must get the same answer.' },
      }),
      IS.T.standup({ day: 4, terms: ['feed', 'sql', 'review', 'api', 'python', 'rating'] }),
      webTask({
        id: 'w1', title: 'Itinerary Card', from: 'mentor', day: 5, due: { day: 7, minute: 120 }, effort: 60,
        brief: '<p>Render the guest\'s day. Inside <code>&lt;main&gt;</code>, show an <code>&lt;h2&gt;</code> "Your Day" and fill <code>&lt;ol id="plan"&gt;</code> with one <code>&lt;li&gt;</code> per stop from the <code>stops</code> array, <b>sorted by time</b>, with text exactly like <code>10:00 — Sky Tram</code>. Use <code>textContent</code>, not HTML strings.</p>',
        starter: page('  <h2>Your Day</h2>\n  <ol id="plan"></ol>\n  <script>\n    const stops = [\n      { time: \'13:30\', name: \'Pirate Lagoon\' },\n      { time: \'10:00\', name: \'Sky Tram\' },\n      { time: \'11:15\', name: \'Galaxy Coaster\' },\n    ];\n    // TODO: render the stops in time order\n  </script>'),
        checks: [
          { label: 'Three <li> stops', fn: (d) => $$(d, '#plan li').length === 3 },
          { label: 'Sorted by time, formatted "HH:MM — Name"', fn: (d) => $$(d, '#plan li').map(txt).join('|') === '10:00 — Sky Tram|11:15 — Galaxy Coaster|13:30 — Pirate Lagoon' },
          { label: 'Heading and list are inside <main>', hidden: true, fn: (d) => txt($(d, 'main h2')) === 'Your Day' && !!$(d, 'main #plan') },
          { label: 'No innerHTML', hidden: true, fn: (d) => !/innerHTML/.test(scripts(d)) },
        ],
        hints: ['stops.slice().sort((a, b) => a.time.localeCompare(b.time))', 'const li = document.createElement(\'li\'); li.textContent = `${s.time} — ${s.name}`;', 'Wrap the heading and list in <main>…</main>.'],
        wiki: '<b>Sorting times:</b> zero-padded "HH:MM" strings sort correctly as text.',
        peer: { who: 'jonah', text: 'Copy the em dash — exactly. The checks compare text.' },
      }),
      IS.T.designDoc({ id: 'w-design1', title: 'Park Pal Itinerary Planner', day: 6, due: { day: 8, minute: 120 }, group: 'g1',
        brief: 'Your team designs the planner: it takes live wait times and a guest\'s free minutes and suggests which rides fit, across the API, data and UI layers.',
        terms: ['api', 'wait', 'itinerary', 'database', 'ui', 'cache', 'accessib'], termsNeeded: 4 }),
      js({
        id: 'j2', kind: 'group', group: 'g1', title: 'Planner: Fit Rides into Free Time', from: 'manager', day: 6, due: { day: 8, minute: 180 }, effort: 75, fnName: 'planItinerary',
        brief: '<p>Your part of the planner. Each ride is <code>{ name, wait, duration }</code> in minutes. Write <code>planItinerary(rides, minutes)</code>: sort rides by total cost (<code>wait + duration</code>, ties by name) and take them in that order while the running total stays within <code>minutes</code>. Stop at the first ride that doesn\'t fit. Return the chosen names.</p>',
        starter: 'function planItinerary(rides, minutes) {\n  return rides.map((r) => r.name);\n}\n',
        tests: [
          { args: [[{ name: 'Sky Tram', wait: 10, duration: 5 }, { name: 'Galaxy Coaster', wait: 45, duration: 3 }, { name: 'River Rapids', wait: 20, duration: 8 }], 60], expected: ['Sky Tram', 'River Rapids'] },
          { args: [[], 100], expected: [] },
        ],
        hidden: [
          { args: [[{ name: 'B', wait: 5, duration: 5 }, { name: 'A', wait: 5, duration: 5 }], 20], expected: ['A', 'B'] },
          { args: [[{ name: 'X', wait: 100, duration: 1 }], 50], expected: [] },
          { args: [[{ name: 'Q', wait: 0, duration: 10 }, { name: 'P', wait: 10, duration: 0 }, { name: 'R', wait: 1, duration: 1 }], 12], expected: ['R', 'P'] },
        ],
        hints: ['const sorted = [...rides].sort((a, b) => (a.wait + a.duration) - (b.wait + b.duration) || a.name.localeCompare(b.name));', 'Keep a running total and break when the next ride doesn\'t fit.'],
        wiki: '<b>Greedy algorithms:</b> take the cheapest option first. Simple, fast and explainable to guests.',
        peer: { who: 'bruno', text: 'Don\'t sort the input array in place. Copy it first; the caller still needs it.' },
      }),
      sqlTask({
        id: 's2', title: 'Guests Without Reservations', from: 'intern4', day: 7, due: { day: 9, minute: 120 }, effort: 45, ordered: true,
        brief: '<p>Jonah wants to nudge guests who haven\'t reserved anything yet. Return <code>guest_id, first_name</code> for every guest with <b>no reservations at all</b>, ordered by guest_id.</p>',
        hints: ['LEFT JOIN reservations r ON r.guest_id = g.guest_id', 'WHERE r.res_id IS NULL keeps only guests with no match.'],
        wiki: '<b>Anti-join:</b> LEFT JOIN … WHERE right.key IS NULL finds rows with no partner. NOT EXISTS works too.',
        peer: { who: 'mira', text: 'An inner JOIN can never find missing things. It drops them.' },
      }),
      {
        id: 'q2', type: 'quiz', title: 'Full-Stack Fundamentals', from: 'mentor', day: 8, due: { day: 8, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Kofi\'s full-stack check: one question from each layer.</p>',
        hints: ['HTTP semantics, caching, indexes, async, and where validation belongs.'],
        wiki: '<b>The stack:</b> browser (HTML/CSS/JS) → API (HTTP/JSON) → services (Python, JS) → database (SQL). Validate on the server; cache what\'s read often.',
        peer: { who: 'jonah', text: 'Client-side validation is for guests. Server-side validation is for everyone else.' },
        questions: [
          { q: 'Where must input validation happen?', options: ['Only in the browser', 'On the server (the browser check is just for convenience)', 'Only in the database', 'Nowhere'], answer: 1 },
          { q: 'Which HTTP method should create a new booking?', options: ['GET', 'POST', 'HEAD', 'OPTIONS'], answer: 1 },
          { q: 'Wait times are read 10,000×/min and change every minute. Good idea?', options: ['Query the database on every request', 'Cache them briefly (e.g. 30–60 s)', 'Hard-code them', 'Email them'], answer: 1 },
          { q: 'A query filtering on guest_id is slow on a big table. First fix?', options: ['Add an index on guest_id', 'Buy a faster laptop', 'Use SELECT *', 'Delete old guests'], answer: 0 },
          { q: 'In JavaScript, await inside an async function:', options: ['Blocks the whole browser', 'Pauses that function until the promise settles', 'Makes code synchronous everywhere', 'Only works with timers'], answer: 1 },
        ],
      },
      IS.T.groupDemo({ day: 8, due: { day: 10, minute: 150 }, project: 'Park Pal Itinerary Planner', terms: ['itinerary', 'wait', 'api', 'ui', 'plan', 'guest'],
        failQ: 'What does the planner do when the wait-time feed goes down?', failBest: 'It uses the last good wait times with an "as of" timestamp, flags stale rides, and the API returns a clear fallback instead of an error.' }),
      IS.T.midpoint({ terms: ['full-stack', 'planner'] }),
      py({
        id: 'p2', bugfix: true, title: 'Bug Fix: Duplicate Bookings Crash', from: 'manager', day: 11, due: { day: 12, minute: 180 }, effort: 45, fnName: 'dedupe_bookings',
        brief: '<p>🐞 <b>PAL-88:</b> The booking sync crashes with <code>TypeError: unhashable type: \'list\'</code>. Each booking is <code>[guest_id, ride, time]</code>. Fix <code>dedupe_bookings(bookings)</code> to drop exact duplicates while <b>keeping the original order</b> (first occurrence wins).</p>',
        starter: 'def dedupe_bookings(bookings):\n    return list(set(bookings))\n',
        tests: [{ args: [[[1, 'GC', '10:00'], [2, 'ST', '10:30'], [1, 'GC', '10:00']]], expected: [[1, 'GC', '10:00'], [2, 'ST', '10:30']] }, { args: [[]], expected: [] }],
        hidden: [{ args: [[[3, 'HM', '11:00'], [3, 'HM', '11:30']]], expected: [[3, 'HM', '11:00'], [3, 'HM', '11:30']] }, { args: [[[1, 'A', '1'], [1, 'A', '1'], [1, 'A', '1']]], expected: [[1, 'A', '1']] }],
        hints: ['Lists can\'t go in a set, but tuples can: tuple(b).', 'Loop once, keep a set of tuples you\'ve seen, append bookings you haven\'t.'],
        wiki: '<b>Hashability:</b> sets and dict keys need immutable values. Convert lists to tuples to use them as keys.',
        peer: { who: 'anya', text: 'set() also scrambles the order. Two bugs in one line!' },
      }),
      IS.T.email({ day: 12, due: { day: 12, minute: 180 }, to: 'Harriet Vance', toTitle: 'VP of Imagineering', subject: 'Park Pal Beta Date',
        brief: 'The ratings feed is still in legal review, so the recommendations beta moves one week later; the itinerary planner ships on time.',
        terms: ['beta', 'recommend', 'legal|review', 'itinerary|planner', 'date|week', 'sorry|apolog'] }),
      {
        id: 'r2', type: 'review', title: 'Review: Recommendation Service', from: 'intern3', day: 13, due: { day: 14, minute: 180 }, effort: 45, kind: 'individual', category: 'Code Review',
        brief: '<p>Anya wants a review of the first version of the recommender.</p>',
        code: `def recommend(guest):
    ratings = db.all_ratings()          # every rating, every call
    scores = {}
    for r in ratings:
        scores[r.ride] = r.stars       # overwrites; not an average
    ranked = sorted(scores, key=scores.get)
    return ranked[:3]`,
        issues: [
          { text: 'It loads every rating on every call. Precompute or cache averages.', real: true },
          { text: 'scores[r.ride] = r.stars keeps only the last rating instead of averaging them.', real: true },
          { text: 'It sorts ascending, so it recommends the WORST rides.', real: true },
          { text: 'It never excludes rides the guest already rated or rode.', real: true },
          { text: 'Python functions can\'t return lists.', real: false },
          { text: 'Dictionaries can\'t use strings as keys.', real: false },
          { text: 'sorted() only works on numbers.', real: false },
        ],
        keywords: ['cache', 'average', 'overwrite', 'ascending', 'reverse', 'worst', 'exclude', 'already'],
        hints: ['Trace it with two ratings for the same ride.', 'Which end of the sorted list has the highest scores?'],
        wiki: '<b>Recommenders:</b> average (or better, smooth) ratings, rank highest first, filter out what the guest already knows.',
        peer: { who: 'jonah', text: 'I tested it. It told me to ride the broken carousel. Three times.' },
      },
      js({
        id: 'j3', optional: true, title: '⭐ Stretch: LRU Cache for the API', from: 'mentor', day: 14, due: { day: 17, minute: 180 }, effort: 60, fnName: 'lruCache',
        brief: '<p><b>Optional stretch.</b> Write <code>lruCache(capacity, ops)</code>. <code>ops</code> is a list of <code>["put", key, value]</code> and <code>["get", key]</code>. Simulate a least-recently-used cache: <code>get</code> returns the value or <code>-1</code> and marks the key as recently used; <code>put</code> inserts or updates (also marking it used) and, if over capacity, evicts the least recently used key. Return the list of results from every <code>get</code>.</p>',
        starter: 'function lruCache(capacity, ops) {\n  const results = [];\n  return results;\n}\n',
        tests: [
          { args: [2, [['put', 'a', 1], ['put', 'b', 2], ['get', 'a'], ['put', 'c', 3], ['get', 'b'], ['get', 'c']]], expected: [1, -1, 3] },
          { args: [1, [['put', 'a', 1], ['put', 'b', 2], ['get', 'a'], ['get', 'b']]], expected: [-1, 2] },
        ],
        hidden: [
          { args: [2, [['get', 'z']]], expected: [-1] },
          { args: [2, [['put', 'a', 1], ['put', 'b', 2], ['put', 'a', 5], ['put', 'c', 3], ['get', 'a'], ['get', 'b']]], expected: [5, -1] },
        ],
        hints: ['A Map remembers insertion order. Delete and re-set a key to mark it most recent.', 'map.keys().next().value is the least recently used key.'],
        wiki: '<b>LRU caches:</b> keep hot data in memory and evict what hasn\'t been used longest. Behind almost every fast API.',
        peer: { who: 'bruno', text: 'Map is secretly the perfect LRU. Don\'t tell the interviewers.' },
      }),
      IS.T.designDoc({ id: 'w-design2', title: 'Park Pal Recommendations', day: 16, due: { day: 17, minute: 180 }, group: 'g2', minWords: 180, metrics: true,
        brief: 'The capstone: personalized ride recommendations in Park Pal, from ratings data (SQL) through the ranking service (Python) to the filterable UI (web).',
        terms: ['recommend', 'rating', 'sql', 'python', 'ui', 'privacy', 'sample dataset', 'metric'], termsNeeded: 5 }),
      py({
        id: 'p3', kind: 'group', group: 'g2', title: 'Capstone: Recommend Rides', from: 'manager', day: 16, due: { day: 19, minute: 180 }, effort: 90, fnName: 'recommend',
        brief: '<p><code>ratings</code> maps each guest to <code>{ride: stars}</code>. Write <code>recommend(ratings, guest, k)</code>: using only <b>other</b> guests\' ratings, average the stars for every ride the guest has <b>not</b> rated, and return the top <code>k</code> ride names (highest average first, ties by name). A guest with no ratings gets recommendations from everyone\'s ratings.</p>',
        starter: 'def recommend(ratings, guest, k):\n    pass\n',
        tests: [
          { args: [{ ana: { GC: 5, ST: 2 }, ben: { GC: 4, HM: 5, ST: 3 }, cal: { HM: 3, RR: 4 } }, 'ana', 2], expected: ['HM', 'RR'] },
          { args: [{ ana: { GC: 5, ST: 2 }, ben: { GC: 4, HM: 5, ST: 3 }, cal: { HM: 3, RR: 4 } }, 'ana', 1], expected: ['HM'] },
        ],
        hidden: [
          { args: [{ ana: { GC: 5, ST: 2 }, ben: { GC: 4, HM: 5, ST: 3 }, cal: { HM: 3, RR: 4 } }, 'dee', 2], expected: ['GC', 'HM'] },
          { args: [{ a: { X: 1 } }, 'a', 3], expected: [] },
        ],
        hints: ['seen = ratings.get(guest, {})', 'Keep totals[ride] = [sum, count] for rides not in seen, skipping the guest\'s own row.', 'sorted(totals, key=lambda r: (-avg(r), r))[:k]'],
        wiki: '<b>Popularity-based recommendations:</b> a strong, explainable baseline before any machine learning.',
        peer: { who: 'anya', text: 'Exclude the guest\'s own ratings, or they\'ll just be recommended their own favorites.' },
      }),
      sqlTask({
        id: 's3', kind: 'group', group: 'g2', title: 'Capstone: Top Attraction per Land', from: 'intern3', day: 18, due: { day: 20, minute: 180 }, effort: 60, ordered: true,
        brief: '<p>For the recommendations screen, return the single best-rated attraction in each land: <code>land, name, avg_stars</code> (rounded to 2). Ties go to the attraction name that comes first. Order by land. Only attractions with ratings count.</p>',
        hints: ['First compute AVG(stars) per attraction in a CTE.', 'ROW_NUMBER() OVER (PARTITION BY land ORDER BY avg DESC, name) AS rn', 'Keep rn = 1.'],
        wiki: '<b>Window functions:</b> ROW_NUMBER() OVER (PARTITION BY group ORDER BY …) ranks rows inside each group.',
        peer: { who: 'jonah', text: 'Classic "top 1 per group." Window functions make it painless.' },
      }),
      webTask({
        id: 'w2', kind: 'group', group: 'g2', title: 'Capstone: Filter Chips', from: 'intern4', day: 20, due: { day: 23, minute: 120 }, effort: 75,
        brief: '<p>Make the land filter work. For each name in <code>lands</code>, add a <code>&lt;button class="chip"&gt;</code> to <code>#chips</code>. Clicking a chip shows only the <code>#recs li</code> whose <code>data-land</code> matches (hide the rest with the <code>hidden</code> property), sets that chip\'s <code>aria-pressed</code> to <code>"true"</code> and every other chip\'s to <code>"false"</code>.</p>',
        starter: page('  <main>\n    <h2>Recommended for you</h2>\n    <div id="chips"></div>\n    <ul id="recs">\n      <li data-land="Tomorrow">Galaxy Coaster</li>\n      <li data-land="Adventure">Pirate Lagoon</li>\n      <li data-land="Frontier">Haunted Manor</li>\n      <li data-land="Tomorrow">Sky Tram</li>\n    </ul>\n  </main>\n  <script>\n    const lands = [\'Tomorrow\', \'Adventure\', \'Frontier\'];\n    // TODO: build the chips and filter #recs\n  </script>'),
        checks: [
          { label: 'Three .chip buttons, one per land', fn: (d) => $$(d, '#chips button.chip').map(txt).join('|') === 'Tomorrow|Adventure|Frontier' },
          { label: 'Clicking "Tomorrow" shows only Tomorrow rides', fn: (d) => { $$(d, '#chips button.chip')[0].click(); return $$(d, '#recs li').filter(shown).map(txt).join('|') === 'Galaxy Coaster|Sky Tram'; } },
          { label: 'The clicked chip is aria-pressed="true", others "false"', fn: (d) => $$(d, '#chips button.chip').map((b) => b.getAttribute('aria-pressed')).join(',') === 'true,false,false' },
          { label: 'Switching to "Frontier" updates the list and chips', hidden: true, fn: (d) => { $$(d, '#chips button.chip')[2].click(); return $$(d, '#recs li').filter(shown).map(txt).join('|') === 'Haunted Manor' && $$(d, '#chips button.chip').map((b) => b.getAttribute('aria-pressed')).join(',') === 'false,false,true'; } },
        ],
        hints: ['const b = document.createElement(\'button\'); b.className = \'chip\'; b.type = \'button\'; b.textContent = land;', 'b.addEventListener(\'click\', () => { … li.hidden = li.dataset.land !== land; … })', 'chips.forEach((c) => c.setAttribute(\'aria-pressed\', String(c === b)))'],
        wiki: '<b>Toggle buttons:</b> aria-pressed tells screen readers which filter is active.',
        peer: { who: 'jonah', text: 'Guests in Frontierland only care about Frontierland. Filters are huge.' },
      }),
      {
        id: 't1', type: 'terminal', urgent: true, bugfix: true, kind: 'individual', category: 'Coding', motd: MOTD,
        title: '🚨 URGENT: Park Pal Returning Errors', from: 'manager', day: 22, due: { day: 22, minute: 120 }, effort: 40,
        brief: '<p>🚨 <b>SEV-1:</b> Since the 10:00 release, Park Pal is failing for guests. Read <code>/srv/parkpal/RUNBOOK.md</code>, fix the bad setting in <code>/srv/parkpal/.env</code> (keep the other settings), and restart with <code>/srv/parkpal/restart.sh</code> <b>by 11:00 AM</b>. Then print how many <code>pool exhausted</code> errors are in <code>/var/log/parkpal/api.log</code> for the incident channel.</p>',
        fs: { files: {
          '/srv/parkpal/RUNBOOK.md': '# Park Pal runbook\nIf requests fail with "pool exhausted", DB_POOL_SIZE must be 10.\nRestart: /srv/parkpal/restart.sh\n',
          '/srv/parkpal/.env': 'PORT=3000\nDB_HOST=db.internal\nDB_POOL_SIZE=0\nCACHE_TTL=60\n',
          '/srv/parkpal/restart.sh': { content: 'grep DB_POOL_SIZE /srv/parkpal/.env\necho parkpal-api restarted\n', mode: '755' },
          '/var/log/parkpal/api.log': API_LOG,
        }, cwd: HOME },
        objectives: [
          { text: '.env has DB_POOL_SIZE=10 and keeps the other settings', check: (sh) => { const c = sh.read('/srv/parkpal/.env') || ''; return /^DB_POOL_SIZE=10$/m.test(c) && !/DB_POOL_SIZE=0\b/.test(c) && ['PORT=3000', 'DB_HOST=db.internal', 'CACHE_TTL=60'].every((l) => c.includes(l)); } },
          { text: 'Run restart.sh after the fix', check: (sh) => sh.history.some((h) => /restart\.sh/.test(h.cmd) && h.out.includes('DB_POOL_SIZE=10')) },
          { text: 'Print the number of "pool exhausted" errors', check: (sh) => sh.ran(/grep/) && sh.ranOutput('5') },
        ],
        hints: ['cat /srv/parkpal/RUNBOOK.md', "sed -i 's/DB_POOL_SIZE=0/DB_POOL_SIZE=10/' /srv/parkpal/.env", "grep -c 'pool exhausted' /var/log/parkpal/api.log"],
        wiki: '<b>Incident runbook:</b> restore service first, confirm the fix, then report impact with real numbers.',
        peer: { who: 'bruno', text: 'I set the pool to 0 to test something locally and it... shipped. I\'ll write the timeline.' },
      },
      IS.T.postmortem({ title: 'Park Pal Errors After Release', day: 22, due: { day: 23, minute: 180 }, terms: ['pool', 'config', 'release|deploy', 'restart|rollback', 'review|validation', 'monitor|alert'] }),
      IS.T.status({ day: 25, terms: ['capstone', 'recommend', 'incident', 'postmortem', 'planner', 'sql'] }),
      IS.T.readme({ day: 26, due: { day: 28, minute: 180 }, project: 'Park Pal Recommendations', terms: ['recommend', 'sql', 'python', 'filter', 'sample dataset', 'privacy'] }),
      IS.T.finalPres({ project: 'Park Pal Recommendations', terms: ['guest', 'recommend', 'rating', 'privacy', 'itinerary', 'sql', 'python'], questions: [
        { who: 'harriet', q: 'Why should a guest trust Park Pal\'s recommendations?', options: [
          { text: 'They come from other guests\' real ratings, we can explain every one ("guests like you loved this"), and we never use data the guest didn\'t agree to share.', pts: 10 },
          { text: 'Because the algorithm is very advanced.', pts: 2 },
          { text: 'They shouldn\'t, it\'s a beta.', pts: 1 },
          { text: 'Because we say so.', pts: 0 }] },
        { who: 'harriet', q: 'What would you build next with another summer?', options: [
          { text: 'Combine the planner and recommendations into one plan that fits the guest\'s free time, then A/B test it against today\'s app.', pts: 10 },
          { text: 'Rewrite it in a new framework.', pts: 2 },
          { text: 'Nothing, it\'s done.', pts: 0 },
          { text: 'More colors.', pts: 1 }] },
        { who: 'manager', q: 'What did the outage teach the team?', options: [
          { text: 'Config changes need review and validation like code, and we added an alert on pool errors so we catch it in minutes.', pts: 10 },
          { text: 'Bruno should be more careful.', pts: 0 },
          { text: 'Never deploy.', pts: 1 },
          { text: 'Nothing.', pts: 0 }] },
        { who: 'mentor', q: 'Why use SQL, Python and JavaScript instead of one language?', options: [
          { text: 'Each layer uses the right tool: SQL aggregates sets of data close to the database, Python ranks, JavaScript runs in the guest\'s browser.', pts: 10 },
          { text: 'To show off.', pts: 1 },
          { text: 'No reason.', pts: 0 },
          { text: 'One language would be too easy.', pts: 2 }] },
      ] }),
      IS.T.selfEval({ day: 30, due: { day: 31, minute: 180 }, terms: ['full-stack', 'capstone', 'lead', 'team', 'incident', 'deadline'] }),
    ],
    interview: {
      coding: [
        { id: 'i-cap1', type: 'coding', lang: 'javascript', title: 'Group Rides by Land', fnName: 'groupByLand',
          brief: '<p>Write <code>groupByLand(rides)</code>. Each ride is <code>{ name, land }</code>. Return an object mapping each land to an alphabetically sorted array of ride names.</p>',
          starter: 'function groupByLand(rides) {\n  \n}\n',
          tests: [{ args: [[{ name: 'Sky Tram', land: 'Tomorrow' }, { name: 'Galaxy Coaster', land: 'Tomorrow' }, { name: 'Pirate Lagoon', land: 'Adventure' }]], expected: { Tomorrow: ['Galaxy Coaster', 'Sky Tram'], Adventure: ['Pirate Lagoon'] } }, { args: [[]], expected: {} }],
          hidden: [{ args: [[{ name: 'B', land: 'X' }, { name: 'A', land: 'X' }, { name: 'C', land: 'Y' }]], expected: { X: ['A', 'B'], Y: ['C'] } }] },
        { id: 'i-cap2', type: 'sql', title: 'Tickets Sold by Type', ordered: true, starter: START,
          brief: '<p>Return <code>type, sold</code> (how many tickets of each type), most sold first, ties by type.</p>' },
        { id: 'i-cap3', type: 'coding', lang: 'python', title: 'Median Wait', fnName: 'median_wait',
          brief: '<p>Write <code>median_wait(waits)</code> returning the median of a list of numbers (average the two middle values for an even count). Empty → <code>None</code>.</p>',
          starter: 'def median_wait(waits):\n    pass\n',
          tests: [{ args: [[10, 30, 20]], expected: 20 }, { args: [[]], expected: null }],
          hidden: [{ args: [[10, 20]], expected: 15.0 }, { args: [[5]], expected: 5 }, { args: [[40, 10, 30, 20]], expected: 25.0 }] },
      ],
      concepts: [
        { q: 'A guest\'s browser calls your API, which queries the database. Where does the SQL run?', options: ['In the browser', 'On the server, against the database', 'In the CSS', 'On the guest\'s phone'], answer: 1 },
        { q: 'Which status code fits "the guest isn\'t allowed to see this plan"?', options: ['200', '403', '301', '500'], answer: 1 },
        { q: 'Why parameterize SQL queries?', options: ['Prettier code', 'Prevent SQL injection', 'Faster typing', 'Required by Python'], answer: 1 },
        { q: 'Which tool is best suited to aggregate millions of rows by land?', options: ['A JavaScript loop in the browser', 'A SQL GROUP BY in the database', 'A CSS grid', 'A bash alias'], answer: 1 },
        { q: 'A new release breaks production. First move?', options: ['Debug live for an hour', 'Roll back or fix forward fast, then investigate', 'Wait for users to stop', 'Delete the logs'], answer: 1 },
        { q: 'textContent vs innerHTML for guest-provided text:', options: ['innerHTML is safer', 'textContent is safe; innerHTML can run injected markup', 'They are identical', 'Neither works'], answer: 1 },
        { q: 'What does a README primarily do for a project?', options: ['Stores passwords', 'Explains what it is, how to run it and how to contribute', 'Replaces tests', 'Nothing'], answer: 1 },
        { q: 'As the most senior intern, a teammate is stuck for a day. You:', options: ['Ignore it; not your task', 'Offer to pair, and flag the risk to the team if the deadline is at stake', 'Do their task secretly', 'Tell the manager they\'re slow'], answer: 1 },
      ],
    },
  });
})();
