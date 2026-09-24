// Reference solutions used only by the test suite (never loaded by the game).
module.exports = {
  c1: `function formatBadgeName(fullName) {
  const trimmed = fullName.trim();
  if (!trimmed) return '';
  return trimmed.split(/\\s+/).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}`,
  c2: `function averageWaitTime(waits) {
  const ok = waits.filter((w) => typeof w === 'number' && Number.isFinite(w) && w >= 0);
  if (!ok.length) return 0;
  return Math.round(ok.reduce((a, b) => a + b, 0) / ok.length * 10) / 10;
}`,
  c3: `function vehiclesNeeded(guests, seatsPerVehicle) {
  if (seatsPerVehicle <= 0) return -1;
  if (guests <= 0) return 0;
  return Math.ceil(guests / seatsPerVehicle);
}`,
  c4: `function sortAttractions(attractions) {
  return attractions.filter((a) => a.open)
    .sort((a, b) => a.wait - b.wait || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((a) => a.name);
}`,
  c5: `function removeSpikes(readings, maxJump) {
  const out = [];
  let last;
  for (const r of readings) {
    if (!out.length || Math.abs(r - last) <= maxJump) last = r;
    out.push(last);
  }
  return out;
}`,
  c6: `function findShowConflicts(shows) {
  const s = [...shows].sort((a, b) => a.start - b.start || (a.name < b.name ? -1 : 1));
  const out = [];
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j < s.length; j++)
      if (s[i].start < s[j].end && s[j].start < s[i].end) out.push([s[i].name, s[j].name]);
  return out;
}`,
  c7: `function cueToMs(cue) {
  const secs = cue.split(':').reduce((t, p) => t * 60 + Number(p), 0);
  return Math.round(secs * 1000);
}`,
  c8: `function shortestPath(map, start, goal) {
  if (!(start in map)) return [];
  if (start === goal) return [start];
  const prev = { [start]: null };
  const queue = [start];
  while (queue.length) {
    const node = queue.shift();
    for (const n of map[node] || []) {
      if (n in prev) continue;
      prev[n] = node;
      if (n === goal) {
        const path = [n];
        let cur = node;
        while (cur !== null) { path.push(cur); cur = prev[cur]; }
        return path.reverse();
      }
      queue.push(n);
    }
  }
  return [];
}`,
  c9: `function validateTicket(code) {
  if (!/^\\d{4}-\\d{4}-\\d{4}$/.test(code)) return false;
  const d = code.replace(/-/g, '');
  let sum = 0;
  for (let i = d.length - 1, dbl = false; i >= 0; i--, dbl = !dbl) {
    let n = Number(d[i]);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}`,
  c10: `function countErrors(lines) {
  const counts = {};
  for (const line of lines) {
    const m = line.match(/^(\\S+) \\[([A-Z]+)\\] ([^:]+): (.*)$/);
    if (m && m[2] === 'ERROR') counts[m[3]] = (counts[m[3]] || 0) + 1;
  }
  return counts;
}`,
  c11: `function hourlyThroughput(dispatches) {
  if (!dispatches.length) return [];
  const max = Math.max(...dispatches.map((d) => Math.floor(d.minute / 60)));
  const out = new Array(max + 1).fill(0);
  for (const d of dispatches) out[Math.floor(d.minute / 60)] += d.riders;
  return out;
}`,
  c12: `function estimateWait(queueLength, ridersPerHour) {
  if (!(ridersPerHour > 0)) return null;
  const q = Math.max(0, queueLength);
  return Math.ceil(q / ridersPerHour * 60 / 5) * 5;
}`,
  c13: `function servoStep(current, target, maxStep, minAngle, maxAngle) {
  const t = Math.min(maxAngle, Math.max(minAngle, target));
  const diff = t - current;
  if (Math.abs(diff) <= maxStep) return t;
  return current + Math.sign(diff) * maxStep;
}`,
  c14: `function rowsNeeded(partySizes, rowSize) {
  const free = [];
  let big = 0;
  for (const p of partySizes) {
    if (p <= 0) continue;
    if (p > rowSize) { big += Math.ceil(p / rowSize); continue; }
    const i = free.findIndex((f) => f >= p);
    if (i === -1) free.push(rowSize - p); else free[i] -= p;
  }
  return free.length + big;
}`,
  c15: `function bestNextRide(rides) {
  const open = rides.filter((r) => r.open);
  if (!open.length) return null;
  open.sort((a, b) => (a.wait + a.walk) - (b.wait + b.walk) || a.walk - b.walk || (a.name < b.name ? -1 : 1));
  return open[0].name;
}`,
  'i-js1': `function reverseWords(s) {
  const w = s.trim().split(/\\s+/).filter(Boolean);
  return w.reverse().join(' ');
}`,
  'i-js2': `function isPalindrome(s) {
  const c = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return c === [...c].reverse().join('');
}`,
  'i-js3': `function twoSum(nums, target) {
  const seen = new Map();
  for (let j = 0; j < nums.length; j++) {
    if (seen.has(target - nums[j])) return [seen.get(target - nums[j]), j];
    if (!seen.has(nums[j])) seen.set(nums[j], j);
  }
  return [];
}`,
};
