// Detailed, shaded SVG people. Everyone in the game (player and NPCs) is
// rendered by IS.people.svg(cfg, opts):
//   cfg:  { skin, hair, hairColor, eyes, facial, build, top, topColor, bottom,
//           bottomColor, shoes, shoeColor, hat, accessory, accessory2 }
//   opts: { mode: 'full' | 'portrait', height, mood, walking, cls }
IS.people = (function () {
  const SKINS = ['#f8e1cf', '#f1d0b5', '#e7bf9c', '#d9a57c', '#c68b5f', '#a8704a', '#8a5638', '#6b4029', '#4d2c1d'];
  const HAIR_STYLES = ['short', 'sidepart', 'long', 'bob', 'bun', 'ponytail', 'curly', 'afro', 'braids', 'wavy', 'buzz', 'bald'];
  const HAIR_COLORS = ['#1c1714', '#2f2019', '#4a2e1c', '#6f4526', '#9c6a3a', '#c9a063', '#e3cf9c', '#a3a09a', '#e8e4dc', '#a8412a', '#c75b39', '#8e2b45'];
  const EYE_COLORS = ['#3b2618', '#5a3a22', '#6d5a2e', '#4f6b3a', '#6b6f5c'];
  const TOP_COLORS = ['#c2593f', '#d99a2b', '#6f8f5e', '#3e6b48', '#2b2622', '#f3ece0', '#a8412a', '#e07a5f', '#8a6d4b', '#c9b18a'];
  const BOTTOM_COLORS = ['#2b2622', '#5a4636', '#8a6d4b', '#c9b18a', '#4b5a3a', '#6b3a2e'];
  const FACIAL = ['none', 'stubble', 'mustache', 'beard', 'goatee'];
  const BUILDS = ['slim', 'average', 'broad'];
  const SHOES = ['sneakers', 'boots', 'loafers', 'flats'];
  const BOTTOMS = ['pants', 'skirt', 'shorts'];

  const LONG_SLEEVE = ['hoodie', 'blazer', 'sweater', 'cardigan', 'labcoat', 'button', 'varsity', 'hivis'];
  let uid = 0;

  function hex2rgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // amt > 0 lightens toward white, < 0 darkens toward black
  function shade(hex, amt) {
    const [r, g, b] = hex2rgb(hex);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    const f = (c) => Math.round(c + (t - c) * p);
    return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  function grad(id, top, bottom, vertical) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
  }

  // ── Geometry by build ─────────────────────────────────────
  function frame(build) {
    if (build === 'slim') return { sL: 37, sR: 83, wL: 43, wR: 77 };
    if (build === 'broad') return { sL: 30, sR: 90, wL: 38, wR: 82 };
    return { sL: 34, sR: 86, wL: 41, wR: 79 };
  }

  // ── Hair ──────────────────────────────────────────────────
  function hairBack(style, fill) {
    switch (style) {
      case 'long': return `<path d="M39 30 C36 60 37 92 42 110 C50 115 70 115 78 110 C83 92 84 60 81 30 C79 12 41 12 39 30 Z" fill="${fill}"/>`;
      case 'wavy': return `<path d="M39 30 C35 52 40 66 36 82 C40 96 38 104 44 112 C52 116 68 116 76 112 C82 104 80 96 84 82 C80 66 85 52 81 30 C79 12 41 12 39 30 Z" fill="${fill}"/>`;
      case 'bob': return `<path d="M40 30 C37 48 37 62 39 70 C46 73 74 73 81 70 C83 62 83 48 80 30 C78 13 42 13 40 30 Z" fill="${fill}"/>`;
      case 'ponytail': return `<path d="M73 24 C90 30 90 64 83 92 C80 76 78 52 70 34 Z" fill="${fill}"/>`;
      case 'afro': return `<ellipse cx="60" cy="31" rx="28" ry="25" fill="${fill}"/>`;
      case 'braids': return [44, 76].map((x) => [0, 1, 2, 3, 4, 5].map((i) =>
        `<ellipse cx="${x + (x < 60 ? -2 : 2)}" cy="${54 + i * 10}" rx="4.4" ry="6" fill="${fill}"/>`).join('')).join('');
      case 'curly': return `<ellipse cx="60" cy="36" rx="23" ry="23" fill="${fill}"/>`;
      default: return '';
    }
  }

  function hairFront(style, fill, dark) {
    const hi = '<path d="M50 16 C56 13 64 13 70 16" stroke="#fff" stroke-opacity=".22" stroke-width="2" fill="none" stroke-linecap="round"/>';
    switch (style) {
      case 'short': return `<path d="M42 38 C40 20 50 11 61 11 C72 11 80 19 78 38 C77 30 74 26 70 24 C64 27 53 26 46 30 C44 32 43 35 42 38 Z" fill="${fill}"/>` + hi;
      case 'sidepart': return `<path d="M42 40 C39 21 49 11 60 11 C71 11 80 19 78 40 C76 31 73 26 68 23 C60 22 50 25 45 32 Z" fill="${fill}"/><path d="M52 14 C50 18 48 22 46 27" stroke="${dark}" stroke-width=".8" fill="none"/>` + hi;
      case 'long':
      case 'wavy': return `<path d="M42 46 C38 20 50 11 60 11 C71 11 82 20 78 46 C76 31 70 24 61 22 C54 26 47 33 42 46 Z" fill="${fill}"/>` + hi;
      case 'bob': return `<path d="M42 37 C41 18 52 12 60 12 C70 12 79 18 78 37 C74 28 67 25 60 26 C53 25 46 28 42 37 Z" fill="${fill}"/>` + hi;
      case 'bun': return `<circle cx="60" cy="10" r="8" fill="${fill}"/><path d="M42 38 C41 20 50 13 60 13 C70 13 79 20 78 38 C75 28 68 23 60 23 C52 23 45 28 42 38 Z" fill="${fill}"/>` + hi;
      case 'ponytail': return `<path d="M42 38 C41 20 50 13 60 13 C70 13 79 20 78 38 C75 28 68 23 60 23 C52 23 45 28 42 38 Z" fill="${fill}"/><circle cx="74" cy="25" r="3" fill="${dark}"/>` + hi;
      case 'braids': return `<path d="M42 40 C40 20 50 13 60 13 C70 13 80 20 78 40 C75 28 68 22 60 22 C52 22 45 28 42 40 Z" fill="${fill}"/><path d="M60 13 L60 22" stroke="${dark}" stroke-width=".9"/>` + hi;
      case 'curly': {
        const pts = [[42, 36], [44, 26], [50, 18], [58, 14], [66, 15], [73, 20], [77, 28], [78, 37], [47, 22], [70, 17]];
        return pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${fill}"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="2" fill="#fff" opacity=".08"/>`).join('');
      }
      case 'afro': return `<path d="M36 36 C34 14 48 6 60 6 C72 6 86 14 84 36 C80 26 72 22 60 22 C48 22 40 26 36 36 Z" fill="${fill}"/>` +
        [[44, 14], [56, 9], [68, 10], [78, 20], [40, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#000" opacity=".08"/>`).join('');
      case 'buzz': return `<path d="M43 34 C43 20 50 14 60 14 C70 14 77 20 77 34 C73 26 67 23 60 23 C53 23 47 26 43 34 Z" fill="${fill}" opacity=".85"/>`;
      case 'bald': return '<ellipse cx="55" cy="20" rx="6" ry="3" fill="#fff" opacity=".18"/>';
      default: return '';
    }
  }

  function facialHair(kind, fill) {
    switch (kind) {
      case 'stubble': return `<path d="M44 44 C45 56 52 63 60 63 C68 63 75 56 76 44 C74 52 69 57 60 57 C51 57 46 52 44 44 Z" fill="${fill}" opacity=".28"/>`;
      case 'mustache': return `<path d="M53.5 52.4 C56.5 50.2 63.5 50.2 66.5 52.4 C63.5 53.4 56.5 53.4 53.5 52.4 Z" fill="${fill}"/>`;
      case 'goatee': return `<path d="M54 52.4 C57 50.6 63 50.6 66 52.4 C63 53.2 57 53.2 54 52.4 Z" fill="${fill}"/><path d="M56 58 C57 63 63 63 64 58 C62 59.5 58 59.5 56 58 Z" fill="${fill}"/>`;
      case 'beard': return `<path d="M43.5 42 C44 57 51 65 60 65 C69 65 76 57 76.5 42 C74 51 70 55 66 57 C63 55.5 57 55.5 54 57 C50 55 46 51 43.5 42 Z" fill="${fill}"/>` +
        `<path d="M53.5 52.4 C56.5 50.4 63.5 50.4 66.5 52.4 C63.5 53.4 56.5 53.4 53.5 52.4 Z" fill="${fill}"/>`;
      default: return '';
    }
  }

  // ── Face ──────────────────────────────────────────────────
  function face(skin, eyes, hairColor, mood, id) {
    const brow = shade(hairColor, -0.1);
    const lip = shade(skin, -0.28);
    const lipLo = shade(skin, -0.18);
    const eye = (cx) => `<path d="M${cx - 5} 39 Q${cx} 35.2 ${cx + 5} 39 Q${cx} 41.8 ${cx - 5} 39 Z" fill="#fbf7f2"/>` +
      `<circle cx="${cx}" cy="38.8" r="2.3" fill="${eyes}"/><circle cx="${cx}" cy="38.8" r="1.05" fill="#140e0a"/>` +
      `<circle cx="${cx + 0.8}" cy="38" r=".6" fill="#fff"/>` +
      `<path d="M${cx - 5.2} 38.9 Q${cx} 34.6 ${cx + 5.2} 38.9" stroke="#2a1d16" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    const lid = (cx) => `<ellipse cx="${cx}" cy="38.4" rx="5.6" ry="3.6" fill="${skin}"/>`;
    const browY = mood === 'wow' ? 29.5 : mood === 'sad' ? 31.5 : 31;
    const brows = mood === 'sad'
      ? `<path d="M47.5 ${browY} Q52 ${browY + 1.5} 56.5 ${browY - 1.4}" stroke="${brow}" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M63.5 ${browY - 1.4} Q68 ${browY + 1.5} 72.5 ${browY}" stroke="${brow}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`
      : `<path d="M47.5 ${browY + 0.5} Q52 ${browY - 1.8} 56.5 ${browY}" stroke="${brow}" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M63.5 ${browY} Q68 ${browY - 1.8} 72.5 ${browY + 0.5}" stroke="${brow}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    let mouth;
    if (mood === 'wow') mouth = `<ellipse cx="60" cy="55" rx="3.2" ry="3.6" fill="#5a2320"/><path d="M57 53.6 Q60 52.6 63 53.6" stroke="${lip}" stroke-width="1" fill="none"/>`;
    else if (mood === 'sad') mouth = `<path d="M55 56.2 Q60 52.8 65 56.2 Q60 54.6 55 56.2 Z" fill="${lip}"/>`;
    else if (mood === 'neutral') mouth = `<path d="M55 54.2 Q57.6 53 60 53.8 Q62.4 53 65 54.2 Q60 55 55 54.2 Z" fill="${lip}"/><path d="M55.4 54.3 Q60 57.2 64.6 54.3 Q60 55.2 55.4 54.3 Z" fill="${lipLo}"/>`;
    else mouth = `<path d="M54 53.4 Q60 58.8 66 53.4 Q60 55 54 53.4 Z" fill="#fff"/><path d="M53.8 53.2 Q57.4 51.9 60 52.8 Q62.6 51.9 66.2 53.2 Q60 53.8 53.8 53.2 Z" fill="${lip}"/>` +
      `<path d="M54 53.4 Q60 59.6 66 53.4 Q60 58 54 53.4 Z" fill="${lipLo}"/>`;
    return brows + eye(52.5) + eye(67.5) +
      `<g class="lids" opacity="0">${lid(52.5)}${lid(67.5)}</g>` +
      `<path d="M60.6 40 C60 44.5 58.6 47 57.4 48.6 C58.8 49.8 61.4 49.9 63 48.8" stroke="${shade(skin, -0.25)}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".75"/>` +
      `<ellipse cx="60.4" cy="47.6" rx="2.6" ry="1.4" fill="${shade(skin, 0.18)}" opacity=".5"/>` +
      `<ellipse cx="48.5" cy="47.5" rx="3.4" ry="2" fill="#e5816d" opacity=".16"/><ellipse cx="71.5" cy="47.5" rx="3.4" ry="2" fill="#e5816d" opacity=".16"/>` +
      mouth;
  }

  // ── Clothing ──────────────────────────────────────────────
  function top(kind, color, f, id, skin) {
    const light = shade(color, 0.12);
    const dark = shade(color, -0.22);
    const g = grad(id + 't', light, dark, true);
    const torso = (fill) => `<path d="M${f.sL} 86 C${f.sL} 77 ${f.sL + 8} 72 52 71 L68 71 C${f.sR - 8} 72 ${f.sR} 77 ${f.sR} 86 L${f.wR} 153 L${f.wL} 153 Z" fill="${fill}"/>` +
      `<path d="M${f.sR - 4} 84 L${f.wR - 2} 152 L${f.wR} 153 L${f.sR} 86 Z" fill="#000" opacity=".12"/>`;
    const crew = `<path d="M52 71 Q60 79 68 71" fill="none" stroke="${dark}" stroke-width="1.6"/>`;
    let out = `<defs>${g}</defs>`;
    const fill = `url(#${id}t)`;
    switch (kind) {
      case 'polo':
        out += torso(fill) + `<path d="M51 71 L60 80 L56 84 Z M69 71 L60 80 L64 84 Z" fill="${light}"/><line x1="60" y1="80" x2="60" y2="95" stroke="${dark}"/><circle cx="60" cy="86" r=".9" fill="${dark}"/><circle cx="60" cy="91" r=".9" fill="${dark}"/>`;
        break;
      case 'button':
        out += torso(fill) + `<path d="M51 70 L60 79 L55 83 Z M69 70 L60 79 L65 83 Z" fill="${light}"/><line x1="60" y1="79" x2="60" y2="152" stroke="${dark}" stroke-width=".8"/>` +
          [88, 102, 116, 130, 144].map((y) => `<circle cx="61.5" cy="${y}" r=".9" fill="${dark}"/>`).join('');
        break;
      case 'hoodie':
        out += `<path d="M46 74 C46 62 74 62 74 74 L68 76 C66 70 54 70 52 76 Z" fill="${dark}"/>` + torso(fill) +
          `<path d="M54 76 L53 96 M66 76 L67 96" stroke="#f3ece0" stroke-width="1.1"/><path d="M47 125 L73 125 L76 146 L44 146 Z" fill="${dark}" opacity=".45"/>`;
        break;
      case 'blazer':
        out += torso(fill) + `<path d="M52 71 L60 108 L68 71 Z" fill="#f3ece0"/><path d="M58.5 76 L60 104 L61.5 76 Z" fill="${shade(color, -0.45)}" opacity=".9"/>` +
          `<path d="M52 71 L58 98 L49 86 Z M68 71 L62 98 L71 86 Z" fill="${dark}"/><circle cx="60" cy="118" r="1.4" fill="${shade(color, -0.4)}"/><circle cx="60" cy="130" r="1.4" fill="${shade(color, -0.4)}"/>`;
        break;
      case 'sweater':
        out += torso(fill) + crew + `<path d="M${f.wL} 146 L${f.wR} 146 L${f.wR} 153 L${f.wL} 153 Z" fill="${dark}"/>` +
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${f.wL + 2 + i * ((f.wR - f.wL - 4) / 7)}" y1="147" x2="${f.wL + 2 + i * ((f.wR - f.wL - 4) / 7)}" y2="153" stroke="${shade(color, -0.35)}" stroke-width=".6"/>`).join('');
        break;
      case 'cardigan':
        out += torso(fill) + `<path d="M53 71 L57 153 L63 153 L67 71 Q60 78 53 71 Z" fill="#f3ece0"/>` +
          [95, 110, 125, 140].map((y) => `<circle cx="55.5" cy="${y}" r="1.1" fill="${shade(color, -0.4)}"/>`).join('');
        break;
      case 'labcoat':
        out += `<path d="M${f.sL} 86 C${f.sL} 77 ${f.sL + 8} 72 52 71 L68 71 C${f.sR - 8} 72 ${f.sR} 77 ${f.sR} 86 L${f.wR + 5} 205 L${f.wL - 5} 205 Z" fill="${fill}"/>` +
          `<path d="M52 71 L60 100 L68 71 Z" fill="#d9c9ae"/><path d="M52 71 L57 104 L48 90 Z M68 71 L63 104 L72 90 Z" fill="${dark}"/><line x1="60" y1="100" x2="60" y2="205" stroke="${dark}"/>` +
          `<rect x="66" y="98" width="10" height="9" rx="1" fill="none" stroke="${dark}"/><line x1="69" y1="95" x2="69" y2="101" stroke="#c2593f" stroke-width="1.4"/>`;
        break;
      case 'apron':
        out += torso(`url(#${id}t)`) + crew + `<path d="M47 90 L73 90 L${f.wR + 2} 190 L${f.wL - 2} 190 Z" fill="#3e6b48"/><path d="M50 90 L54 72 M70 90 L66 72" stroke="#3e6b48" stroke-width="2.4"/>` +
          `<rect x="54" y="120" width="12" height="9" rx="1" fill="#335a3c"/>`;
        break;
      case 'hawaiian':
        out += torso(fill) + `<path d="M51 70 L60 80 L55 84 Z M69 70 L60 80 L65 84 Z" fill="${light}"/>` +
          [[45, 95], [70, 92], [56, 112], [75, 124], [47, 132], [64, 142], [52, 88]].map(([x, y]) =>
            `<circle cx="${x}" cy="${y}" r="3.6" fill="#f3d27a"/><circle cx="${x}" cy="${y}" r="1.3" fill="#c2593f"/>`).join('');
        break;
      case 'varsity':
        out += torso(fill) + `<path d="M52 71 Q60 79 68 71" fill="none" stroke="#f3d27a" stroke-width="2.4"/><line x1="60" y1="78" x2="60" y2="152" stroke="#f3d27a" stroke-width="1"/>` +
          `<text x="44" y="112" font-size="14" font-weight="800" font-family="Georgia,serif" fill="#f3d27a">W</text>`;
        break;
      case 'hivis':
        out += torso(`url(#${id}t)`) + crew + `<path d="M${f.sL + 5} 80 L52 71 L55 153 L${f.wL} 153 Z M${f.sR - 5} 80 L68 71 L65 153 L${f.wR} 153 Z" fill="#f08c2a"/>` +
          `<path d="M${f.wL} 128 L55 128 M65 128 L${f.wR} 128" stroke="#f6e7b0" stroke-width="3"/>`;
        break;
      case 'castletee':
        out += torso(fill) + crew + `<g transform="translate(49 92)" fill="#f3d27a"><rect x="4" y="10" width="14" height="10"/><rect x="2" y="6" width="4" height="14"/><rect x="16" y="6" width="4" height="14"/><rect x="9" y="2" width="4" height="10"/><path d="M1 6 L4 1 L7 6 Z M15 6 L18 1 L21 6 Z M8 2 L11 -3 L14 2 Z"/><rect x="9" y="14" width="4" height="6" fill="${color}"/></g>`;
        break;
      default: // tee
        out += torso(fill) + crew;
    }
    return out;
  }

  function arm(side, f, skin, kind, color, id) {
    const m = side === 'l' ? (x) => x : (x) => 120 - x;
    const sx = side === 'l' ? f.sL : f.sL; // mirrored by m()
    const skinPath = `M${m(sx + 2)} 82 C${m(sx - 5)} 96 ${m(sx - 8)} 122 ${m(sx - 9)} 152 L${m(sx)} 153 C${m(sx + 1)} 126 ${m(sx + 4)} 102 ${m(sx + 9)} 86 Z`;
    const long = LONG_SLEEVE.includes(kind);
    const sleeveEnd = long ? 150 : 104;
    const sleeve = `M${m(sx + 1)} 80 C${m(sx - 5)} 92 ${m(sx - 7)} ${sleeveEnd - 22} ${m(sx - 8.5)} ${sleeveEnd} L${m(sx + 1)} ${sleeveEnd + 1} C${m(sx + 1.5)} ${sleeveEnd - 22} ${m(sx + 4)} 98 ${m(sx + 10)} 84 Z`;
    let sleeveColor = kind === 'varsity' ? '#f3ece0' : kind === 'hivis' || kind === 'apron' ? color : color;
    return `<g class="arm arm-${side}"><path d="${skinPath}" fill="url(#${id}s)"/>` +
      `<path d="${sleeve}" fill="${sleeveColor}"/><path d="${sleeve}" fill="#000" opacity="${side === 'r' ? 0.12 : 0.04}"/>` +
      `<ellipse cx="${m(sx - 4.5)}" cy="160" rx="5" ry="7.2" fill="${shade(skin, -0.05)}"/>` +
      `<path d="M${m(sx - 7)} 162 Q${m(sx - 4.5)} 166 ${m(sx - 2)} 162" stroke="${shade(skin, -0.25)}" stroke-width=".7" fill="none"/></g>`;
  }

  function legs(cfg, f, id, skin) {
    const bottom = cfg.bottom || 'pants';
    const col = cfg.bottomColor || '#5a4636';
    const shoeCol = cfg.shoeColor || (cfg.shoes === 'sneakers' ? '#f3ece0' : '#3a2a20');
    const pg = grad(id + 'p', shade(col, 0.08), shade(col, -0.2), true);
    const leg = (side) => {
      const m = side === 'l' ? (x) => x : (x) => 120 - x;
      const pant = `M${m(f.wL)} 150 L${m(60)} 150 L${m(59)} 180 L${m(57.5)} 280 L${m(44.5)} 280 L${m(f.wL + 1)} 200 Z`;
      const skinLeg = `M${m(45)} 150 L${m(58.5)} 150 L${m(57)} 280 L${m(46)} 280 Z`;
      let body;
      if (bottom === 'skirt') body = `<path d="${skinLeg}" fill="url(#${id}s)"/>`;
      else if (bottom === 'shorts') body = `<path d="${skinLeg}" fill="url(#${id}s)"/><path d="M${m(f.wL)} 150 L${m(60)} 150 L${m(59)} 192 L${m(f.wL - 1)} 192 Z" fill="url(#${id}p)"/>`;
      else body = `<path d="${pant}" fill="url(#${id}p)"/><path d="M${m(52)} 196 L${m(51.5)} 276" stroke="#000" stroke-opacity=".1" stroke-width="1"/>`;
      const shoe = cfg.shoes === 'boots'
        ? `<path d="M${m(44)} 268 L${m(58)} 268 L${m(59)} 282 C${m(60)} 286 ${m(59)} 291 ${m(56)} 291 L${m(38)} 291 C${m(35)} 291 ${m(35)} 284 ${m(40)} 281 L${m(44)} 280 Z" fill="${shoeCol}"/>`
        : `<path d="M${m(44)} 278 L${m(58)} 278 C${m(60)} 280 ${m(60.5)} 286 ${m(58.5)} 290 L${m(38)} 290 C${m(34)} 290 ${m(34.5)} 282 ${m(40)} 280 Z" fill="${shoeCol}"/>` +
          (cfg.shoes === 'sneakers' ? `<path d="M${m(36)} 288 L${m(59)} 288" stroke="#c9b18a" stroke-width="2"/>` : '');
      return `<g class="leg leg-${side}">${body}${shoe}</g>`;
    };
    let out = `<defs>${pg}</defs>` + leg('l') + leg('r');
    if (bottom === 'skirt') out += `<path d="M${f.wL} 148 L${f.wR} 148 L${f.wR + 9} 214 L${f.wL - 9} 214 Z" fill="url(#${id}p)"/><path d="M${f.wR} 150 L${f.wR + 9} 214 L${f.wR + 2} 214 Z" fill="#000" opacity=".12"/>`;
    else out += `<rect x="${f.wL}" y="148" width="${f.wR - f.wL}" height="5" fill="${shade(col, -0.35)}"/><rect x="57" y="148.5" width="6" height="4" rx=".8" fill="none" stroke="#c9a063" stroke-width=".9"/>`;
    return out;
  }

  function accessory(kind) {
    switch (kind) {
      case 'glasses': return `<rect x="46" y="34.6" width="13" height="9" rx="3" fill="#fff" fill-opacity=".12" stroke="#2a1d16" stroke-width="1.2"/><rect x="61" y="34.6" width="13" height="9" rx="3" fill="#fff" fill-opacity=".12" stroke="#2a1d16" stroke-width="1.2"/><path d="M59 38 L61 38 M46 37 L43 36 M74 37 L77 36" stroke="#2a1d16" stroke-width="1.2"/>`;
      case 'sunglasses': return `<rect x="45.5" y="34.5" width="14" height="8.5" rx="3.4" fill="#1d1612"/><rect x="60.5" y="34.5" width="14" height="8.5" rx="3.4" fill="#1d1612"/><path d="M59 37.5 L61 37.5 M45.5 36.5 L43 36 M74.5 36.5 L77 36" stroke="#1d1612" stroke-width="1.4"/><path d="M48 36.5 L52 36.5" stroke="#fff" stroke-opacity=".3"/>`;
      case 'headphones': return `<path d="M41 42 C39 12 81 12 79 42" stroke="#2b2622" stroke-width="3.6" fill="none"/><rect x="36.5" y="36" width="8" height="13" rx="3.5" fill="#c2593f"/><rect x="75.5" y="36" width="8" height="13" rx="3.5" fill="#c2593f"/>`;
      case 'lanyard': return `<path d="M52 72 L60 108 L68 72" stroke="#c2593f" stroke-width="1.8" fill="none"/><rect x="54" y="106" width="12" height="15" rx="1.6" fill="#f3ece0"/><rect x="56" y="109" width="8" height="5" fill="#d9a57c"/><rect x="56" y="116" width="8" height="1.4" fill="#8a6d4b"/>` +
        '<circle cx="54.5" cy="86" r="1.8" fill="#d99a2b"/><circle cx="66" cy="88" r="1.8" fill="#6f8f5e"/><circle cx="56.5" cy="96" r="1.6" fill="#e07a5f"/>';
      case 'bowtie': return `<path d="M60 74 L52 70 L52 78 Z M60 74 L68 70 L68 78 Z" fill="#a8412a"/><circle cx="60" cy="74" r="1.8" fill="#7a2e1e"/>`;
      case 'tie': return `<path d="M58 73 L62 73 L61 77 L64 108 L60 113 L56 108 L59 77 Z" fill="#a8412a"/>`;
      case 'earrings': return `<circle cx="42.5" cy="48" r="1.5" fill="#d99a2b"/><circle cx="77.5" cy="48" r="1.5" fill="#d99a2b"/>`;
      case 'scarf': return `<path d="M50 68 C54 76 66 76 70 68 L72 74 C66 82 54 82 48 74 Z" fill="#c2593f"/><path d="M64 76 L68 104 L62 104 L60 78 Z" fill="#a8412a"/>`;
      case 'watch': return `<rect x="26" y="146" width="7" height="5" rx="1.2" fill="#d99a2b"/>`;
      default: return '';
    }
  }

  function hat(kind) {
    switch (kind) {
      case 'beanie': return `<path d="M40 32 C40 8 80 8 80 32 Z" fill="#a8412a"/><rect x="39" y="27" width="42" height="8" rx="3.5" fill="#7a2e1e"/><circle cx="60" cy="7" r="5" fill="#f3ece0"/>` +
        [46, 52, 58, 64, 70].map((x) => `<line x1="${x}" y1="12" x2="${x}" y2="27" stroke="#7a2e1e" stroke-width=".6"/>`).join('');
      case 'cap': return `<path d="M41 30 C41 11 79 11 79 30 Z" fill="#3e6b48"/><path d="M60 30 C70 29 84 30 88 33 C82 35 68 34 60 33 Z" fill="#2f5236"/><circle cx="60" cy="12.5" r="1.5" fill="#2f5236"/><text x="54" y="27" font-size="8" font-weight="800" fill="#f3d27a">WI</text>`;
      case 'ears': return `<circle cx="41" cy="14" r="10.5" fill="#1d1612"/><circle cx="79" cy="14" r="10.5" fill="#1d1612"/><path d="M42 26 C48 14 72 14 78 26" stroke="#1d1612" stroke-width="3" fill="none"/>` +
        `<path d="M60 17 L50 10 L50 24 Z M60 17 L70 10 L70 24 Z" fill="#c2593f"/><circle cx="60" cy="17" r="3" fill="#a8412a"/><circle cx="53" cy="14" r="1" fill="#f3ece0"/><circle cx="67" cy="20" r="1" fill="#f3ece0"/>`;
      case 'explorer': return `<ellipse cx="60" cy="27" rx="31" ry="5.5" fill="#8a6d4b"/><path d="M43 27 C43 8 77 8 77 27 Z" fill="#b08a5a"/><rect x="43" y="21.5" width="34" height="4.5" fill="#5a3e2b"/>`;
      case 'wizard': return `<path d="M60 -12 L82 26 L38 26 Z" fill="#2f5236"/><ellipse cx="60" cy="26" rx="27" ry="5" fill="#244029"/><text x="53" y="10" font-size="8" fill="#f3d27a">★</text><text x="62" y="21" font-size="6" fill="#f3d27a">☾</text>`;
      case 'crown': return `<path d="M42 27 L42 9 L51 18 L60 5 L69 18 L78 9 L78 27 Z" fill="#e0b040" stroke="#b8862a"/><circle cx="60" cy="19" r="2.4" fill="#a8412a"/><circle cx="49" cy="23" r="1.6" fill="#6f8f5e"/><circle cx="71" cy="23" r="1.6" fill="#6f8f5e"/>`;
      case 'hardhat': return `<path d="M40 28 C40 8 80 8 80 28 Z" fill="#e0a526"/><rect x="36" y="26" width="48" height="4.5" rx="2" fill="#c98e1c"/><path d="M60 9 L60 26" stroke="#c98e1c" stroke-width="3"/>`;
      default: return '';
    }
  }

  function svg(cfg, opts) {
    cfg = cfg || {};
    opts = opts || {};
    const id = 'pp' + (++uid);
    const skin = cfg.skin || SKINS[3];
    const hairColor = cfg.hairColor || '#2f2019';
    const hairStyle = cfg.hair || 'short';
    const f = frame(cfg.build);
    const topKind = cfg.top || 'tee';
    const topColor = topKind === 'labcoat' ? '#f6f1e8' : topKind === 'hivis' ? '#e7d9c0' : cfg.topColor || '#c2593f';
    const mood = opts.mood || 'happy';
    const portrait = opts.mode === 'portrait';
    const vb = portrait ? '26 0 68 86' : '0 -14 120 310';
    const h = opts.height || (portrait ? 64 : 180);
    const w = portrait ? h * 68 / 86 : h * 120 / 310;
    const hg = grad(id + 'h', shade(hairColor, 0.16), shade(hairColor, -0.1), true);
    const sg = `<radialGradient id="${id}s" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${shade(skin, 0.1)}"/><stop offset="1" stop-color="${shade(skin, -0.12)}"/></radialGradient>`;
    const hairFill = `url(#${id}h)`;
    return `<svg class="person ${opts.walking ? 'walking' : ''} ${opts.cls || ''}" viewBox="${vb}" width="${w.toFixed(1)}" height="${h}" aria-hidden="true">` +
      `<defs>${hg}${sg}</defs>` +
      (portrait ? '' : '<ellipse class="shadow" cx="60" cy="291" rx="28" ry="5" fill="#000" opacity=".18"/>') +
      hairBack(hairStyle, hairFill) +
      legs(cfg, f, id, skin) +
      `<path d="M52.5 54 L67.5 54 L68.5 74 C64 77.5 56 77.5 51.5 74 Z" fill="url(#${id}s)"/><path d="M52.5 58 C56 63 64 63 67.5 58 L67.6 62 C64 66 56 66 52.4 62 Z" fill="${shade(skin, -0.25)}" opacity=".45"/>` +
      top(topKind, topColor, f, id, skin) +
      arm('l', f, skin, topKind, topColor, id) + arm('r', f, skin, topKind, topColor, id) +
      `<ellipse cx="42.5" cy="41.5" rx="3.3" ry="5.8" fill="${shade(skin, -0.06)}"/><ellipse cx="77.5" cy="41.5" rx="3.3" ry="5.8" fill="${shade(skin, -0.06)}"/>` +
      `<path d="M42.8 38.5 Q44.2 41.5 43 44.5 M77.2 38.5 Q75.8 41.5 77 44.5" stroke="${shade(skin, -0.3)}" stroke-width=".7" fill="none"/>` +
      `<path d="M43 35 C43 20 50 15 60 15 C70 15 77 20 77 35 L77 42 C77 53 70 62 60 62 C50 62 43 53 43 42 Z" fill="url(#${id}s)"/>` +
      `<path d="M70 20 C76 26 77 36 77 42 C77 51 72 58 66 61 C72 54 74 44 70 20 Z" fill="#000" opacity=".06"/>` +
      face(skin, cfg.eyes || EYE_COLORS[0], hairColor, mood, id) +
      facialHair(cfg.facial, shade(hairColor, -0.05)) +
      hairFront(hairStyle, hairFill, shade(hairColor, -0.3)) +
      accessory(cfg.accessory) + accessory(cfg.accessory2) +
      hat(cfg.hat) +
      `</svg>`;
  }

  // Resolve a character id (or 'player') to a render config.
  function configFor(id) {
    if (id === 'player') return IS.state.playerLook();
    const c = IS.characters[id];
    return c ? c.look : {};
  }

  function of(id, opts) {
    return svg(configFor(id), opts);
  }

  function portrait(id, size, mood) {
    return svg(configFor(id), { mode: 'portrait', height: size || 64, mood });
  }

  return {
    svg, of, portrait, shade, configFor,
    SKINS, HAIR_STYLES, HAIR_COLORS, EYE_COLORS, TOP_COLORS, BOTTOM_COLORS, FACIAL, BUILDS, SHOES, BOTTOMS,
  };
})();
