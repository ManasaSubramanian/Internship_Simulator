// The walkable studio floor. A wide 2.5D side-scrolling office: the player
// walks (click-to-walk or WASD/arrows) between the lobby, café, open office,
// IT desk, manager's office, conference room and the track's lab.
// Everything interactive is a "hotspot" (people or objects).
IS.office = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const WORLD_W = 3700;
  const WORLD_H = 760;
  const Y_MIN = 505;
  const Y_MAX = 735;
  const SPEED = 320;

  let root = null;
  let world = null;
  let raf = 0;
  let last = 0;
  let scale = 1;
  let camX = 0;
  let offsetY = 0;
  const keys = {};
  const P = { x: 160, y: 640, tx: null, ty: null, onArrive: null, walking: false, el: null, look: '' };
  let npcs = [];
  let hots = [];
  let promptEl = null;
  let nearest = null;
  let paused = false;

  const depth = (y) => 0.84 + 0.2 * U.clamp((y - Y_MIN) / (Y_MAX - Y_MIN), 0, 1);

  // ── Props (inline SVG, drawn in world units) ─────────────
  const code = (w) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${8 + (i % 3) * 6}" y="${8 + i * 7}" width="${20 + ((i * 37) % (w - 40))}" height="3" rx="1.5" fill="${['#9cc28a', '#f0c060', '#e8977a', '#e8d8bf'][i % 4]}" opacity=".85"/>`).join('');
  const P_ = {
    desk(opts) {
      const items = (opts.items || []).map((e, i) => `<text x="${140 + (i % 3) * 16}" y="${68 - Math.floor(i / 3) * 16}" font-size="15">${e}</text>`).join('');
      return `<svg width="200" height="170" viewBox="0 0 200 170">
        <rect x="70" y="-10" width="60" height="30" rx="8" fill="${opts.chair || '#3a2a20'}"/>
        <rect x="46" y="4" width="98" height="62" rx="5" fill="#1b1512"/><rect x="51" y="9" width="88" height="50" rx="2" fill="#2a211b"/>
        <g transform="translate(51 9)">${code(80)}</g>
        <rect x="88" y="66" width="14" height="8" fill="#2b2622"/>
        <rect x="0" y="74" width="200" height="10" rx="3" fill="#c79a6b"/><rect x="8" y="84" width="184" height="80" rx="3" fill="#a87a4f"/>
        <rect x="16" y="94" width="80" height="60" rx="3" fill="#946a43"/><rect x="104" y="94" width="80" height="60" rx="3" fill="#946a43"/>
        <circle cx="90" cy="124" r="3" fill="#d99a2b"/><circle cx="110" cy="124" r="3" fill="#d99a2b"/>
        <rect x="58" y="68" width="70" height="7" rx="2" fill="#3a2a20"/>
        <rect x="18" y="58" width="12" height="15" rx="3" fill="${opts.mug || '#f3ece0'}"/><path d="M30 62 q6 2 0 8" stroke="${opts.mug || '#f3ece0'}" stroke-width="2" fill="none"/>
        ${items}
        ${opts.name ? `<rect x="60" y="138" width="80" height="18" rx="4" fill="#2a211b"/><text x="100" y="151" text-anchor="middle" font-size="11" font-weight="800" fill="#f0c060" font-family="Nunito,sans-serif">${opts.name}</text>` : ''}
      </svg>`;
    },
    podium() {
      return `<svg width="230" height="150" viewBox="0 0 230 150">
        <rect x="0" y="40" width="120" height="12" rx="4" fill="#c79a6b"/><rect x="6" y="52" width="108" height="96" rx="4" fill="#8e6243"/>
        <rect x="18" y="66" width="84" height="24" rx="4" fill="#6b4a33"/><text x="60" y="83" text-anchor="middle" font-size="12" font-weight="900" fill="#f0c060" font-family="Nunito,sans-serif">SECURITY</text>
        <rect x="140" y="30" width="16" height="118" rx="6" fill="#8a7d70"/><rect x="200" y="30" width="16" height="118" rx="6" fill="#8a7d70"/>
        <rect x="146" y="70" width="64" height="8" rx="4" fill="#c2593f"/><circle cx="148" cy="44" r="5" fill="#6f8f5e"/>
      </svg>`;
    },
    reception() {
      return `<svg width="260" height="140" viewBox="0 0 260 140">
        <path d="M0 30 Q130 10 260 30 L260 42 Q130 22 0 42 Z" fill="#d8b98f"/>
        <path d="M6 42 Q130 24 254 42 L250 140 L10 140 Z" fill="#8e6243"/>
        <text x="130" y="96" text-anchor="middle" font-size="26" fill="#f0c060" font-family="Georgia,serif">✦ Studio ✦</text>
        <rect x="200" y="6" width="34" height="22" rx="3" fill="#2a211b"/><circle cx="40" cy="20" r="9" fill="#6f8f5e"/><rect x="36" y="20" width="8" height="12" fill="#c2593f"/>
      </svg>`;
    },
    counter() {
      return `<svg width="300" height="150" viewBox="0 0 300 150">
        <rect x="18" y="-6" width="56" height="50" rx="6" fill="#8a7d70"/><rect x="24" y="4" width="44" height="12" rx="3" fill="#2b2622"/>
        <rect x="34" y="28" width="6" height="12" fill="#2b2622"/><rect x="52" y="28" width="6" height="12" fill="#2b2622"/>
        <rect x="170" y="0" width="110" height="44" rx="6" fill="rgba(255,240,215,.55)"/><rect x="170" y="0" width="110" height="44" rx="6" fill="none" stroke="#6b4a33" stroke-width="3"/>
        <circle cx="192" cy="30" r="9" fill="#d99a2b"/><circle cx="214" cy="32" r="8" fill="#c2593f"/><rect x="232" y="24" width="22" height="12" rx="4" fill="#e3c08a"/><circle cx="264" cy="30" r="8" fill="#a8452d"/>
        <rect x="0" y="44" width="300" height="12" rx="4" fill="#d8b98f"/><rect x="6" y="56" width="288" height="92" rx="4" fill="#6b4a33"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${16 + i * 47}" y="66" width="38" height="72" rx="3" fill="#7a5539"/>`).join('')}
        <rect x="100" y="30" width="12" height="14" rx="3" fill="#f3ece0"/><rect x="118" y="30" width="12" height="14" rx="3" fill="#f3ece0"/>
      </svg>`;
    },
    menuboard() {
      return `<svg width="230" height="150" viewBox="0 0 230 150"><rect width="230" height="150" rx="8" fill="#5a3e2b"/><rect x="8" y="8" width="214" height="134" rx="4" fill="#2f352b"/>
        <text x="115" y="34" text-anchor="middle" font-size="18" fill="#f0c060" font-family="Georgia,serif">Studio Café</text>
        ${['Drip Coffee ........ 3', 'Cold Brew ........... 5', 'Caramel Latte ...... 6', 'Churro .............. 5', 'Soft Pretzel ....... 7'].map((l, i) => `<text x="22" y="${58 + i * 17}" font-size="11.5" fill="#e8d8bf" font-family="monospace">${l}</text>`).join('')}</svg>`;
    },
    cafetable() {
      return `<svg width="170" height="120" viewBox="0 0 170 120"><rect x="10" y="30" width="30" height="8" rx="3" fill="#6b4a33"/><rect x="14" y="38" width="4" height="70" fill="#4a3325"/><rect x="34" y="38" width="4" height="70" fill="#4a3325"/><rect x="12" y="-4" width="26" height="36" rx="5" fill="#8e6243"/>
        <rect x="130" y="30" width="30" height="8" rx="3" fill="#6b4a33"/><rect x="134" y="38" width="4" height="70" fill="#4a3325"/><rect x="154" y="38" width="4" height="70" fill="#4a3325"/><rect x="132" y="-4" width="26" height="36" rx="5" fill="#8e6243"/>
        <ellipse cx="85" cy="44" rx="56" ry="12" fill="#d8b98f"/><rect x="80" y="48" width="10" height="60" fill="#5a3e2b"/><ellipse cx="85" cy="110" rx="26" ry="6" fill="#4a3325"/>
        <rect x="66" y="30" width="10" height="12" rx="3" fill="#f3ece0"/><rect x="94" y="32" width="14" height="8" rx="3" fill="#e3c08a"/></svg>`;
    },
    kiosk() {
      return `<svg width="190" height="230" viewBox="0 0 190 230"><rect x="0" y="0" width="190" height="34" rx="6" fill="#c2593f"/><text x="95" y="23" text-anchor="middle" font-size="15" font-weight="900" fill="#fff8ef" font-family="Nunito,sans-serif">STUDIO STORE</text>
        <rect x="6" y="34" width="178" height="194" fill="#8e6243"/>
        ${[0, 1, 2].map((r) => `<rect x="12" y="${86 + r * 48}" width="166" height="6" fill="#6b4a33"/>`).join('')}
        ${['#3e6b48', '#c2593f', '#d99a2b', '#8e2b45', '#f3ece0', '#6f8f5e'].map((c, i) => `<rect x="${18 + i * 27}" y="62" width="22" height="22" rx="3" fill="${c}"/>`).join('')}
        ${['#a8412a', '#3e6b48', '#1d1612', '#e0a526'].map((c, i) => `<path d="M${22 + i * 40} 132 q14 -20 28 0 z" fill="${c}"/>`).join('')}
        <text x="30" y="178" font-size="22">🏰</text><text x="70" y="178" font-size="22">🦆</text><text x="110" y="178" font-size="22">⌨️</text><text x="146" y="178" font-size="22">🪴</text>
        <rect x="40" y="196" width="110" height="26" rx="4" fill="#6b4a33"/></svg>`;
    },
    plant(big) {
      const h = big ? 150 : 100;
      return `<svg width="90" height="${h}" viewBox="0 0 90 ${h}"><path d="M25 ${h - 42} L65 ${h - 42} L60 ${h} L30 ${h} Z" fill="#c2593f"/><rect x="22" y="${h - 46}" width="46" height="8" rx="3" fill="#a8452d"/>
        ${[[45, h - 100, 14, 44, -10], [30, h - 80, 10, 34, -30], [60, h - 82, 10, 34, 30], [45, h - 75, 9, 30, 0], [22, h - 62, 9, 24, -50], [68, h - 62, 9, 24, 50]].map(([x, y, rx, ry, r]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${r % 20 ? '#4f7a45' : '#3e6b48'}" transform="rotate(${r} ${x} ${y + ry})"/>`).join('')}</svg>`;
    },
    shelf() {
      const books = (y) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${10 + i * 15}" y="${y - (20 + (i * 7) % 12)}" width="12" height="${20 + (i * 7) % 12}" fill="${['#c2593f', '#d99a2b', '#3e6b48', '#8e2b45', '#6f8f5e', '#f3ece0', '#5a3e2b', '#a8452d'][i]}"/>`).join('');
      return `<svg width="140" height="200" viewBox="0 0 140 200"><rect width="140" height="200" rx="4" fill="#6b4a33"/>${[60, 120, 180].map((y) => `<rect x="4" y="${y}" width="132" height="6" fill="#4a3325"/>${books(y)}`).join('')}</svg>`;
    },
    mgrdesk() {
      return `<svg width="230" height="150" viewBox="0 0 230 150"><rect x="80" y="-6" width="70" height="40" rx="10" fill="#5a2e1e"/>
        <rect x="120" y="18" width="70" height="46" rx="4" fill="#1b1512"/><rect x="124" y="22" width="62" height="38" fill="#2a211b"/><g transform="translate(124 22)">${code(56)}</g>
        <rect x="0" y="64" width="230" height="12" rx="3" fill="#b8865a"/><rect x="10" y="76" width="210" height="72" rx="3" fill="#7a5236"/>
        <rect x="24" y="50" width="30" height="16" rx="2" fill="#f3ece0"/><text x="70" y="62" font-size="16">🏆</text></svg>`;
    },
    helpdesk() {
      return `<svg width="190" height="130" viewBox="0 0 190 130"><rect x="30" y="0" width="60" height="40" rx="4" fill="#1b1512"/><rect x="34" y="4" width="52" height="30" fill="#2f352b"/><text x="60" y="24" text-anchor="middle" font-size="10" fill="#9cc28a" font-family="monospace">ping ok</text>
        <rect x="0" y="40" width="190" height="10" rx="3" fill="#c79a6b"/><rect x="6" y="50" width="178" height="78" rx="3" fill="#8e6243"/>
        <rect x="40" y="70" width="110" height="26" rx="4" fill="#6b4a33"/><text x="95" y="88" text-anchor="middle" font-size="12" font-weight="900" fill="#f0c060" font-family="Nunito,sans-serif">IT HELP DESK</text>
        <rect x="120" y="26" width="30" height="14" rx="2" fill="#5a4636"/><text x="150" y="36" font-size="14">🔌</text></svg>`;
    },
    conftable() {
      const chair = (x) => `<rect x="${x}" y="0" width="34" height="46" rx="8" fill="#5a2e1e"/>`;
      return `<svg width="420" height="130" viewBox="0 0 420 130">${[40, 120, 200, 280, 350].map(chair).join('')}
        <ellipse cx="210" cy="56" rx="206" ry="22" fill="#b8865a"/><path d="M4 56 Q210 98 416 56 L416 64 Q210 108 4 64 Z" fill="#7a5236"/>
        <rect x="90" y="64" width="12" height="62" fill="#4a3325"/><rect x="318" y="64" width="12" height="62" fill="#4a3325"/>
        <rect x="170" y="42" width="40" height="10" rx="2" fill="#2b2622"/><rect x="240" y="44" width="12" height="10" rx="2" fill="#f3ece0"/></svg>`;
    },
    lab(kind) {
      switch (kind) {
        case 'robot': return `<svg width="320" height="230" viewBox="0 0 320 230"><rect x="0" y="150" width="320" height="12" fill="#8a7d70"/><rect x="10" y="162" width="300" height="66" fill="#5a4636"/>
          <rect x="120" y="120" width="60" height="30" rx="6" fill="#6b5a4a"/><path d="M150 120 L190 60 L250 40" stroke="#c98e1c" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="190" cy="60" r="12" fill="#8a7d70"/><circle cx="250" cy="40" r="10" fill="#8a7d70"/>
          <path d="M250 40 l24 -8 m-24 8 l22 12" stroke="#5a4636" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="126" r="22" fill="#f3d9b8"/><circle cx="52" cy="122" r="4" fill="#2a211b"/><circle cx="68" cy="122" r="4" fill="#2a211b"/><rect x="40" y="146" width="40" height="6" fill="#8a7d70"/></svg>`;
        case 'servers': return `<svg width="320" height="250" viewBox="0 0 320 250">${[0, 1, 2].map((r) => `<rect x="${10 + r * 102}" y="0" width="92" height="248" rx="6" fill="#2b2622"/>` +
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${18 + r * 102}" y="${12 + i * 26}" width="76" height="18" rx="2" fill="#3a2f28"/><circle cx="${26 + r * 102}" cy="${21 + i * 26}" r="3" fill="${(i + r) % 3 ? '#9cc28a' : '#f0c060'}"><animate attributeName="opacity" values="1;.3;1" dur="${1 + ((i + r) % 4) * 0.4}s" repeatCount="indefinite"/></circle>`).join('')).join('')}</svg>`;
        case 'data': return `<svg width="320" height="220" viewBox="0 0 320 220"><rect width="320" height="190" rx="8" fill="#2a211b"/>
          ${[40, 90, 60, 130, 110, 150, 100].map((h, i) => `<rect x="${24 + i * 40}" y="${170 - h}" width="26" height="${h}" rx="3" fill="${i % 2 ? '#d99a2b' : '#c2593f'}"/>`).join('')}
          <polyline points="30,110 70,80 110,95 150,50 190,60 230,35 280,45" stroke="#9cc28a" stroke-width="3" fill="none"/><rect x="140" y="190" width="40" height="30" fill="#5a4636"/></svg>`;
        case 'web': return `<svg width="320" height="220" viewBox="0 0 320 220"><rect x="0" y="40" width="320" height="14" fill="#8e6243"/><rect x="10" y="54" width="300" height="160" fill="#6b4a33"/>
          ${[[20, 0, 50, 40], [84, -10, 34, 50], [132, 4, 70, 36], [216, -6, 34, 46], [262, 6, 44, 34]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#1b1512"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="3" fill="#f3e9da"/><rect x="${x + 6}" y="${y + 7}" width="${w - 14}" height="5" fill="#c2593f"/><rect x="${x + 6}" y="${y + 16}" width="${(w - 14) / 1.5}" height="4" fill="#d99a2b"/>`).join('')}</svg>`;
        case 'db': return `<svg width="320" height="220" viewBox="0 0 320 220">${[40, 150, 260].map((x) => `<g><rect x="${x - 40}" y="40" width="80" height="170" fill="#8a7d70"/><ellipse cx="${x}" cy="40" rx="40" ry="14" fill="#a39584"/><ellipse cx="${x}" cy="210" rx="40" ry="14" fill="#6b5a4a"/>${[80, 120, 160].map((y) => `<path d="M${x - 40} ${y} q40 14 80 0" stroke="#6b5a4a" stroke-width="3" fill="none"/>`).join('')}<circle cx="${x + 24}" cy="70" r="4" fill="#9cc28a"/></g>`).join('')}</svg>`;
        case 'ml': return `<svg width="320" height="230" viewBox="0 0 320 230"><rect x="0" y="0" width="150" height="220" rx="6" fill="#2b2622"/>${[0, 1, 2, 3].map((i) => `<rect x="12" y="${14 + i * 50}" width="126" height="38" rx="4" fill="#3a2f28"/><rect x="20" y="${22 + i * 50}" width="80" height="6" fill="#c2593f"/><circle cx="124" cy="${33 + i * 50}" r="5" fill="#f0c060"/>`).join('')}
          <rect x="170" y="10" width="150" height="120" rx="6" fill="#f3e9da"/>${[[190, 100], [210, 80], [228, 90], [246, 60], [262, 64], [280, 40], [298, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#c2593f"/>`).join('')}<line x1="182" y1="104" x2="306" y2="36" stroke="#3e6b48" stroke-width="3"/></svg>`;
        case 'maker': return `<svg width="320" height="220" viewBox="0 0 320 220"><rect x="0" y="120" width="320" height="12" fill="#b8865a"/><rect x="8" y="132" width="304" height="86" fill="#7a5236"/>
          <rect x="30" y="30" width="100" height="90" rx="6" fill="#2b2622"/><rect x="40" y="40" width="80" height="60" fill="#3a2f28"/><rect x="70" y="80" width="20" height="16" fill="#d99a2b"/><rect x="60" y="54" width="40" height="6" fill="#8a7d70"/>
          <text x="160" y="110" font-size="30">🔧</text><text x="210" y="112" font-size="30">📐</text><text x="260" y="110" font-size="30">🧩</text></svg>`;
        default: return `<svg width="340" height="200" viewBox="0 0 340 200"><path d="M0 180 L340 180" stroke="#6b5a4a" stroke-width="10"/><path d="M0 194 L340 194" stroke="#6b5a4a" stroke-width="6"/>
          ${[20, 70, 120, 170, 220, 270, 320].map((x) => `<rect x="${x}" y="178" width="10" height="20" fill="#4a3325"/>`).join('')}
          <path d="M60 170 Q60 90 140 80 L240 80 Q300 84 300 150 L300 170 Z" fill="#c2593f"/><path d="M90 150 Q92 104 150 100 L230 100 Q270 104 272 150 Z" fill="#7a2e1e"/>
          <rect x="120" y="96" width="30" height="40" rx="6" fill="#2b2622"/><rect x="186" y="96" width="30" height="40" rx="6" fill="#2b2622"/><path d="M110 110 L160 110 M176 110 L226 110" stroke="#f0c060" stroke-width="5"/>
          <circle cx="100" cy="176" r="14" fill="#2b2622"/><circle cx="260" cy="176" r="14" fill="#2b2622"/><text x="170" y="164" text-anchor="middle" font-size="14" font-weight="900" fill="#f0c060" font-family="Nunito,sans-serif">TEST VEHICLE</text></svg>`;
      }
    },
  };

  // ── Layout ───────────────────────────────────────────────
  function layout() {
    const t = E().track();
    const c = t.cast;
    return {
      people: [
        { id: 'marcus', x: 300, y: 548 },
        { id: 'rosa', x: 500, y: 540 },
        { id: 'gus', x: 900, y: 532 },
        { id: c.interns[2], x: 1080, y: 690, idle: true },
        { id: 'ava', x: 1400, y: 700, wander: [760, 1900] },
        { id: c.interns[0], x: 1660, y: 580 },
        { id: c.interns[1], x: 1900, y: 580 },
        { id: c.mentor, x: 2150, y: 580 },
        { id: 'lena', x: 2440, y: 540 },
        { id: c.manager, x: 2780, y: 545 },
        { id: 'theo', x: 2000, y: 700, wander: [1150, 3300] },
        { id: c.interns[3], x: 3460, y: 610 },
      ].concat(E().track().n >= 1 && st().job && st().job.day >= 26 ? [{ id: 'harriet', x: 3180, y: 660 }] : []),
      hotspots: [
        { id: 'door', x: 110, y: 600, label: '🚪 Exit / go home' },
        { id: 'trophies', x: 395, y: 560, label: '🏆 Trophy wall' },
        { id: 'store', x: 680, y: 600, label: '🛍️ Studio Store' },
        { id: 'desk', x: 1395, y: 640, label: '💻 Use your computer' },
        { id: 'conference', x: 3080, y: 700, label: '🗣️ Conference room' },
      ],
    };
  }

  function buildWorld() {
    const t = E().track();
    const s = st();
    const j = s.job;
    const L = layout();
    const prop = (x, y, html, cls, hot) => `<div class="prop ${cls || ''}" ${hot ? `data-hot="${hot}"` : ''} style="left:${x}px;top:${y}px;z-index:${Math.round(y)}">${html}</div>`;
    const wall = (x, y, html, id) => `<div class="wall-item" ${id ? `id="${id}"` : ''} style="left:${x}px;top:${y}px">${html}</div>`;
    const deskItems = s.desk.map((id) => IS.store.byId(id).emoji);
    let h = '<div class="wall"></div><div class="wainscot"></div><div class="baseboard"></div><div class="floor"></div>';
    // zone floors & rugs
    h += `<div class="zone-floor" style="left:0;width:600px;background:repeating-linear-gradient(45deg, rgba(0,0,0,.05) 0 20px, rgba(255,255,255,.04) 20px 40px), #c9a57a"></div>`;
    h += `<div class="zone-floor" style="left:2600px;width:420px;background:#9a5a3e"></div>`;
    h += `<div class="rug" style="left:3050px;top:600px;width:520px;height:120px;background:#8e2b45;opacity:.55"></div>`;
    h += `<div class="rug" style="left:820px;top:640px;width:380px;height:100px;background:#d99a2b;opacity:.35"></div>`;
    // back wall details
    h += `<div class="door" style="left:55px"></div>`;
    h += wall(190, 110, `<div class="sign" style="position:relative;top:0">Imagination Studios<small>Lobby · Please badge in</small></div>`);
    h += wall(330, 170, `<svg width="160" height="210" viewBox="0 0 160 210"><rect width="160" height="210" rx="8" fill="#6b4a33"/>${[60, 120, 180].map((y) => `<rect x="8" y="${y}" width="144" height="8" fill="#4a3325"/>`).join('')}<text x="80" y="30" text-anchor="middle" font-size="13" font-weight="900" fill="#f0c060" font-family="Nunito,sans-serif">HALL OF FAME</text></svg><div id="trophy-shelf" style="position:absolute;left:10px;top:40px;width:140px;display:flex;flex-wrap:wrap;gap:2px 6px;font-size:26px;line-height:58px"></div>`, 'trophy-wall');
    h += `<div class="window" style="left:720px"><div class="sun"></div><div class="hills"></div><div class="spire"></div></div>`;
    h += wall(960, 120, P_.menuboard());
    h += `<div class="window" style="left:1230px"><div class="sun" style="left:30px"></div><div class="hills"></div></div>`;
    h += wall(1520, 105, `<div class="sign" style="position:relative;top:0">${U.esc(t.team)}<small>Internship ${t.n} · ${U.esc(t.langLabel)}</small></div>`);
    h += `<div class="wall-clock" id="wall-clock" style="left:1320px;top:250px"><div class="hand h"></div><div class="hand m"></div></div>`;
    h += `<div class="window" style="left:1850px"><div class="sun" style="left:90px;top:40px"></div><div class="hills"></div></div>`;
    h += wall(2340, 110, `<div class="sign" style="position:relative;top:0;background:#3e6b48;color:#f3ece0">IT Help<small style="color:#dcebd8">Walk-ups welcome</small></div>`);
    h += `<div class="glass" style="left:2600px;width:420px"></div>`;
    h += wall(2640, 170, P_.shelf());
    h += wall(2800, 105, `<div class="sign" style="position:relative;top:0">${U.esc(IS.characters[t.cast.manager].name)}<small>Engineering Manager</small></div>`);
    h += wall(3060, 100, `<svg width="300" height="170" viewBox="0 0 300 170"><rect width="300" height="170" rx="8" fill="#1b1512"/><rect x="10" y="10" width="280" height="150" rx="4" fill="#2f352b"/><text x="150" y="70" text-anchor="middle" font-size="20" fill="#f0c060" font-family="Georgia,serif">${U.esc(t.groups.g2.name)}</text><text x="150" y="100" text-anchor="middle" font-size="12" fill="#e8d8bf" font-family="Nunito,sans-serif">Capstone review · Day 33</text></svg>`);
    h += `<div class="glassdoor door" style="left:3035px;top:190px;width:10px;box-shadow:none;background:#6b4a33"></div>`;
    h += wall(3300, 105, `<div class="sign" style="position:relative;top:0;background:#5a2e1e">${U.esc(t.lab.name)}<small>Authorized interns only</small></div>`);
    // props (depth-sorted by their bottom y)
    h += prop(250, 600, P_.podium(), 'clickable', 'marcus');
    h += prop(510, 595, P_.reception(), 'clickable', 'rosa');
    h += prop(690, 600, P_.kiosk(), 'clickable', 'store');
    h += prop(900, 590, P_.counter(), 'clickable', 'gus');
    h += prop(1000, 720, P_.cafetable());
    h += prop(610, 740, P_.plant(true));
    h += prop(1395, 650, P_.desk({ items: deskItems, name: 'YOUR DESK', chair: '#c2593f' }), 'clickable', 'desk');
    h += prop(1640, 640, P_.desk({ mug: '#d99a2b' }));
    h += prop(1880, 640, P_.desk({ mug: '#6f8f5e', chair: '#3e6b48' }));
    h += prop(2130, 640, P_.desk({ mug: '#c2593f', chair: '#5a2e1e' }));
    h += prop(2280, 690, P_.plant(false));
    h += prop(2440, 600, P_.helpdesk(), 'clickable', 'lena');
    h += prop(2810, 600, P_.mgrdesk());
    h += prop(2980, 730, P_.plant(true));
    h += prop(3200, 700, P_.conftable(), 'clickable', 'conference');
    h += prop(3500, 590, P_.lab(t.lab.art), 'clickable', 'lab');
    h += prop(3660, 740, P_.plant(false));
    // people
    L.people.forEach((p) => {
      h += `<div class="actor idle" data-npc="${p.id}" style="left:${p.x}px;top:${p.y}px;z-index:${Math.round(p.y) + 1}"></div>`;
    });
    h += `<div class="actor me" id="player-actor" style="z-index:1000"></div>`;
    world.innerHTML = h;
    npcs = L.people.map((p) => Object.assign({ el: world.querySelector(`[data-npc="${p.id}"]`), tx: null, wait: 2 + Math.random() * 4 }, p));
    npcs.forEach(renderNpc);
    hots = L.hotspots.concat(L.people.map((p) => ({ id: p.id, x: p.x, y: p.y, label: '💬 Talk to ' + IS.characters[p.id].short, npc: p })));
    P.el = world.querySelector('#player-actor');
    P.look = '';
    renderPlayer();
    refresh();
  }

  function renderNpc(n) {
    const c = IS.characters[n.id];
    const j = st().job;
    const alert = j && j.inbox.some((m) => !m.read && m.from === n.id);
    n.el.innerHTML = IS.people.svg(c.look, { height: 180, walking: n.walking }) +
      `<div class="tag ${alert ? 'alert' : ''}">${U.esc(c.short)}<span class="role">${U.esc(c.role)}</span></div>`;
    n.el.style.transform = `translate(-50%, -100%) scale(${depth(n.y)})`;
    n.el.style.transformOrigin = '50% 100%';
  }

  function renderPlayer() {
    const look = JSON.stringify(IS.state.playerLook()) + P.walking;
    if (look === P.look) return;
    P.look = look;
    P.el.innerHTML = IS.people.svg(IS.state.playerLook(), { height: 180, walking: P.walking }) + `<div class="tag" style="background:var(--terracotta)">${U.esc(st().player.name)} <span class="role" style="color:#fff3df">you</span></div>`;
  }

  function place() {
    P.el.style.left = P.x + 'px';
    P.el.style.top = P.y + 'px';
    P.el.style.zIndex = Math.round(P.y) + 2;
    P.el.style.transform = `translate(-50%, -100%) scale(${depth(P.y)})`;
    P.el.style.transformOrigin = '50% 100%';
  }

  function camera() {
    const W = root.clientWidth;
    const H = root.clientHeight;
    scale = H / WORLD_H;
    if (W / scale > WORLD_W) scale = W / WORLD_W;
    offsetY = H - WORLD_H * scale;
    const maxX = WORLD_W * scale - W;
    const target = U.clamp(P.x * scale - W / 2, 0, Math.max(0, maxX));
    camX += (target - camX) * 0.18;
    if (Math.abs(target - camX) < 0.5) camX = target;
    world.style.transform = `translate(${-camX}px, ${offsetY}px) scale(${scale})`;
  }

  // Refresh dynamic parts without rebuilding the world.
  function refresh() {
    if (!world) return;
    const s = st();
    const j = s.job;
    const shelf = world.querySelector('#trophy-shelf');
    if (shelf) {
      const mine = s.awards.slice(-12);
      shelf.innerHTML = mine.map((a) => `<span title="${U.esc(IS.awards.byId(a.id).name)}">${IS.awards.byId(a.id).icon}</span>`).join('') || '<span style="font-size:12px;color:#e8d8bf;line-height:1.3">Your trophies will appear here</span>';
    }
    const clk = world.querySelector('#wall-clock');
    if (clk && j) {
      const mins = 9 * 60 + j.minute;
      clk.querySelector('.h').style.transform = `rotate(${((mins / 60) % 12) * 30}deg)`;
      clk.querySelector('.m').style.transform = `rotate(${(mins % 60) * 6}deg)`;
    }
    npcs.forEach(renderNpc);
    const deskProp = world.querySelector('[data-hot="desk"]');
    if (deskProp) deskProp.innerHTML = P_.desk({ items: s.desk.map((id) => IS.store.byId(id).emoji), name: 'YOUR DESK', chair: '#c2593f' });
    P.look = '';
    renderPlayer();
    place();
  }

  // ── Movement ─────────────────────────────────────────────
  function walkTo(x, y, onArrive) {
    P.tx = U.clamp(x, 40, WORLD_W - 40);
    P.ty = U.clamp(y, Y_MIN, Y_MAX);
    P.onArrive = onArrive || null;
    const mk = document.createElement('div');
    mk.className = 'target-marker';
    mk.style.left = P.tx + 'px';
    mk.style.top = P.ty + 'px';
    mk.style.zIndex = 3;
    world.appendChild(mk);
    setTimeout(() => mk.remove(), 600);
  }

  function goToHotspot(id, then) {
    const h = hots.find((x) => x.id === id);
    if (!h) return;
    const standX = h.npc ? h.x + (P.x < h.x ? -80 : 80) : h.x;
    const standY = h.npc ? U.clamp(h.y + 40, Y_MIN, Y_MAX) : h.y;
    walkTo(standX, standY, () => {
      if (then) then();
      else IS.ui.interact(id);
    });
  }

  // The world is frozen whenever a dialog, modal, stage or the computer is open.
  function blocked() {
    return !!(document.querySelector('.modal-back, .dialog, .stage') || (IS.ui.overlay && IS.ui.overlay()));
  }

  function tick(ts) {
    const dt = Math.min(0.05, (ts - (last || ts)) / 1000);
    last = ts;
    if (!root || !document.body.contains(root)) return;
    paused = blocked();
    let vx = 0;
    let vy = 0;
    if (!paused) {
      if (keys.ArrowLeft || keys.a) vx -= 1;
      if (keys.ArrowRight || keys.d) vx += 1;
      if (keys.ArrowUp || keys.w) vy -= 1;
      if (keys.ArrowDown || keys.s) vy += 1;
    }
    let moving = false;
    if (vx || vy) {
      P.tx = null;
      P.onArrive = null;
      const len = Math.hypot(vx, vy);
      P.x = U.clamp(P.x + (vx / len) * SPEED * dt, 40, WORLD_W - 40);
      P.y = U.clamp(P.y + (vy / len) * SPEED * 0.6 * dt, Y_MIN, Y_MAX);
      moving = true;
    } else if (P.tx != null && !paused) {
      const dx = P.tx - P.x;
      const dy = P.ty - P.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) {
        P.x = P.tx;
        P.y = P.ty;
        P.tx = null;
        const cb = P.onArrive;
        P.onArrive = null;
        if (cb) setTimeout(cb, 30);
      } else {
        const step = Math.min(d, SPEED * dt);
        P.x += (dx / d) * step;
        P.y += (dy / d) * step;
        moving = true;
      }
    }
    if (moving !== P.walking) {
      P.walking = moving;
      const svg = P.el.querySelector('.person');
      if (svg) svg.classList.toggle('walking', moving);
    }
    if (moving) {
      place();
      st().pos = { x: Math.round(P.x), y: Math.round(P.y) };
    }
    // wandering NPCs
    npcs.forEach((n) => {
      if (!n.wander || paused) return;
      if (n.tx == null) {
        n.wait -= dt;
        if (n.wait <= 0) {
          n.tx = n.wander[0] + Math.random() * (n.wander[1] - n.wander[0]);
          n.ty = U.clamp(620 + Math.random() * 100, Y_MIN, Y_MAX);
        }
      } else {
        const dx = n.tx - n.x;
        const dy = n.ty - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 3) {
          n.tx = null;
          n.wait = 3 + Math.random() * 6;
          n.el.querySelector('.person').classList.remove('walking');
        } else {
          const step = Math.min(d, 90 * dt);
          n.x += (dx / d) * step;
          n.y += (dy / d) * step;
          n.el.querySelector('.person').classList.add('walking');
          n.el.style.left = n.x + 'px';
          n.el.style.top = n.y + 'px';
          n.el.style.zIndex = Math.round(n.y) + 1;
          n.el.style.transform = `translate(-50%, -100%) scale(${depth(n.y)})`;
          const h = hots.find((x) => x.id === n.id);
          if (h) { h.x = n.x; h.y = n.y; }
        }
      }
    });
    camera();
    updatePrompt();
    raf = requestAnimationFrame(tick);
  }

  function updatePrompt() {
    let best = null;
    let bd = 1e9;
    hots.forEach((h) => {
      const d = Math.hypot(h.x - P.x, (h.y - P.y) * 1.4);
      if (d < bd) { bd = d; best = h; }
    });
    nearest = bd < 130 && !paused ? best : null;
    if (!promptEl) return;
    if (!nearest) {
      promptEl.style.display = 'none';
      return;
    }
    promptEl.style.display = 'block';
    promptEl.textContent = 'E · ' + nearest.label;
    promptEl.style.left = nearest.x + 'px';
    promptEl.style.top = (nearest.npc ? nearest.y - 200 * depth(nearest.y) : nearest.y - 170) + 'px';
    promptEl.style.zIndex = 2000;
  }

  // ── Mount / input ───────────────────────────────────────
  function toWorld(ev) {
    const r = root.getBoundingClientRect();
    return { x: (ev.clientX - r.left + camX) / scale, y: (ev.clientY - r.top - offsetY) / scale };
  }

  function onClick(ev) {
    if (blocked()) return;
    const actor = ev.target.closest('[data-npc]');
    if (actor) return goToHotspot(actor.dataset.npc);
    const hot = ev.target.closest('[data-hot]');
    if (hot) return goToHotspot(hot.dataset.hot);
    const p = toWorld(ev);
    walkTo(p.x, Math.max(p.y, Y_MIN));
  }

  function onKey(ev, down) {
    if (ev.target.closest && ev.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(k)) {
      if (!root || paused) return;
      keys[k] = down;
      ev.preventDefault();
    }
    if (down && (k === 'e' || k === 'Enter') && nearest && !blocked() && root) {
      ev.preventDefault();
      IS.ui.interact(nearest.id);
    }
  }
  document.addEventListener('keydown', (e) => onKey(e, true));
  document.addEventListener('keyup', (e) => onKey(e, false));
  window.addEventListener('blur', () => Object.keys(keys).forEach((k) => { keys[k] = false; }));

  function mount(container) {
    root = container;
    root.innerHTML = '<div class="world"></div>';
    world = root.querySelector('.world');
    promptEl = document.createElement('div');
    promptEl.className = 'prompt';
    promptEl.style.display = 'none';
    const pos = st().pos || { x: 160, y: 640 };
    P.x = pos.x;
    P.y = pos.y;
    P.tx = null;
    buildWorld();
    world.appendChild(promptEl);
    world.addEventListener('click', onClick);
    camX = U.clamp(P.x * (root.clientHeight / WORLD_H) - root.clientWidth / 2, 0, 1e9);
    cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function unmount() {
    cancelAnimationFrame(raf);
    root = null;
    world = null;
  }

  function setPos(x, y) {
    P.x = x;
    P.y = y;
    P.tx = null;
    st().pos = { x, y };
    if (world) place();
  }

  return {
    mount, unmount, refresh, walkTo, goToHotspot, setPos,
    isMounted: () => !!root && document.body.contains(root),
    pause: (v) => { if (v) Object.keys(keys).forEach((k) => { keys[k] = false; }); },
    SPOTS: { lobby: [300, 640], cafe: [900, 660], desk: [1395, 660], mentor: [2080, 640], it: [2440, 640], manager: [2700, 640], conference: [3200, 720], lab: [3450, 690], exit: [110, 620] },
  };
})();
