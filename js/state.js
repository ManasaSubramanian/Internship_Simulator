// Save data (one slot in localStorage + JSON export/import).
// Top level = the player's whole career; `job` = the internship in progress.
IS.state = (function () {
  const KEY = 'imagineer-intern-save-v2';
  let S = null;

  function fresh(player) {
    return {
      version: 2,
      seed: Math.floor(Math.random() * 1e9),
      player,
      equipped: { outfit: 'tee', hat: null, accessory: null },
      owned: ['tee'],
      desk: [],
      wallet: 150,
      rel: {},
      awards: [],
      scrapbook: [],
      lifetime: { earned: 0, hours: 0, interviews: 0 },
      career: { level: 0, phase: 'interview', returnOffer: false, history: [] },
      interview: null,
      job: null,
      pos: { x: 160, y: 620 },
      pendingCeremonies: [],
    };
  }

  function newJob(level, track) {
    return {
      level,
      trackId: track.id,
      day: 1,
      minute: 0,
      clockedIn: false,
      rate: track.rate,
      energy: 100,
      morale: 70,
      period: { days: [], deductions: [], bonuses: [] },
      paystubs: [],
      tasks: {},
      inbox: [],
      flags: {},
      groups: { g1: { health: 60, grade: null }, g2: { health: 60, grade: null } },
      stats: { helpAsked: 0, lateCount: 0, missedCount: 0, cafe: 0, networking: 0, earlyCount: 0, metNpc: {}, lateByWeek: {} },
      chattedToday: {},
      duckDay: 0,
      scenesDone: {},
      final: null,
    };
  }

  function save() {
    if (!S) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: play continues this session */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      S = JSON.parse(raw);
      return S;
    } catch (e) {
      return null;
    }
  }

  function hasSave() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    S = null;
  }

  function importJSON(text) {
    const data = JSON.parse(text);
    if (!data || data.version !== 2 || !data.player) throw new Error('Not a valid save file for this version');
    S = data;
    save();
    return S;
  }

  // The player's base look plus whatever they are wearing.
  function playerLook() {
    if (!S) return {};
    const look = Object.assign({}, S.player.look);
    ['outfit', 'hat', 'accessory'].forEach((slot) => {
      const it = S.equipped[slot] && IS.store.byId(S.equipped[slot]);
      if (it && it.wear) Object.assign(look, it.wear);
    });
    if (S.equipped.outfit === 'tee' || !S.equipped.outfit) look.topColor = S.player.look.topColor;
    if (!S.equipped.hat) look.hat = null;
    if (!S.equipped.accessory) look.accessory = null;
    return look;
  }

  return {
    get: () => S,
    job: () => (S ? S.job : null),
    newGame(player) {
      S = fresh(player);
      save();
      return S;
    },
    newJob,
    save, load, hasSave, clear, importJSON, playerLook,
    exportJSON: () => JSON.stringify(S, null, 2),
  };
})();
