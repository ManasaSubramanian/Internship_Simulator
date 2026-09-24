// Shared helpers. Everything hangs off the global IS namespace so the game
// runs straight from file:// without a bundler or ES modules.
window.IS = window.IS || {};

IS.util = (function () {
  const DAY_START_HOUR = 9;
  const DAY_LENGTH = 180; // a normal workday: 3 paid hours
  const LAST_DAY = 34; // 33 full days + a 1-hour final day = 100 hours
  const LAST_DAY_LENGTH = 60;
  const DAYS_PER_WEEK = 5;
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(n) {
    return (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2);
  }

  function clock(minute) {
    const total = DAY_START_HOUR * 60 + Math.round(minute);
    let h = Math.floor(total / 60);
    const m = total % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    return h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
  }

  const dayLen = (day) => (day === LAST_DAY ? LAST_DAY_LENGTH : DAY_LENGTH);
  const weekOf = (day) => Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
  const weekday = (day) => WEEKDAYS[(day - 1) % DAYS_PER_WEEK];
  const isFriday = (day) => day % DAYS_PER_WEEK === 0;
  // Absolute work-minute across the internship. Only the last day is shorter,
  // so every earlier day starts at (day - 1) * 180.
  const abs = (day, minute) => (day - 1) * DAY_LENGTH + minute;
  const dueLabel = (due) => weekday(due.day) + ' (Day ' + due.day + ') ' + clock(due.minute);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (arr, rnd) => arr[Math.floor((rnd || Math.random)() * arr.length)];

  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rnd || Math.random)() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function letter(score) {
    const cut = [[97, 'A+'], [93, 'A'], [90, 'A-'], [87, 'B+'], [83, 'B'], [80, 'B-'], [77, 'C+'], [73, 'C'], [70, 'C-'], [60, 'D']];
    for (const [c, l] of cut) if (score >= c) return l;
    return 'F';
  }

  const gradeClass = (s) => (s >= 90 ? 'g-a' : s >= 80 ? 'g-b' : s >= 70 ? 'g-c' : 'g-f');
  const words = (text) => String(text || '').toLowerCase().match(/[a-z0-9'’-]+/g) || [];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);

  return {
    DAY_LENGTH, LAST_DAY, LAST_DAY_LENGTH, DAYS_PER_WEEK, esc, money, clock, dayLen, weekOf, weekday, isFriday,
    abs, dueLabel, clamp, seeded, pick, shuffle, letter, gradeClass, words, uid, avg,
  };
})();
