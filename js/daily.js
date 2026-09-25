// Daily tickets: a small graded technical ticket every workday (days 2–33),
// built from the Learning Center practice problems for this internship, with
// some review tickets from earlier internships' languages mixed in.
IS.daily = (function () {
  const U = IS.util;
  const cache = {};

  function poolFor(trackId) {
    return (IS.learnData[trackId] || []).reduce((list, topic) => list.concat(topic.practice
      .filter((p) => p.type !== 'choice')
      .map((p) => ({ p, topic, trackId }))), []);
  }

  function ticketFrom(x, day, track, rnd, review) {
    const p = x.p;
    const owner = IS.tracks.find((t) => t && t.id === x.trackId) || track;
    const people = track.cast.interns.concat([track.cast.mentor]);
    const from = U.pick(people, rnd);
    const peer = U.pick(track.cast.interns.filter((k) => k !== from), rnd);
    const kind = p.type || 'coding';
    const t = {
      id: 'dt' + day, daily: true, type: kind, lang: p.lang || owner.lang,
      title: (review ? 'Review ticket: ' : 'Daily ticket: ') + p.title,
      from, day, due: { day: Math.min(day + 1, U.LAST_DAY - 1), minute: U.DAY_LENGTH },
      effort: 10, kind: 'individual', category: 'Coding',
      brief: `<p class="small muted">Ticket DEV-${track.n}${String(day).padStart(2, '0')} · ${review ? `a warm-up in ${U.esc(owner.langLabel)} from an earlier internship` : 'small daily task'} · practices “${U.esc(x.topic.title)}”</p>` + p.brief,
      starter: p.starter, tests: p.tests, hidden: p.hidden, fnName: p.fnName, checks: p.checks, fs: p.fs, objectives: p.objectives, motd: p.motd,
      filename: p.filename, ordered: p.ordered,
      hints: [].concat(p.hint || 'Open the related Learning Center lesson for a walkthrough.'),
      wiki: `This ticket practices <b>${U.esc(x.topic.title)}</b>. ${U.esc(x.topic.summary)} Open that lesson in the Learning Center for a full explanation and a worked example.`,
      peer: { who: peer, text: 'I did one like this last week. Start from the example in the Learning Center lesson and change one piece at a time.' },
      learnRef: { trackId: x.trackId, topicId: x.topic.id },
    };
    if (kind === 'sql') {
      t.db = owner.db;
      t.sqlTrack = owner.id;
      t.expectedId = p.id;
    }
    return t;
  }

  // Deterministic per career seed and internship, so reloading keeps the same tickets.
  function forTrack(track, seed) {
    const key = track.id + ':' + seed;
    if (cache[key]) return cache[key];
    const rnd = U.seeded(seed * 7 + track.n * 131);
    const own = U.shuffle(poolFor(track.id), rnd);
    const earlier = U.shuffle(IS.tracks.filter((t) => t && t.n < track.n).reduce((a, t) => a.concat(poolFor(t.id)), []), rnd);
    const list = [];
    let oi = 0;
    let ei = 0;
    for (let day = 2; day <= U.LAST_DAY - 1; day++) {
      const review = earlier.length && day % 3 === 0;
      const x = review ? earlier[ei++ % earlier.length] : own[oi++ % own.length];
      if (x) list.push(ticketFrom(x, day, track, rnd, review));
    }
    cache[key] = list;
    return list;
  }

  return { forTrack, poolFor };
})();
