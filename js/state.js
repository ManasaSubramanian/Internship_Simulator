// Save data: one slot in localStorage, plus JSON export/import.
IS.state = (function () {
  const KEY = 'imagineer-intern-save-v1';
  let S = null;

  function fresh(player) {
    return {
      version: 1,
      seed: Math.floor(Math.random() * 1e9),
      player: player,
      equipped: { outfit: 'tee', hat: null, accessory: null },
      owned: ['tee'],
      desk: [],
      day: 1,
      minute: 0,
      clockedIn: false,
      over: false,
      rate: 24,
      wallet: 100,
      energy: 100,
      morale: 70,
      period: { days: [], deductions: [], bonuses: [] },
      paystubs: [],
      tasks: {},
      rel: { maya: 50, dev: 55, rosa: 55, jordan: 50, sam: 50, priya: 50, tyler: 50, harriet: 40, gus: 50 },
      groups: { g1: { health: 60, grade: null }, g2: { health: 60, grade: null } },
      inbox: [],
      flags: {},
      awards: [],
      stats: { helpAsked: 0, lateCount: 0, missedCount: 0, cafe: 0, networking: 0, earlyCount: 0, metNpc: {}, lateByWeek: {} },
      scrapbook: [{ day: 1, text: 'First day as an Imagineering intern!' }],
      chattedToday: {},
      duckDay: 0,
      pendingCeremonies: [],
      final: null,
    };
  }

  function save() {
    if (!S) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      /* storage may be unavailable (private mode); the game still works this session */
    }
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
    try {
      return !!localStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) { /* ignore */ }
    S = null;
  }

  function importJSON(text) {
    const data = JSON.parse(text);
    if (!data || data.version !== 1 || !data.player) throw new Error('Not a valid save file');
    S = data;
    save();
    return S;
  }

  function playerAvatar() {
    if (!S) return {};
    return Object.assign({}, S.player.avatar, S.equipped);
  }

  return {
    get: () => S,
    newGame(player) {
      S = fresh(player);
      save();
      return S;
    },
    save, load, hasSave, clear, importJSON, playerAvatar,
    exportJSON: () => JSON.stringify(S, null, 2),
  };
})();
