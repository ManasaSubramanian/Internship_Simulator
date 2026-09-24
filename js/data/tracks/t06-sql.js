// Internship 6: SQL, Reservations & Ticketing Data.
// Queries run on real SQLite (sql.js). Each task is graded on the database you
// can see AND a hidden database generated from a different seed.
(function () {
  const SCHEMA = [
    'CREATE TABLE guests (guest_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, state TEXT, member INTEGER);',
    'CREATE TABLE attractions (attraction_id INTEGER PRIMARY KEY, name TEXT, land TEXT, capacity INTEGER);',
    'CREATE TABLE reservations (res_id INTEGER PRIMARY KEY, guest_id INTEGER, attraction_id INTEGER, res_date TEXT, party_size INTEGER, status TEXT);',
    'CREATE TABLE tickets (ticket_id INTEGER PRIMARY KEY, guest_id INTEGER, type TEXT, price REAL, purchased TEXT);',
    'CREATE TABLE ratings (rating_id INTEGER PRIMARY KEY, guest_id INTEGER, attraction_id INTEGER, stars INTEGER);',
  ].join('\n');

  const FIRST = ['Ava', 'Ben', 'Carmen', 'Dmitri', 'Elena', 'Farah', 'Gus', 'Hiro', 'Ines', 'Jamal', 'Kira', 'Liam', 'Maya', 'Nico', 'Omar', 'Pia'];
  const LAST = ['Adams', 'Baker', 'Cruz', 'Diaz', 'Ellis', 'Fischer', 'Garcia', 'Hughes', 'Ito', 'Jones', 'Khan', 'Lopez', 'Moreau', 'Novak', 'Ortiz', 'Park'];
  const STATES = ['FL', 'CA', 'TX', 'NY', 'GA', 'AZ'];
  const ATTR = [['Galaxy Coaster', 'Tomorrow', 24], ['Sky Tram', 'Tomorrow', 12], ['Pirate Lagoon', 'Adventure', 20], ['Haunted Manor', 'Frontier', 16], ['River Rapids', 'Frontier', 12], ['Castle Carousel', 'Fantasy', 40]];
  const TYPES = [['1-Day', 129], ['Park Hopper', 179], ['Annual Pass', 899]];
  const DATES = ['2027-06-14', '2027-06-15', '2027-06-16'];
  const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

  function seed(n) {
    const rnd = IS.util.seeded(n);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const rows = [];
    const G = 14;
    for (let i = 1; i <= G; i++) {
      rows.push(`INSERT INTO guests VALUES (${i}, ${q(FIRST[(i * 7 + n) % FIRST.length])}, ${q(LAST[(i * 5 + n * 3) % LAST.length])}, ${q(pick(STATES))}, ${rnd() < 0.4 ? 1 : 0});`);
    }
    ATTR.forEach(([name, land, cap], i) => rows.push(`INSERT INTO attractions VALUES (${i + 1}, ${q(name)}, ${q(land)}, ${cap + Math.floor(rnd() * 8)});`));
    for (let i = 1; i <= 26; i++) {
      const r = rnd();
      rows.push(`INSERT INTO reservations VALUES (${i}, ${1 + Math.floor(rnd() * (G - 3))}, ${1 + Math.floor(rnd() * ATTR.length)}, ${q(pick(DATES))}, ${1 + Math.floor(rnd() * 6)}, ${q(r < 0.7 ? 'confirmed' : r < 0.85 ? 'cancelled' : 'waitlist')});`);
    }
    let tid = 1;
    const ticket = (g, type, price, date) => rows.push(`INSERT INTO tickets VALUES (${tid++}, ${g}, ${q(type)}, ${price === null ? 'NULL' : price}, ${q(date)});`);
    const bought = [];
    for (let i = 0; i < 20; i++) {
      const g = 1 + Math.floor(rnd() * G);
      const [type, base] = pick(TYPES);
      const price = Math.round(base * (rnd() < 0.3 ? 0.85 : 1) * 100) / 100;
      const date = pick(DATES);
      ticket(g, type, price, date);
      bought.push([g, type, price, date]);
    }
    ticket(...bought[3]);
    ticket(...bought[9]);
    ticket(1 + Math.floor(rnd() * G), '1-Day', null, pick(DATES));
    ticket(1 + Math.floor(rnd() * G), 'Park Hopper', -179, pick(DATES));
    for (let i = 1; i <= 28; i++) {
      const a = 1 + Math.floor(rnd() * ATTR.length);
      const stars = Math.max(1, Math.min(5, Math.round((a === 1 || a === 6 ? 4.4 : a === 5 ? 2.8 : 3.7) + (rnd() - 0.5) * 2.4)));
      rows.push(`INSERT INTO ratings VALUES (${i}, ${1 + Math.floor(rnd() * G)}, ${a}, ${stars});`);
    }
    return rows.join('\n');
  }

  // Shared with the capstone internship.
  IS.sqlData = { schema: SCHEMA, seed };
  const DB = { schema: SCHEMA, seeds: [seed(11), seed(29)] };
  const START = '-- Write your query below\n';

  IS.addCharacters({
    isabel: {
      name: 'Isabel Moreno', title: 'Manager, Reservations Data', role: 'Manager',
      bio: 'Isabel\'s team owns the data behind every dining reservation and ticket sale. Finance calls her before they call anyone else.',
      look: { skin: '#c68b5f', hair: 'wavy', hairColor: '#1c1714', eyes: '#3b2618', top: 'blazer', topColor: '#8e2b45', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers', accessory2: 'earrings' },
      chat: ['Numbers people trust are the product. Queries are just how we make them.', 'If finance and ops get different totals, we have a bug, and it\'s ours.', 'Always ask what the query is FOR.'],
    },
    thabo: {
      name: 'Thabo Nkosi', title: 'Senior Data Engineer (your mentor)', role: 'Mentor',
      bio: 'Thabo has tuned queries that run across billions of rows. Still hand-writes SQL on a whiteboard before touching a keyboard.',
      look: { skin: '#4d2c1d', hair: 'short', hairColor: '#1c1714', eyes: '#3b2618', facial: 'beard', top: 'polo', topColor: '#3e6b48', bottom: 'pants', bottomColor: '#8a6d4b', shoes: 'sneakers', accessory: 'glasses' },
      chat: ['Write the FROM and JOINs first. The SELECT is the last thing you decide.', 'A missing join condition is how you accidentally create a billion rows.', 'NULL is not a value. It\'s the absence of one. Compare with IS NULL.'],
    },
    ellie: {
      name: 'Ellie Brennan', title: 'Analytics Intern', role: 'Intern', reliability: 0.9,
      bio: 'Turns vague questions into precise queries. Organized and reliable.',
      look: { skin: '#f8e1cf', hair: 'wavy', hairColor: '#9c6a3a', eyes: '#4f6b3a', top: 'cardigan', topColor: '#c2593f', bottom: 'skirt', bottomColor: '#2b2622', shoes: 'flats' },
      chat: ['I rewrite the question as a sentence before writing SQL. "For each land, how many…"'],
    },
    ravi: {
      name: 'Ravi Iyer', title: 'Data Engineering Intern', role: 'Intern', reliability: 0.6,
      bio: 'Writes astonishing one-query-to-rule-them-all SQL. Estimates are… aspirational.',
      look: { skin: '#a8704a', hair: 'sidepart', hairColor: '#1c1714', eyes: '#3b2618', facial: 'stubble', top: 'tee', topColor: '#d99a2b', bottom: 'pants', bottomColor: '#2b2622', shoes: 'sneakers' },
      chat: ['My query has six CTEs and a window function. It returns one number. Beautiful.'],
    },
    yuki: {
      name: 'Yuki Sato', title: 'Database Intern', role: 'Intern', reliability: 0.95,
      bio: 'Thinks in indexes and query plans. Her EXPLAIN output is annotated.',
      look: { skin: '#f1d0b5', hair: 'long', hairColor: '#1c1714', eyes: '#3b2618', top: 'button', topColor: '#f3ece0', bottom: 'pants', bottomColor: '#4b5a3a', shoes: 'loafers', accessory: 'glasses' },
      chat: ['GROUP BY and HAVING are best friends. WHERE runs before grouping, HAVING after.'],
    },
    owen: {
      name: 'Owen Price', title: 'Finance Systems Intern', role: 'Intern', reliability: 0.7,
      bio: 'Accountant turned engineer. Knows exactly which report finance will ask for at 11:58 AM.',
      look: { skin: '#e7bf9c', hair: 'short', hairColor: '#6f4526', eyes: '#6b6f5c', facial: 'mustache', top: 'sweater', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#5a4636', shoes: 'loafers', build: 'broad' },
      chat: ['Debits on the left, credits on the right, NULLs everywhere.'],
    },
  });

  const sqlTask = (o) => Object.assign({ type: 'sql', kind: 'individual', category: 'Coding', starter: START, fnName: undefined }, o);

  IS.registerTrack({
    id: 'sql', n: 6, icon: '🗄️', lang: 'sql', langLabel: 'SQL', rate: 34,
    title: 'Data Engineering Intern', team: 'Reservations & Ticketing Data',
    blurb: 'Answer real business questions with SQL: joins, grouping, HAVING, subqueries and window functions over reservation and ticket data, graded on a hidden database too.',
    skills: ['SELECT / WHERE / ORDER BY', 'JOINs', 'GROUP BY & HAVING', 'Window functions', 'Data integrity'],
    channel: 'res-data', lab: { name: 'Data Center', art: 'db' },
    cast: { manager: 'isabel', mentor: 'thabo', interns: ['ellie', 'ravi', 'yuki', 'owen'] },
    groups: { g1: { name: 'Reservation Dashboard', members: ['ellie', 'ravi'] }, g2: { name: 'Ticketing Fraud Monitor', members: ['yuki', 'owen'] } },
    incident: 'The ticketing ledger has negative and missing prices, and finance closes the books at noon.',
    scenario: { conflictA: 'live queries during the demo', conflictB: 'pre-computed result screenshots', delay: 'the production database snapshot is delayed', delayFix: 'a sample database' },
    db: DB,
    tasks: [
      {
        id: 'q1', type: 'quiz', title: 'Data Governance & Payment Data', from: 'rosa', day: 1, due: { day: 1, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Ticketing data includes payment information. Pass the data governance check (80%+).</p>',
        hints: ['Never store full card numbers. Access is need-to-know. Log and audit changes.'],
        wiki: '<b>Payment data policy (PCI):</b> never store full card numbers or security codes; tokenize; restrict and audit access.',
        peer: { who: 'owen', text: 'Card data question: the answer is always "don\'t store it."' },
        questions: [
          { q: 'A product manager wants full card numbers in the reporting database "for analysis." You:', options: ['Add them.', 'Decline: store only tokens or the last 4 digits, per payment-card rules.', 'Store them encrypted in a comment column.', 'Put them in a spreadsheet instead.'], answer: 1 },
          { q: 'You need production data to debug a query. Best approach?', options: ['Copy the full database to your laptop.', 'Use an approved, masked sample or read-only replica.', 'Ask a friend with access.', 'Screenshot the tables.'], answer: 1 },
          { q: 'Before running a bulk UPDATE on production, you should:', options: ['Just run it.', 'Test on a copy, wrap it in a transaction, and have it reviewed.', 'Run it twice to be sure.', 'Disable backups.'], answer: 1 },
          { q: 'Who should have write access to the ticket ledger?', options: ['Everyone in the company.', 'Only the systems and people who need it, with changes audited.', 'All interns.', 'Nobody.'], answer: 1 },
          { q: 'You notice a query result exposes guest emails in a public dashboard. You:', options: ['Leave it.', 'Report it and remove the column right away.', 'Change the dashboard color.', 'Download a copy.'], answer: 1 },
        ],
      },
      IS.T.intro({ channel: 'res-data', team: 'Reservations & Ticketing Data', teamKey: 'data' }),
      sqlTask({
        id: 's1', title: 'Florida Guests', from: 'mentor', day: 2, due: { day: 3, minute: 180 }, effort: 45, ordered: true,
        brief: '<p>Marketing wants the names of all guests from Florida (<code>state = \'FL\'</code>). Return <code>first_name, last_name</code>, ordered by last name, then first name.</p>',
        hints: ['SELECT first_name, last_name FROM guests WHERE … ORDER BY …', 'Strings in SQL use single quotes: \'FL\'.'],
        wiki: '<b>SQL basics:</b> <code>SELECT cols FROM table WHERE condition ORDER BY col1, col2;</code>',
        peer: { who: 'ellie', text: 'ORDER BY last_name, first_name. Two columns, comma-separated.' },
      }),
      sqlTask({
        id: 's2', title: 'Confirmed Reservations per Attraction', from: 'manager', day: 3, due: { day: 4, minute: 180 }, effort: 60, ordered: true,
        brief: '<p>For each attraction, how many <b>confirmed</b> reservations are there? Return <code>name, reservations</code> (the count), most reservations first, ties by name. Attractions with no confirmed reservations can be left out.</p>',
        hints: ['JOIN reservations to attractions ON attraction_id.', 'WHERE r.status = \'confirmed\' then GROUP BY a.name.', 'ORDER BY reservations DESC, a.name'],
        wiki: '<b>Aggregates:</b> <code>COUNT(*)</code> with <code>GROUP BY</code> counts rows per group.',
        peer: { who: 'yuki', text: 'Filter with WHERE before grouping. It\'s cheaper and clearer.' },
      }),
      {
        id: 'r1', type: 'review', title: 'Code Review: Guest Lookup', from: 'mentor', day: 3, due: { day: 5, minute: 120 }, effort: 40, kind: 'individual', category: 'Code Review',
        brief: '<p>Review this guest lookup used by the call center app.</p>',
        code: `def find_guest(conn, last_name):
    sql = "SELECT * FROM guests, reservations WHERE last_name = '" + last_name + "'"
    return conn.execute(sql).fetchall()`,
        issues: [
          { text: 'SQL injection: user input is concatenated into the query. Use parameters (WHERE last_name = ?).', real: true },
          { text: 'Missing join condition: "guests, reservations" with no ON clause returns every guest paired with every reservation.', real: true },
          { text: 'SELECT * across two tables returns every column (including duplicates) and breaks when the schema changes.', real: true },
          { text: 'SQL keywords must be lowercase.', real: false },
          { text: 'fetchall() is deprecated.', real: false },
          { text: 'Python can\'t run SQL queries.', real: false },
        ],
        keywords: ['injection', 'parameter', '?', 'join', 'cartesian', 'on ', 'select *', 'columns'],
        hints: ['Try last_name = "O\'Brien". Or "x\' OR \'1\'=\'1".', 'How many rows come back with 10 guests and 20 reservations?'],
        wiki: '<b>Security:</b> always pass values as query parameters, never by string concatenation.',
        peer: { who: 'ravi', text: 'That cartesian product took down staging once. 4 million rows for one guest.' },
      },
      IS.T.standup({ day: 4, terms: ['query', 'join', 'reservation', 'review', 'sql', 'guests'] }),
      sqlTask({
        id: 's3', bugfix: true, title: 'Bug Fix: Wrong Guests on the Manifest', from: 'manager', day: 4, due: { day: 5, minute: 180 }, effort: 45, ordered: true,
        brief: '<p>🐞 <b>RES-54:</b> The June 14 ride manifest lists the wrong guests. Fix the query so it returns each guest\'s <code>first_name</code> and the attraction <code>name</code> for reservations on <code>2027-06-14</code>, ordered by first name, then attraction name.</p>',
        starter: "-- June 14 manifest (buggy)\nSELECT g.first_name, a.name\nFROM reservations r\nJOIN guests g ON g.guest_id = r.res_id\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.res_date = '2027-06-14'\nORDER BY g.first_name, a.name;\n",
        hints: ['Look closely at the ON clause for guests. Which reservation column points at a guest?', 'reservations.guest_id, not res_id.'],
        wiki: '<b>Joins:</b> join on the foreign key that references the other table\'s primary key.',
        peer: { who: 'ellie', text: 'res_id = guest_id is a coincidence sometimes, which is why it "almost" worked.' },
      }),
      IS.T.designDoc({ id: 'w-design1', title: 'Reservation Dashboard', day: 6, due: { day: 8, minute: 120 }, group: 'g1',
        brief: 'Your team builds a dashboard showing expected guests per land and day from confirmed reservations.',
        terms: ['query', 'join', 'confirmed', 'land', 'party', 'refresh', 'index'], termsNeeded: 4 }),
      sqlTask({
        id: 's4', kind: 'group', group: 'g1', title: 'Dashboard: Expected Guests per Land', from: 'manager', day: 6, due: { day: 8, minute: 180 }, effort: 75, ordered: true,
        brief: '<p>Your query for the Reservation Dashboard: total expected guests (<code>SUM(party_size)</code>) per <code>land</code> for <b>confirmed</b> reservations. Return <code>land, guests</code>, largest first, ties by land.</p>',
        hints: ['JOIN attractions to get the land.', 'SUM(r.party_size) AS guests … GROUP BY a.land', 'ORDER BY guests DESC, a.land'],
        wiki: '<b>Aggregates:</b> SUM adds values; COUNT counts rows. Party size matters, not reservation count.',
        peer: { who: 'ravi', text: 'I used COUNT at first. A party of 6 is six guests, not one!' },
      }),
      sqlTask({
        id: 's5', title: 'Top-Rated Attractions (HAVING)', from: 'mentor', day: 7, due: { day: 9, minute: 120 }, effort: 60, ordered: true,
        brief: '<p>Which attractions average <b>4 stars or more</b>? Return <code>name, avg_stars</code> (rounded to 2 decimals), highest first, ties by name.</p>',
        hints: ['ROUND(AVG(rt.stars), 2) AS avg_stars', 'Filter groups with HAVING AVG(rt.stars) >= 4, since WHERE can\'t see aggregates.'],
        wiki: '<b>WHERE vs HAVING:</b> WHERE filters rows before grouping; HAVING filters groups after.',
        peer: { who: 'yuki', text: 'HAVING on the unrounded average is more accurate.' },
      }),
      {
        id: 'q2', type: 'quiz', title: 'SQL Fundamentals', from: 'mentor', day: 8, due: { day: 8, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Thabo\'s SQL fundamentals check.</p>',
        hints: ['NULL needs IS NULL.', 'LEFT JOIN keeps unmatched rows from the left table.'],
        wiki: '<b>SQL:</b> INNER JOIN keeps matches; LEFT JOIN keeps all left rows; NULL comparisons use IS NULL.',
        peer: { who: 'ellie', text: 'The NULL question trips everyone. = NULL is never true.' },
        questions: [
          { q: 'Which finds tickets with no price?', options: ['WHERE price = NULL', 'WHERE price IS NULL', 'WHERE price == NULL', 'WHERE NULL(price)'], answer: 1 },
          { q: 'HAVING is used to:', options: ['Filter rows before grouping', 'Filter groups after aggregation', 'Sort results', 'Join tables'], answer: 1 },
          { q: 'A LEFT JOIN from guests to reservations returns:', options: ['Only guests with reservations', 'All guests, with NULLs where there is no reservation', 'Only reservations', 'Nothing'], answer: 1 },
          { q: 'A primary key must be:', options: ['Unique and not null', 'A number', 'Text', 'Optional'], answer: 0 },
          { q: 'COUNT(price) vs COUNT(*):', options: ['Identical', 'COUNT(price) skips NULL prices', 'COUNT(*) skips NULLs', 'COUNT(price) sums prices'], answer: 1 },
        ],
      },
      IS.T.groupDemo({ day: 8, due: { day: 10, minute: 150 }, project: 'Reservation Dashboard', terms: ['land', 'guests', 'confirmed', 'query', 'party', 'dashboard'],
        failQ: 'What if the reservations database is slow or down?', failBest: 'The dashboard shows the last refreshed numbers with a timestamp, and queries run on a read replica so they never slow the booking system.' }),
      IS.T.midpoint({ terms: ['sql', 'query'] }),
      sqlTask({
        id: 's6', title: 'Guests Who Never Reserved', from: 'mentor', day: 11, due: { day: 12, minute: 180 }, effort: 75, ordered: true,
        brief: '<p>Find guests who have <b>no reservations at all</b>. Return <code>guest_id, first_name, last_name</code> ordered by <code>guest_id</code>.</p>',
        hints: ['LEFT JOIN reservations and keep rows WHERE r.res_id IS NULL.', 'Or use WHERE guest_id NOT IN (SELECT guest_id FROM reservations).'],
        wiki: '<b>Anti-join:</b> LEFT JOIN … WHERE right.id IS NULL finds rows without a match.',
        peer: { who: 'yuki', text: 'NOT IN has a NULL trap, so I prefer the LEFT JOIN version.' },
      }),
      sqlTask({
        id: 's7', bugfix: true, title: 'Bug Fix: Revenue Report Shows Counts', from: 'manager', day: 12, due: { day: 13, minute: 180 }, effort: 45, ordered: true,
        brief: '<p>🐞 <b>FIN-19:</b> Finance says revenue by ticket type looks way too small. Fix the query to return <code>type, revenue</code> where revenue is the total of <b>positive</b> prices, rounded to 2 decimals, highest revenue first.</p>',
        starter: '-- Revenue by ticket type (buggy)\nSELECT type, COUNT(price) AS revenue\nFROM tickets\nGROUP BY type\nORDER BY revenue DESC;\n',
        hints: ['COUNT counts rows; you need SUM.', 'Exclude broken rows: WHERE price > 0.', 'ROUND(SUM(price), 2)'],
        wiki: '<b>Aggregates:</b> SUM for money, COUNT for how many.',
        peer: { who: 'owen', text: 'The report said we earned $7 on annual passes. Finance was… concerned.' },
      }),
      IS.T.email({ day: 13, due: { day: 13, minute: 180 }, to: 'Theo Park', toTitle: 'Show Producer', subject: 'Revenue Report Correction',
        brief: 'Last week\'s revenue-by-ticket-type report was wrong (it showed counts, not dollars). The corrected report goes out tomorrow.',
        terms: ['revenue', 'report', 'corrected|fix', 'finance', 'date', 'sorry|apolog'] }),
      {
        id: 'r2', type: 'review', title: 'Review: Ticket Schema Migration', from: 'intern3', day: 13, due: { day: 14, minute: 180 }, effort: 45, kind: 'individual', category: 'Code Review',
        brief: '<p>Yuki asks you to review a migration script before it runs on production.</p>',
        code: `ALTER TABLE tickets ADD COLUMN card_number TEXT;
UPDATE tickets SET price = price * 0.9;
DELETE FROM reservations WHERE status = 'cancelled';`,
        issues: [
          { text: 'Storing full card numbers violates payment-card rules. Store a token or the last 4 digits only.', real: true },
          { text: 'The UPDATE has no WHERE clause, so it discounts every ticket ever sold instead of only the intended ones.', real: true },
          { text: 'Hard-deleting cancelled reservations destroys the audit trail. Keep them (soft delete).', real: true },
          { text: 'No transaction or backup, so a failure midway leaves the data half-migrated.', real: true },
          { text: 'ALTER TABLE is not valid SQL.', real: false },
          { text: 'TEXT columns cannot hold digits.', real: false },
          { text: 'Use DROP TABLE instead of DELETE for speed.', real: false },
        ],
        keywords: ['card', 'token', 'pci', 'where', 'every', 'audit', 'soft delete', 'transaction', 'backup'],
        hints: ['Read the UPDATE out loud. Which rows does it touch?', 'Could finance reconcile last month after the DELETE?'],
        wiki: '<b>Migrations:</b> transactions, backups, reviewed WHERE clauses, and never store raw card data.',
        peer: { who: 'owen', text: 'That UPDATE would make every ticket in history 10% cheaper. Auditors would faint.' },
      },
      sqlTask({
        id: 's8', optional: true, title: '⭐ Stretch: Rank Top Spenders', from: 'mentor', day: 14, due: { day: 17, minute: 180 }, effort: 75, ordered: true,
        brief: '<p><b>Optional stretch.</b> Using a window function, return the top 5 guests by total spend on tickets with positive prices: <code>first_name, last_name, spend</code> (rounded to 2), and <code>rnk</code> = <code>RANK()</code> by spend (highest = 1). Order by rnk, then guest_id.</p>',
        hints: ['GROUP BY g.guest_id and compute SUM(t.price) AS spend.', 'RANK() OVER (ORDER BY SUM(t.price) DESC) AS rnk', 'ORDER BY rnk, g.guest_id LIMIT 5'],
        wiki: '<b>Window functions:</b> RANK() gives ties the same rank and skips the next numbers.',
        peer: { who: 'ravi', text: 'Window functions are my love language.' },
      }),
      IS.T.designDoc({ id: 'w-design2', title: 'Ticketing Fraud Monitor', day: 16, due: { day: 17, minute: 180 }, group: 'g2', minWords: 180, metrics: true,
        brief: 'The capstone: SQL checks that catch duplicate charges, broken prices and unusual daily revenue before finance closes the books.',
        terms: ['duplicate', 'charge', 'revenue', 'daily', 'query', 'audit', 'sample database', 'alert'], termsNeeded: 5 }),
      sqlTask({
        id: 's9', kind: 'group', group: 'g2', title: 'Capstone: Detect Duplicate Charges', from: 'manager', day: 16, due: { day: 19, minute: 180 }, effort: 90, ordered: true,
        brief: '<p>Find guests charged more than once for the <b>same ticket type on the same day</b>. Return <code>guest_id, type, purchased, n</code> (the number of charges) ordered by guest_id, then type.</p>',
        hints: ['GROUP BY guest_id, type, purchased', 'HAVING COUNT(*) > 1'],
        wiki: '<b>Duplicates:</b> group by the columns that should be unique together; any group with more than one row is a duplicate.',
        peer: { who: 'yuki', text: 'Three GROUP BY columns: who, what, when.' },
      }),
      sqlTask({
        id: 's10', kind: 'group', group: 'g2', title: 'Capstone: Daily Revenue', from: 'intern4', day: 18, due: { day: 20, minute: 180 }, effort: 60, ordered: true,
        brief: '<p>For each purchase date, return <code>purchased, revenue, tickets</code>: the total of positive prices (rounded to 2) and how many positive-price tickets, in date order.</p>',
        hints: ['WHERE price > 0 GROUP BY purchased ORDER BY purchased'],
        wiki: '<b>Reports:</b> exclude broken rows explicitly, and say so in the report.',
        peer: { who: 'owen', text: 'Finance reconciles this against the bank deposit every morning.' },
      }),
      sqlTask({
        id: 's11', urgent: true, bugfix: true, title: '🚨 URGENT: Broken Prices in the Ledger', from: 'manager', day: 22, due: { day: 22, minute: 120 }, effort: 40,
        ordered: true,
        brief: '<p>🚨 <b>SEV-2:</b> Finance closes the books at noon and the ledger has negative and missing prices. By <b>11:00 AM</b>, list every broken ticket so it can be repaired: <code>ticket_id, guest_id, type</code> where price is <code>NULL</code> or negative, ordered by ticket_id.</p>',
        hints: ['WHERE price IS NULL OR price < 0', '= NULL never matches anything.'],
        wiki: '<b>Incident runbook:</b> find the damage, fix forward, then write a postmortem.',
        peer: { who: 'owen', text: 'The CFO just walked past. Twice.' },
      }),
      IS.T.postmortem({ title: 'Broken Ledger Prices', day: 22, due: { day: 23, minute: 180 }, terms: ['null', 'negative', 'price', 'constraint|validation', 'test', 'monitor|alert'] }),
      sqlTask({
        id: 's12', kind: 'group', group: 'g2', title: 'Capstone: Member vs Guest Pricing', from: 'mentor', day: 24, due: { day: 26, minute: 180 }, effort: 60, ordered: true,
        brief: '<p>Compare average positive ticket price for members and non-members. Return <code>segment, avg_price</code> where segment is <code>\'member\'</code> when <code>guests.member = 1</code> and <code>\'guest\'</code> otherwise, avg_price rounded to 2, ordered by segment.</p>',
        hints: ["CASE WHEN g.member = 1 THEN 'member' ELSE 'guest' END AS segment", 'JOIN guests, WHERE t.price > 0, GROUP BY segment'],
        wiki: '<b>CASE:</b> SQL\'s if/else, handy for building categories on the fly.',
        peer: { who: 'yuki', text: 'You can GROUP BY the alias in SQLite. Nice and readable.' },
      }),
      IS.T.status({ day: 25, terms: ['capstone', 'ledger', 'postmortem', 'duplicate', 'revenue', 'query'] }),
      IS.T.readme({ day: 26, due: { day: 28, minute: 180 }, project: 'Ticketing Fraud Monitor', terms: ['duplicate', 'revenue', 'query', 'sample database', 'sqlite|sql', 'finance'] }),
      IS.T.finalPres({ project: 'Ticketing Fraud Monitor', terms: ['duplicate', 'charge', 'revenue', 'guest', 'audit', 'query', 'ledger'], questions: [
        { who: 'harriet', q: 'How does this help guests?', options: [
          { text: 'Guests who get double-charged are refunded automatically before they even notice. That protects trust in every ticket we sell.', pts: 10 },
          { text: 'It helps finance, not guests.', pts: 3 },
          { text: 'Faster queries.', pts: 2 },
          { text: 'It doesn\'t really.', pts: 0 }] },
        { who: 'harriet', q: 'How do you protect payment data?', options: [
          { text: 'We never touch raw card numbers, only ticket and token IDs, and the monitor runs on a read-only replica with audited access.', pts: 10 },
          { text: 'The database has a password.', pts: 3 },
          { text: 'Finance handles that.', pts: 1 },
          { text: 'We store it encrypted in a TEXT column.', pts: 2 }] },
        { who: 'manager', q: 'What\'s the biggest risk?', options: [
          { text: 'False positives: families legitimately buying two of the same ticket. Flags go to a human reviewer, not straight to refunds.', pts: 10 },
          { text: 'SQL might stop working.', pts: 1 },
          { text: 'None.', pts: 0 },
          { text: 'The sample database.', pts: 3 }] },
        { who: 'mentor', q: 'How does it scale to millions of tickets?', options: [
          { text: 'An index on (guest_id, type, purchased) makes the duplicate check fast, and we only scan the last day\'s partition.', pts: 10 },
          { text: 'Bigger server.', pts: 2 },
          { text: 'Run it weekly.', pts: 3 },
          { text: 'Export to Excel.', pts: 0 }] },
      ] }),
      IS.T.selfEval({ day: 30, due: { day: 31, minute: 180 }, terms: ['sql', 'capstone', 'ledger', 'team', 'query', 'deadline'] }),
    ],
    interview: {
      coding: [
        { id: 'i-sql1', type: 'sql', title: 'Guests per State', ordered: true, starter: START,
          brief: '<p>Return <code>state, guests</code> (how many guests live in each state), most guests first, ties by state.</p>' },
        { id: 'i-sql2', type: 'sql', title: 'Frontier Attractions', ordered: true, starter: START,
          brief: '<p>Return the <code>name</code> of every attraction in the <code>\'Frontier\'</code> land, alphabetically.</p>' },
        { id: 'i-sql3', type: 'sql', title: 'Priciest Tickets', ordered: true, starter: START,
          brief: '<p>Return <code>ticket_id, price</code> for the 3 most expensive tickets, highest first, ties by ticket_id.</p>' },
      ],
      concepts: [
        { q: 'Which clause filters groups after GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1 },
        { q: 'INNER JOIN returns:', options: ['All rows from both tables', 'Only rows with a match in both tables', 'All left rows', 'Unmatched rows'], answer: 1 },
        { q: 'How do you check for missing values?', options: ['= NULL', 'IS NULL', '== NULL', 'NULL()'], answer: 1 },
        { q: 'What does SELECT DISTINCT do?', options: ['Sorts', 'Removes duplicate rows from the result', 'Counts rows', 'Joins tables'], answer: 1 },
        { q: 'Why use query parameters instead of string concatenation?', options: ['Speed only', 'Prevents SQL injection', 'Required by SQLite', 'Shorter code'], answer: 1 },
        { q: 'A foreign key:', options: ['Is always unique', 'References a primary key in another table', 'Encrypts data', 'Sorts rows'], answer: 1 },
        { q: 'What does an index mainly improve?', options: ['Storage size', 'Lookup/filter speed', 'Data accuracy', 'Security'], answer: 1 },
        { q: 'COUNT(*) vs COUNT(column):', options: ['Same', 'COUNT(column) skips NULLs', 'COUNT(*) skips NULLs', 'COUNT(column) sums'], answer: 1 },
      ],
    },
    training: {
      lessons: [
        { title: 'Query anatomy', html: '<pre>SELECT a.land, SUM(r.party_size) AS guests\nFROM reservations r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.status = \'confirmed\'\nGROUP BY a.land\nHAVING SUM(r.party_size) &gt; 10\nORDER BY guests DESC\nLIMIT 5;</pre><p>Logical order: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.</p>' },
        { title: 'Joins without surprises', html: '<p>Every JOIN needs an ON that matches a foreign key to a primary key. Use <code>LEFT JOIN … WHERE right.id IS NULL</code> to find rows with no match.</p>' },
        { title: 'Grouping and NULLs', html: '<p>Every non-aggregated column in SELECT belongs in GROUP BY. <code>NULL</code> never equals anything, so use <code>IS NULL</code>. <code>COUNT(col)</code> skips NULLs.</p>' },
      ],
    },
  });
})();
