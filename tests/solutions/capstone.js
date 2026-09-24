// Reference solutions for internship 10 (Full-Stack Capstone). Test suite only.
const page = (body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Park Pal</title>
</head>
<body>
${body}
</body>
</html>
`;

module.exports = {
  j1: `function parseWaitFeed(lines) {
  const out = {};
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length !== 2) continue;
    const id = parts[0].trim();
    const raw = parts[1].trim();
    const wait = Number(raw);
    if (!id || raw === '' || !Number.isFinite(wait) || wait < 0) continue;
    out[id] = wait;
  }
  return out;
}`,
  s1: `SELECT a.land, ROUND(AVG(r.stars), 2) AS avg_stars
FROM ratings r
JOIN attractions a ON a.attraction_id = r.attraction_id
GROUP BY a.land
ORDER BY avg_stars DESC, a.land;`,
  p1: `def busiest_hour(entries):
    if not entries:
        return None
    counts = {}
    for e in entries:
        h = int(e.split(":")[0])
        counts[h] = counts.get(h, 0) + 1
    return min(counts, key=lambda h: (-counts[h], h))`,
  w1: page(`  <main>
    <h2>Your Day</h2>
    <ol id="plan"></ol>
  </main>
  <script>
    const stops = [
      { time: '13:30', name: 'Pirate Lagoon' },
      { time: '10:00', name: 'Sky Tram' },
      { time: '11:15', name: 'Galaxy Coaster' },
    ];
    // Sort a copy by zero-padded time, then render with textContent.
    const plan = document.getElementById('plan');
    stops.slice().sort((a, b) => a.time.localeCompare(b.time)).forEach((s) => {
      const li = document.createElement('li');
      li.textContent = \`\${s.time} — \${s.name}\`;
      plan.appendChild(li);
    });
  </script>`),
  j2: `function planItinerary(rides, minutes) {
  const sorted = [...rides].sort((a, b) => (a.wait + a.duration) - (b.wait + b.duration) || a.name.localeCompare(b.name));
  const chosen = [];
  let used = 0;
  for (const r of sorted) {
    const cost = r.wait + r.duration;
    if (used + cost > minutes) break;
    used += cost;
    chosen.push(r.name);
  }
  return chosen;
}`,
  s2: `SELECT g.guest_id, g.first_name
FROM guests g
LEFT JOIN reservations r ON r.guest_id = g.guest_id
WHERE r.res_id IS NULL
ORDER BY g.guest_id;`,
  p2: `def dedupe_bookings(bookings):
    seen = set()
    out = []
    for b in bookings:
        key = tuple(b)
        if key not in seen:
            seen.add(key)
            out.append(b)
    return out`,
  j3: `function lruCache(capacity, ops) {
  const cache = new Map();
  const results = [];
  for (const [op, key, value] of ops) {
    if (op === 'get') {
      if (!cache.has(key)) {
        results.push(-1);
        continue;
      }
      const v = cache.get(key);
      cache.delete(key);
      cache.set(key, v);
      results.push(v);
    } else {
      cache.delete(key);
      cache.set(key, value);
      if (cache.size > capacity) cache.delete(cache.keys().next().value);
    }
  }
  return results;
}`,
  p3: `def recommend(ratings, guest, k):
    seen = ratings.get(guest, {})
    totals = {}
    for g, rides in ratings.items():
        if g == guest:
            continue
        for ride, stars in rides.items():
            if ride in seen:
                continue
            t = totals.setdefault(ride, [0, 0])
            t[0] += stars
            t[1] += 1
    ranked = sorted(totals, key=lambda r: (-totals[r][0] / totals[r][1], r))
    return ranked[:k]`,
  s3: `WITH avgs AS (
  SELECT a.land, a.name, AVG(r.stars) AS s
  FROM attractions a
  JOIN ratings r ON r.attraction_id = a.attraction_id
  GROUP BY a.attraction_id
), ranked AS (
  SELECT land, name, ROUND(s, 2) AS avg_stars,
         ROW_NUMBER() OVER (PARTITION BY land ORDER BY s DESC, name) AS rn
  FROM avgs
)
SELECT land, name, avg_stars FROM ranked WHERE rn = 1 ORDER BY land;`,
  w2: page(`  <main>
    <h2>Recommended for you</h2>
    <div id="chips"></div>
    <ul id="recs">
      <li data-land="Tomorrow">Galaxy Coaster</li>
      <li data-land="Adventure">Pirate Lagoon</li>
      <li data-land="Frontier">Haunted Manor</li>
      <li data-land="Tomorrow">Sky Tram</li>
    </ul>
  </main>
  <script>
    const lands = ['Tomorrow', 'Adventure', 'Frontier'];
    // One toggle button per land; clicking filters the list and updates aria-pressed.
    const box = document.getElementById('chips');
    const chips = lands.map((land) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = land;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        document.querySelectorAll('#recs li').forEach((li) => { li.hidden = li.dataset.land !== land; });
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      });
      box.appendChild(b);
      return b;
    });
  </script>`),
  t1: ["sed -i 's/DB_POOL_SIZE=0/DB_POOL_SIZE=10/' /srv/parkpal/.env", '/srv/parkpal/restart.sh', "grep -c 'pool exhausted' /var/log/parkpal/api.log"],
  'i-cap1': `function groupByLand(rides) {
  const out = {};
  for (const r of rides) (out[r.land] = out[r.land] || []).push(r.name);
  for (const land of Object.keys(out)) out[land].sort();
  return out;
}`,
  'i-cap2': `SELECT type, COUNT(*) AS sold
FROM tickets
GROUP BY type
ORDER BY sold DESC, type;`,
  'i-cap3': `def median_wait(waits):
    if not waits:
        return None
    s = sorted(waits)
    n = len(s)
    if n % 2:
        return s[n // 2]
    return (s[n // 2 - 1] + s[n // 2]) / 2`,
};
