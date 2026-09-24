// Shared helpers. Everything hangs off the global IS namespace so the game
// runs straight from file:// without a bundler or ES modules.
window.IS = window.IS || {};

IS.util = (function () {
  const DAY_START_HOUR = 9;
  const DAY_LENGTH = 180; // 3 paid hours per day, in minutes
  const DAYS_PER_WEEK = 5;
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(n) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toFixed(2);
  }

  // minute 0..180 -> "9:00 AM"
  function clock(minute) {
    const total = DAY_START_HOUR * 60 + Math.round(minute);
    let h = Math.floor(total / 60);
    const m = total % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    return h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
  }

  function weekOf(day) {
    return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
  }

  function weekday(day) {
    return WEEKDAYS[(day - 1) % DAYS_PER_WEEK];
  }

  function isFriday(day) {
    return day % DAYS_PER_WEEK === 0;
  }

  // Absolute minute across the whole internship (only work time counts).
  function abs(day, minute) {
    return (day - 1) * DAY_LENGTH + minute;
  }

  function dueLabel(due) {
    return weekday(due.day) + ' (Day ' + due.day + ') ' + clock(due.minute);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Small deterministic PRNG so NPC scores are stable for a given save.
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

  function pick(arr, rnd) {
    return arr[Math.floor((rnd || Math.random)() * arr.length)];
  }

  function letter(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  }

  function gradeClass(score) {
    if (score >= 90) return 'g-a';
    if (score >= 80) return 'g-b';
    if (score >= 70) return 'g-c';
    return 'g-f';
  }

  function words(text) {
    return (String(text || '').toLowerCase().match(/[a-z0-9'’-]+/g) || []);
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function avg(list) {
    if (!list.length) return 0;
    return list.reduce((a, b) => a + b, 0) / list.length;
  }

  return {
    DAY_LENGTH, DAYS_PER_WEEK, esc, money, clock, weekOf, weekday, isFriday,
    abs, dueLabel, clamp, seeded, pick, letter, gradeClass, words, uid, avg,
  };
})();
