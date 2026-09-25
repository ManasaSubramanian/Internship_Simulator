// Learning Center: SQL from zero (internship 6). Practice queries run on the
// same reservations & ticketing database as the internship.
IS.learnData = IS.learnData || {};
(function () {
  const START = '-- Write your query below\n';
  const q = (o) => Object.assign({ type: 'sql', ordered: true, starter: START }, o);
  IS.learnData.sql = [
    {
      id: 'select', icon: '🔍', title: 'Asking questions: SELECT, WHERE and ORDER BY',
      summary: 'Databases store data in tables. SQL is how you ask them questions.',
      tags: ['select', 'where', 'order by', 'from', 'filter', 'table', 'column'],
      words: `<p>A <b>database</b> stores information in <b>tables</b>, like spreadsheets. Each table has <b>columns</b> (fields, like <code>first_name</code> or <code>state</code>) and <b>rows</b> (one per record, like one guest).</p>
        <p><b>SQL</b> (often said "sequel") is the language for asking a database questions. A basic question has three parts:</p>
        <ul><li><code>SELECT</code> which columns you want to see,</li>
        <li><code>FROM</code> which table,</li>
        <li><code>WHERE</code> (optional) which rows to keep, using a condition.</li></ul>
        <p>Add <code>ORDER BY column</code> to sort the results (add <code>DESC</code> for largest first). You can sort by several columns: <code>ORDER BY last_name, first_name</code> sorts by last name, and breaks ties with first name.</p>
        <p>Text values go in <b>single quotes</b>: <code>WHERE state = 'FL'</code>. Numbers don\'t: <code>WHERE party_size &gt;= 4</code>. End each query with a semicolon <code>;</code>. Writing keywords in CAPITALS isn\'t required, but it makes queries easier to read.</p>
        <div class="analogy">📇 <b>Like asking a librarian:</b> "Show me <i>(SELECT)</i> the titles <i>(columns)</i> from the mystery shelf <i>(FROM)</i> that were written after 2000 <i>(WHERE)</i>, alphabetically <i>(ORDER BY)</i>."</div>`,
      terms: [['table', 'Rows and columns of data, like a spreadsheet.'], ['SELECT', 'Which columns to show.'], ['FROM', 'Which table.'], ['WHERE', 'Which rows to keep.'], ['ORDER BY … DESC', 'Sort; DESC = largest first.']],
      example: {
        lang: 'sql',
        intro: 'Find guests from Florida, sorted by name. (Open "Database tables" in the practice below to see every table.)',
        code: `SELECT first_name, last_name
FROM guests
WHERE state = 'FL'
ORDER BY last_name, first_name;`,
        steps: [
          { lines: [1], text: 'Show two columns: first and last name.' },
          { lines: [2], text: 'Look in the <code>guests</code> table.' },
          { lines: [3], text: 'Keep only rows where the <code>state</code> column equals the text <code>\'FL\'</code>.' },
          { lines: [4], text: 'Sort by last name, then first name for ties. The semicolon ends the query.' },
        ],
      },
      practice: [
        q({ id: 'L-sql-land', title: 'Rides in Tomorrow land',
          brief: '<p>Return the <code>name</code> of every attraction whose <code>land</code> is <code>\'Tomorrow\'</code>, sorted alphabetically.</p>',
          hint: 'SELECT name FROM attractions WHERE land = \'Tomorrow\' ORDER BY name;',
          solution: "-- Attractions in Tomorrow land\nSELECT name\nFROM attractions\nWHERE land = 'Tomorrow'\nORDER BY name;" }),
        q({ id: 'L-sql-members', title: 'Our members',
          brief: '<p>Return <code>first_name, last_name</code> of guests who are members (<code>member = 1</code>), sorted by last name, then first name.</p>',
          hint: 'Numbers don\'t need quotes: WHERE member = 1',
          solution: "-- Member guests\nSELECT first_name, last_name\nFROM guests\nWHERE member = 1\nORDER BY last_name, first_name;" }),
        q({ id: 'L-sql-parties', title: 'Big parties',
          brief: '<p>Return <code>res_id, party_size</code> for reservations with a party of <b>4 or more</b>, biggest parties first, ties by <code>res_id</code>.</p>',
          hint: 'WHERE party_size >= 4 ORDER BY party_size DESC, res_id',
          solution: "-- Reservations with 4+ people\nSELECT res_id, party_size\nFROM reservations\nWHERE party_size >= 4\nORDER BY party_size DESC, res_id;" }),
      ],
    },
    {
      id: 'aggregate', icon: '🧮', title: 'Counting and totals: COUNT, SUM, AVG and GROUP BY',
      summary: 'Squash many rows into summary numbers, for the whole table or for each group.',
      tags: ['count', 'sum', 'avg', 'group by', 'aggregate', 'total', 'average', 'per'],
      words: `<p>Often you don\'t want the rows themselves, you want a <b>summary</b>: how many guests? what\'s the average price? These are <b>aggregate functions</b>:</p>
        <ul><li><code>COUNT(*)</code> counts rows.</li>
        <li><code>SUM(column)</code> adds up a column. <code>AVG(column)</code> averages it.</li>
        <li><code>MIN(column)</code> / <code>MAX(column)</code> find the smallest / largest.</li>
        <li><code>ROUND(value, 2)</code> rounds to 2 decimals.</li></ul>
        <p>Give results friendly names with <code>AS</code>: <code>COUNT(*) AS guests</code>.</p>
        <p><code>GROUP BY column</code> makes one summary <b>per group</b> instead of one for the whole table. <code>SELECT type, COUNT(*) FROM tickets GROUP BY type</code> gives one row per ticket type with its count. Rule of thumb: every column in SELECT that isn\'t inside an aggregate function should be in GROUP BY.</p>
        <p>Missing values are <code>NULL</code> in SQL. <code>AVG</code> and <code>SUM</code> simply skip NULLs.</p>
        <div class="analogy">🗳️ <b>Like counting votes:</b> <code>COUNT(*)</code> is the total number of ballots; <code>GROUP BY candidate</code> sorts ballots into piles first and counts each pile.</div>`,
      terms: [['aggregate', 'A function that turns many rows into one value.'], ['AS', 'Names a result column.'], ['GROUP BY', 'One summary row per group.'], ['NULL', 'A missing value.']],
      example: {
        lang: 'sql',
        intro: 'Total confirmed guests per reservation date:',
        code: `SELECT res_date, SUM(party_size) AS guests
FROM reservations
WHERE status = 'confirmed'
GROUP BY res_date
ORDER BY res_date;`,
        steps: [
          { lines: [1], text: 'For each date, add up the party sizes and call the result <code>guests</code>.' },
          { lines: [3], text: 'WHERE runs <b>before</b> grouping: only confirmed reservations are counted.' },
          { lines: [4], text: 'Make one group per date.' },
          { lines: [5], text: 'Sort the summary rows by date.' },
        ],
      },
      practice: [
        q({ id: 'L-sql-count', title: 'How many guests?',
          brief: '<p>Return a single row with one column <code>guests</code>: the number of rows in the <code>guests</code> table.</p>',
          hint: 'SELECT COUNT(*) AS guests FROM guests;',
          solution: '-- Total number of guests\nSELECT COUNT(*) AS guests\nFROM guests;' }),
        q({ id: 'L-sql-status', title: 'Reservations by status',
          brief: '<p>Return <code>status, n</code>: how many reservations have each status. Most common first, ties by status.</p>',
          hint: 'GROUP BY status, then ORDER BY n DESC, status',
          solution: '-- Reservations per status\nSELECT status, COUNT(*) AS n\nFROM reservations\nGROUP BY status\nORDER BY n DESC, status;' }),
        q({ id: 'L-sql-avgprice', title: 'Average ticket price',
          brief: '<p>Return <code>type, avg_price</code>: the average ticket <code>price</code> per ticket type, rounded to 2 decimals. Ignore bad rows with a price that is not positive (<code>price &gt; 0</code>). Order by type.</p>',
          hint: 'WHERE price > 0 … GROUP BY type … ROUND(AVG(price), 2) AS avg_price',
          solution: '-- Average price per ticket type (valid prices only)\nSELECT type, ROUND(AVG(price), 2) AS avg_price\nFROM tickets\nWHERE price > 0\nGROUP BY type\nORDER BY type;' }),
      ],
    },
    {
      id: 'join', icon: '🔗', title: 'Combining tables with JOIN',
      summary: 'Link rows from two tables using the id they share.',
      tags: ['join', 'on', 'foreign key', 'primary key', 'combine', 'attraction'],
      words: `<p>Good databases avoid repeating information. A reservation doesn\'t store the ride\'s name, just its <code>attraction_id</code>. The name lives once, in the <code>attractions</code> table. This keeps data tidy, but it means answering "which ride is this reservation for?" needs two tables.</p>
        <p>Every row has a unique id called its <b>primary key</b> (like <code>attractions.attraction_id</code>). When another table stores that id (<code>reservations.attraction_id</code>), it\'s called a <b>foreign key</b>. It points at a row in the other table.</p>
        <p><code>JOIN</code> matches them up: <code>FROM reservations r JOIN attractions a ON a.attraction_id = r.attraction_id</code>. The short names <code>r</code> and <code>a</code> are <b>aliases</b>, nicknames so you can write <code>a.name</code> instead of <code>attractions.name</code>. The <code>ON</code> part says which columns must match. Forgetting it pairs every row with every other row: a classic mistake!</p>
        <div class="analogy">🎫 <b>Like a coat check:</b> your ticket only has a number. To find your coat, the attendant matches your number with the number on the hanger. That matching is a JOIN.</div>`,
      terms: [['primary key', 'A row\'s unique id.'], ['foreign key', 'A column holding another table\'s id.'], ['JOIN … ON', 'Combine rows where the ON condition matches.'], ['alias', 'A short nickname for a table: <code>reservations r</code>.']],
      example: {
        lang: 'sql',
        intro: 'Show each confirmed reservation with the ride name:',
        code: `SELECT r.res_id, a.name, r.party_size
FROM reservations r
JOIN attractions a ON a.attraction_id = r.attraction_id
WHERE r.status = 'confirmed'
ORDER BY r.res_id;`,
        steps: [
          { lines: [1], text: 'Columns can come from both tables: the reservation id and party size from <code>r</code>, the ride name from <code>a</code>.' },
          { lines: [2], text: 'Start from reservations, nicknamed <code>r</code>.' },
          { lines: [3], text: 'Attach the matching attraction row: its id must equal the reservation\'s attraction_id.' },
          { lines: [4, 5], text: 'Filter and sort as usual.' },
        ],
      },
      practice: [
        q({ id: 'L-sql-join1', title: 'Reservation → ride name',
          brief: '<p>Return <code>res_id, name</code> (the attraction name) for every <b>confirmed</b> reservation, ordered by <code>res_id</code>.</p>',
          hint: 'Copy the example and remove party_size.',
          solution: "-- Confirmed reservations with their ride\nSELECT r.res_id, a.name\nFROM reservations r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nWHERE r.status = 'confirmed'\nORDER BY r.res_id;" }),
        q({ id: 'L-sql-join2', title: 'Who bought which ticket?',
          brief: '<p>Return <code>first_name, type</code> for every ticket: the buyer\'s first name and the ticket type. Order by <code>ticket_id</code>.</p>',
          hint: 'FROM tickets t JOIN guests g ON g.guest_id = t.guest_id … ORDER BY t.ticket_id',
          solution: '-- Ticket buyers\nSELECT g.first_name, t.type\nFROM tickets t\nJOIN guests g ON g.guest_id = t.guest_id\nORDER BY t.ticket_id;' }),
        q({ id: 'L-sql-join3', title: 'Ratings by ride',
          brief: '<p>Return <code>name, avg_stars</code>: each attraction\'s average rating (<code>ratings.stars</code>), rounded to 1 decimal. Best first, ties by name. Only attractions with ratings.</p>',
          hint: 'JOIN ratings to attractions, then GROUP BY a.name with ROUND(AVG(r.stars), 1) AS avg_stars.',
          solution: '-- Average stars per attraction\nSELECT a.name, ROUND(AVG(r.stars), 1) AS avg_stars\nFROM ratings r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nGROUP BY a.name\nORDER BY avg_stars DESC, a.name;' }),
      ],
    },
    {
      id: 'having-limit', icon: '🏆', title: 'Top lists and filtering groups: LIMIT and HAVING',
      summary: 'Keep only the top N rows, and filter groups by their totals.',
      tags: ['limit', 'having', 'top', 'most', 'at least', 'group by'],
      words: `<p>Two small keywords answer a lot of business questions:</p>
        <ul><li><code>LIMIT n</code> keeps only the first n rows <b>after sorting</b>. "Top 3 biggest rides" = <code>ORDER BY capacity DESC LIMIT 3</code>. Always sort first, or "top" means nothing.</li>
        <li><code>HAVING condition</code> filters <b>groups</b>, after GROUP BY. "Guests with 2 or more tickets" = <code>GROUP BY guest_id HAVING COUNT(*) &gt;= 2</code>.</li></ul>
        <p>Why not use WHERE for the second one? Because <b>WHERE runs before grouping</b>, on single rows, when counts don\'t exist yet. HAVING runs after grouping, so it can use COUNT, SUM and AVG.</p>
        <p>The full order SQL follows: <code>FROM</code> → <code>JOIN</code> → <code>WHERE</code> → <code>GROUP BY</code> → <code>HAVING</code> → <code>SELECT</code> → <code>ORDER BY</code> → <code>LIMIT</code>.</p>
        <div class="analogy">🏅 <b>Like a race:</b> WHERE decides who\'s allowed to enter, GROUP BY puts runners into teams, HAVING keeps teams that scored enough points, ORDER BY ranks them, and LIMIT hands out the top 3 medals.</div>`,
      terms: [['LIMIT', 'Keep only the first n rows.'], ['HAVING', 'Filter groups (after GROUP BY).'], ['WHERE vs HAVING', 'WHERE filters rows before grouping; HAVING filters groups after.']],
      example: {
        lang: 'sql',
        intro: 'Which dates have more than 10 confirmed guests?',
        code: `SELECT res_date, SUM(party_size) AS guests
FROM reservations
WHERE status = 'confirmed'
GROUP BY res_date
HAVING SUM(party_size) > 10
ORDER BY guests DESC
LIMIT 2;`,
        steps: [
          { lines: [3], text: 'WHERE: throw away non-confirmed rows first.' },
          { lines: [4], text: 'Group the remaining rows by date.' },
          { lines: [5], text: 'HAVING: keep only the dates whose total is over 10.' },
          { lines: [6, 7], text: 'Sort the biggest first, and keep just the top 2.' },
        ],
      },
      practice: [
        q({ id: 'L-sql-top3', title: 'Top 3 by capacity',
          brief: '<p>Return <code>name, capacity</code> for the <b>3</b> attractions with the largest capacity, biggest first, ties by name.</p>',
          hint: 'ORDER BY capacity DESC, name LIMIT 3',
          solution: '-- Three biggest attractions\nSELECT name, capacity\nFROM attractions\nORDER BY capacity DESC, name\nLIMIT 3;' }),
        q({ id: 'L-sql-repeat', title: 'Repeat buyers',
          brief: '<p>Return <code>guest_id, tickets</code> for guests who bought <b>2 or more</b> tickets, most tickets first, ties by guest_id.</p>',
          hint: 'GROUP BY guest_id HAVING COUNT(*) >= 2',
          solution: '-- Guests with 2+ tickets\nSELECT guest_id, COUNT(*) AS tickets\nFROM tickets\nGROUP BY guest_id\nHAVING COUNT(*) >= 2\nORDER BY tickets DESC, guest_id;' }),
        q({ id: 'L-sql-lands', title: 'Well-reviewed lands',
          brief: '<p>Return <code>land, ratings</code>: the number of ratings per land, keeping only lands with <b>at least 5</b> ratings. Most ratings first, ties by land.</p>',
          hint: 'JOIN ratings to attractions, GROUP BY a.land, HAVING COUNT(*) >= 5.',
          solution: '-- Lands with 5+ ratings\nSELECT a.land, COUNT(*) AS ratings\nFROM ratings r\nJOIN attractions a ON a.attraction_id = r.attraction_id\nGROUP BY a.land\nHAVING COUNT(*) >= 5\nORDER BY ratings DESC, a.land;' }),
      ],
    },
  ];
})();
