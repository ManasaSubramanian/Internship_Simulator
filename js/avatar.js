// Layered SVG avatar builder shared by the player and every NPC.
IS.avatar = (function () {
  const SKINS = ['#f7dcc4', '#f1d2b6', '#e8c29e', '#d9a47a', '#c68e62', '#a8714a', '#8d5a3b', '#6b4430', '#4a2e21'];
  const HAIR_STYLES = ['short', 'long', 'bun', 'curly', 'ponytail', 'buzz', 'bald'];
  const HAIR_COLORS = ['#111111', '#2b1a10', '#4a2a18', '#7a4a26', '#b5651d', '#d6b370', '#dddddd', '#c2410c', '#7c3aed', '#0ea5e9', '#ec4899'];
  const SHIRT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#111827', '#f8fafc'];

  function backHair(style, color) {
    if (style === 'long') {
      return `<path d="M30 38 C27 58 29 72 33 78 L67 78 C71 72 73 58 70 38 Z" fill="${color}"/>`;
    }
    if (style === 'ponytail') {
      return `<ellipse cx="73" cy="52" rx="7" ry="15" fill="${color}"/>`;
    }
    return '';
  }

  function frontHair(style, color) {
    const cap = `<path d="M31 41 C30 22 42 18 50 18 C60 18 71 23 69 41 C66 32 60 28 50 28 C42 28 35 31 31 41 Z" fill="${color}"/>`;
    switch (style) {
      case 'short':
      case 'ponytail':
        return cap;
      case 'long':
        return `<path d="M31 45 C28 22 42 17 50 17 C61 17 72 23 69 45 C66 30 58 27 50 27 C40 27 33 33 31 45 Z" fill="${color}"/>`;
      case 'bun':
        return `<circle cx="50" cy="15" r="8" fill="${color}"/>` + cap;
      case 'buzz':
        return `<path d="M32 38 C33 24 42 21 50 21 C59 21 67 25 68 38 C62 30 38 30 32 38 Z" fill="${color}" opacity="0.85"/>`;
      case 'curly': {
        const pts = [[33, 36], [36, 27], [43, 21], [51, 19], [59, 21], [65, 27], [68, 36], [31, 44], [69, 44]];
        return pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${color}"/>`).join('');
      }
      default:
        return '';
    }
  }

  function outfit(id, shirtColor, skin) {
    const body = (fill) => `<path d="M14 100 C14 80 28 71 50 71 C72 71 86 80 86 100 Z" fill="${fill}"/>`;
    switch (id) {
      case 'hoodie':
        return `<ellipse cx="50" cy="72" rx="20" ry="7" fill="#172554"/>` + body('#1e3a8a') +
          `<line x1="46" y1="74" x2="45" y2="88" stroke="#e5e7eb" stroke-width="1.4"/><line x1="54" y1="74" x2="55" y2="88" stroke="#e5e7eb" stroke-width="1.4"/>` +
          `<text x="62" y="90" font-size="8" fill="#facc15">★</text><rect x="36" y="90" width="28" height="8" rx="3" fill="#172554"/>`;
      case 'castletee':
        return body('#8b5cf6') + `<text x="42" y="93" font-size="14">🏰</text>`;
      case 'hawaiian':
        return body('#0ea5a4') + [[30, 86], [44, 94], [60, 84], [72, 94], [52, 80]].map(([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="3.4" fill="#fde047"/><circle cx="${x}" cy="${y}" r="1.4" fill="#f97316"/>`).join('') +
          `<path d="M44 72 L50 82 L56 72" fill="none" stroke="#065f5b" stroke-width="1.5"/>`;
      case 'blazer':
        return body('#334155') + `<path d="M42 72 L50 92 L58 72 Z" fill="#f8fafc"/>` +
          `<path d="M42 72 L47 84 L40 80 Z M58 72 L53 84 L60 80 Z" fill="#1e293b"/><circle cx="50" cy="95" r="1.4" fill="#cbd5e1"/>`;
      case 'labcoat':
        return body('#f8fafc') + `<path d="M43 72 L50 86 L57 72" fill="none" stroke="#94a3b8" stroke-width="1.5"/>` +
          `<line x1="50" y1="86" x2="50" y2="100" stroke="#cbd5e1" stroke-width="1.2"/><rect x="58" y="88" width="9" height="7" rx="1" fill="none" stroke="#94a3b8"/>` +
          `<line x1="61" y1="86" x2="61" y2="90" stroke="#2563eb" stroke-width="1.5"/>`;
      case 'varsity':
        return body('#b91c1c') + `<path d="M14 100 C14 84 20 77 28 74 L30 100 Z M86 100 C86 84 80 77 72 74 L70 100 Z" fill="#facc15"/>` +
          `<text x="36" y="93" font-size="11" font-weight="bold" fill="#facc15">W</text>`;
      case 'cardigan':
        return body('#d97706') + `<path d="M44 72 L50 100 L56 72 Z" fill="#fef3c7"/>` +
          [82, 88, 94].map((y) => `<circle cx="52.5" cy="${y}" r="1.1" fill="#78350f"/>`).join('');
      case 'apron':
        return body('#78350f') + `<path d="M36 78 L64 78 L66 100 L34 100 Z" fill="#15803d"/>` +
          `<line x1="38" y1="78" x2="42" y2="71" stroke="#15803d" stroke-width="2"/><line x1="62" y1="78" x2="58" y2="71" stroke="#15803d" stroke-width="2"/>`;
      default:
        return body(shirtColor || '#3b82f6') + `<path d="M43 72 Q50 78 57 72" fill="none" stroke="${skin}" stroke-width="2.5"/>`;
    }
  }

  function hat(id) {
    switch (id) {
      case 'beanie':
        return `<path d="M29 35 C29 13 71 13 71 35 Z" fill="#ef4444"/><rect x="28" y="30" width="44" height="7" rx="3" fill="#b91c1c"/><circle cx="50" cy="12" r="4.5" fill="#fecaca"/>`;
      case 'cap':
        return `<path d="M31 33 C31 16 69 16 69 33 Z" fill="#2563eb"/><ellipse cx="62" cy="33" rx="18" ry="3.2" fill="#1d4ed8"/><circle cx="50" cy="18" r="1.5" fill="#1e3a8a"/>`;
      case 'ears':
        return `<circle cx="32" cy="19" r="10" fill="#111"/><circle cx="68" cy="19" r="10" fill="#111"/>` +
          `<path d="M33 28 C38 20 62 20 67 28" fill="none" stroke="#111" stroke-width="3"/>` +
          `<path d="M50 20 L40 13 L40 27 Z M50 20 L60 13 L60 27 Z" fill="#ef4444"/><circle cx="50" cy="20" r="3" fill="#dc2626"/>` +
          `<circle cx="43" cy="17" r="1" fill="#fff"/><circle cx="57" cy="23" r="1" fill="#fff"/><text x="60" y="12" font-size="7" fill="#fde047">✦</text>`;
      case 'explorer':
        return `<ellipse cx="50" cy="29" rx="29" ry="5" fill="#a16207"/><path d="M35 29 C35 12 65 12 65 29 Z" fill="#ca8a04"/><rect x="35" y="24" width="30" height="4" fill="#78350f"/>`;
      case 'wizard':
        return `<path d="M50 -4 L71 29 L29 29 Z" fill="#1e40af"/><ellipse cx="50" cy="29" rx="25" ry="4.5" fill="#1e3a8a"/>` +
          `<text x="44" y="16" font-size="7" fill="#fde047">★</text><text x="52" y="25" font-size="5" fill="#fde047">☾</text>`;
      case 'crown':
        return `<path d="M33 30 L33 14 L41 22 L50 10 L59 22 L67 14 L67 30 Z" fill="#facc15" stroke="#ca8a04"/>` +
          `<circle cx="50" cy="22" r="2.2" fill="#ef4444"/><circle cx="40" cy="26" r="1.6" fill="#3b82f6"/><circle cx="60" cy="26" r="1.6" fill="#10b981"/>`;
      default:
        return '';
    }
  }

  function accessory(id) {
    switch (id) {
      case 'glasses':
        return `<circle cx="43" cy="44" r="5" fill="none" stroke="#111" stroke-width="1.4"/><circle cx="57" cy="44" r="5" fill="none" stroke="#111" stroke-width="1.4"/><line x1="48" y1="44" x2="52" y2="44" stroke="#111" stroke-width="1.4"/>`;
      case 'sunglasses':
        return `<rect x="37" y="40" width="11" height="7" rx="3" fill="#111"/><rect x="52" y="40" width="11" height="7" rx="3" fill="#111"/><line x1="48" y1="43" x2="52" y2="43" stroke="#111" stroke-width="1.5"/>`;
      case 'headphones':
        return `<path d="M30 45 C29 14 71 14 70 45" fill="none" stroke="#111827" stroke-width="3.5"/><rect x="25" y="39" width="8" height="13" rx="3" fill="#ef4444"/><rect x="67" y="39" width="8" height="13" rx="3" fill="#ef4444"/>`;
      case 'lanyard':
        return `<path d="M41 72 L50 88 L59 72" fill="none" stroke="#2563eb" stroke-width="1.8"/><rect x="45" y="86" width="10" height="12" rx="1.5" fill="#f8fafc" stroke="#94a3b8"/>` +
          `<circle cx="44" cy="78" r="1.8" fill="#f59e0b"/><circle cx="57" cy="79" r="1.8" fill="#ec4899"/><circle cx="47" cy="83" r="1.6" fill="#10b981"/>`;
      case 'bowtie':
        return `<path d="M50 74 L42 70 L42 78 Z M50 74 L58 70 L58 78 Z" fill="#dc2626"/><circle cx="50" cy="74" r="1.8" fill="#991b1b"/>`;
      default:
        return '';
    }
  }

  function svg(cfg, size, opts) {
    cfg = cfg || {};
    const skin = cfg.skin || SKINS[2];
    const hairColor = cfg.hairColor || '#2b1a10';
    const style = cfg.hair || 'short';
    const mood = (opts && opts.mood) || 'happy';
    const mouth = mood === 'sad'
      ? '<path d="M44 55 Q50 50 56 55" fill="none" stroke="#7f1d1d" stroke-width="1.6" stroke-linecap="round"/>'
      : mood === 'wow'
        ? '<ellipse cx="50" cy="54" rx="3" ry="3.6" fill="#7f1d1d"/>'
        : '<path d="M44 52 Q50 58 56 52" fill="none" stroke="#7f1d1d" stroke-width="1.6" stroke-linecap="round"/>';
    return `<svg class="avatar-svg" viewBox="0 0 100 100" width="${size || 64}" height="${size || 64}" aria-hidden="true">` +
      backHair(style, hairColor) +
      outfit(cfg.outfit || 'tee', cfg.shirtColor, skin) +
      `<rect x="44" y="58" width="12" height="15" rx="4" fill="${skin}"/>` +
      `<circle cx="32" cy="45" r="4" fill="${skin}"/><circle cx="68" cy="45" r="4" fill="${skin}"/>` +
      `<ellipse cx="50" cy="42" rx="18" ry="20" fill="${skin}"/>` +
      `<circle cx="43" cy="44" r="2.2" fill="#1f2937"/><circle cx="57" cy="44" r="2.2" fill="#1f2937"/>` +
      `<circle cx="43.8" cy="43.2" r="0.7" fill="#fff"/><circle cx="57.8" cy="43.2" r="0.7" fill="#fff"/>` +
      `<circle cx="39" cy="50" r="2.6" fill="#f472b6" opacity="0.25"/><circle cx="61" cy="50" r="2.6" fill="#f472b6" opacity="0.25"/>` +
      mouth +
      frontHair(style, hairColor) +
      accessory(cfg.accessory) +
      hat(cfg.hat) +
      `</svg>`;
  }

  function forCharacter(id, size, opts) {
    if (id === 'player') return svg(IS.state.playerAvatar(), size, opts);
    const c = IS.characters[id];
    return svg(c ? c.avatar : {}, size, opts);
  }

  return { svg, forCharacter, SKINS, HAIR_STYLES, HAIR_COLORS, SHIRT_COLORS };
})();
