// A simulated Linux shell with an in-memory filesystem. Supports pipes (|),
// redirection (> >> <), sequencing (&& ;), globbing (* ?), quoting, $VARS and
// ~40 common commands. Terminal tasks are graded by checking objectives
// against the filesystem and the commands you ran.
(function (root) {
  const HOME = '/home/intern';

  function modeStr(mode, dir) {
    const bits = String(mode).padStart(3, '0').split('').map(Number);
    return (dir ? 'd' : '-') + bits.map((b) => (b & 4 ? 'r' : '-') + (b & 2 ? 'w' : '-') + (b & 1 ? 'x' : '-')).join('');
  }

  function globToRe(g) {
    return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  }

  function create(spec) {
    spec = spec || {};
    const nodes = {};
    const env = { HOME, USER: 'intern', PWD: HOME, SHELL: '/bin/bash' };
    let cwd = spec.cwd || HOME;
    const history = [];
    let procs = (spec.procs || []).map((p) => Object.assign({}, p));
    const capacity = spec.capacity || 0;

    // ── filesystem ───────────────────────────────────────
    function norm(p) {
      if (p == null || p === '') return cwd;
      p = String(p);
      if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
      if (!p.startsWith('/')) p = (cwd === '/' ? '' : cwd) + '/' + p;
      const out = [];
      p.split('/').forEach((seg) => {
        if (!seg || seg === '.') return;
        if (seg === '..') out.pop();
        else out.push(seg);
      });
      return '/' + out.join('/');
    }
    const parent = (p) => (p === '/' ? '/' : p.slice(0, p.lastIndexOf('/')) || '/');
    const base = (p) => p.slice(p.lastIndexOf('/') + 1);
    const exists = (p) => !!nodes[norm(p)];
    const isDir = (p) => { const n = nodes[norm(p)]; return !!n && n.type === 'dir'; };
    const isFile = (p) => { const n = nodes[norm(p)]; return !!n && n.type === 'file'; };
    const read = (p) => { const n = nodes[norm(p)]; return n && n.type === 'file' ? n.content : null; };
    function mkdirp(p) {
      p = norm(p);
      if (p === '/') { nodes['/'] = nodes['/'] || { type: 'dir', mode: '755' }; return; }
      mkdirp(parent(p));
      if (!nodes[p]) nodes[p] = { type: 'dir', mode: '755' };
    }
    function write(p, content, append) {
      p = norm(p);
      const n = nodes[p];
      if (n && n.type === 'dir') throw new Error(base(p) + ': Is a directory');
      if (!isDir(parent(p))) throw new Error(p + ': No such file or directory');
      if (n) n.content = append ? n.content + content : content;
      else nodes[p] = { type: 'file', content, mode: '644' };
    }
    function children(dir) {
      dir = norm(dir);
      const pre = dir === '/' ? '/' : dir + '/';
      return Object.keys(nodes).filter((k) => k !== dir && k.startsWith(pre) && !k.slice(pre.length).includes('/')).map(base).sort();
    }
    function walk(p) {
      p = norm(p);
      const out = [p];
      if (isDir(p)) children(p).forEach((c) => out.push(...walk((p === '/' ? '' : p) + '/' + c)));
      return out;
    }
    function remove(p) {
      walk(p).forEach((k) => delete nodes[k]);
    }
    function copy(src, dst) {
      src = norm(src);
      dst = norm(dst);
      walk(src).forEach((k) => {
        const rel = k.slice(src.length);
        nodes[dst + rel] = JSON.parse(JSON.stringify(nodes[k]));
      });
    }
    const size = (p) => { const n = nodes[norm(p)]; return n ? (n.type === 'file' ? n.content.length : 4096) : 0; };
    const totalBytes = () => Object.keys(nodes).reduce((a, k) => a + (nodes[k].type === 'file' ? nodes[k].content.length : 0), 0);

    mkdirp('/');
    ['/bin', '/etc', '/home', HOME, '/tmp', '/var', '/var/log', '/srv', '/opt'].forEach(mkdirp);
    (spec.dirs || []).forEach(mkdirp);
    Object.keys(spec.files || {}).forEach((p) => {
      const f = spec.files[p];
      mkdirp(parent(norm(p)));
      nodes[norm(p)] = { type: 'file', content: typeof f === 'string' ? f : f.content, mode: (typeof f === 'object' && f.mode) || '644' };
    });

    // ── parsing ──────────────────────────────────────────
    function splitTop(line, seps) {
      const parts = [];
      let cur = '';
      let q = null;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (q) {
          cur += c;
          if (c === q) q = null;
          continue;
        }
        if (c === '"' || c === "'") {
          q = c;
          cur += c;
          continue;
        }
        const sep = seps.find((s) => line.startsWith(s, i));
        if (sep) {
          parts.push({ text: cur, sep });
          cur = '';
          i += sep.length - 1;
          continue;
        }
        cur += c;
      }
      parts.push({ text: cur, sep: null });
      return parts;
    }

    function tokenize(s) {
      const toks = [];
      let cur = '';
      let quoted = false;
      let has = false;
      let q = null;
      const expand = (str) => str.replace(/\$(\w+)|\$\{(\w+)\}/g, (m, a, b) => env[a || b] || '');
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (q) {
          if (c === q) { q = null; continue; }
          cur += q === '"' && c === '$' ? c : c;
          continue;
        }
        if (c === '"' || c === "'") {
          q = c;
          quoted = true;
          has = true;
          if (c === "'") {
            const end = s.indexOf("'", i + 1);
            cur += end === -1 ? s.slice(i + 1) : s.slice(i + 1, end);
            i = end === -1 ? s.length : end;
            q = null;
          }
          continue;
        }
        if (/\s/.test(c)) {
          if (has) toks.push({ v: quoted ? cur : expand(cur), quoted });
          cur = '';
          quoted = false;
          has = false;
          continue;
        }
        if ((c === '>' || c === '<') && !quoted) {
          if (has) toks.push({ v: expand(cur), quoted });
          cur = '';
          has = false;
          quoted = false;
          if (c === '>' && s[i + 1] === '>') { toks.push({ op: '>>' }); i++; } else toks.push({ op: c });
          continue;
        }
        cur += c;
        has = true;
      }
      if (has) toks.push({ v: quoted ? cur : expand(cur), quoted });
      return toks;
    }

    function glob(tok) {
      if (tok.quoted || !/[*?]/.test(tok.v)) return [tok.v];
      const p = tok.v;
      const dirPart = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) || '/' : '';
      const pat = p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p;
      const re = globToRe(pat);
      const dir = dirPart ? norm(dirPart) : cwd;
      if (!isDir(dir)) return [p];
      const hits = children(dir).filter((n) => re.test(n) && !(n.startsWith('.') && !pat.startsWith('.')));
      if (!hits.length) return [p];
      return hits.map((n) => (dirPart ? (dirPart === '/' ? '' : dirPart) + '/' + n : n));
    }

    // ── commands ─────────────────────────────────────────
    const out = (s) => ({ out: s, err: '' });
    const err = (s) => ({ out: '', err: s });
    function flags(args, allowed) {
      const f = {};
      const rest = [];
      args.forEach((a) => {
        if (/^-[a-zA-Z]+$/.test(a) && a.length > 1 && [...a.slice(1)].every((c) => allowed.includes(c))) [...a.slice(1)].forEach((c) => { f[c] = true; });
        else rest.push(a);
      });
      return { f, rest };
    }
    const lines = (s) => (s === '' ? [] : s.replace(/\n$/, '').split('\n'));
    const joinL = (a) => (a.length ? a.join('\n') + '\n' : '');
    function inputOf(files, stdin, cmd) {
      if (!files.length) return { text: stdin || '' };
      let text = '';
      for (const f of files) {
        if (!exists(f)) return { e: `${cmd}: ${f}: No such file or directory\n` };
        if (isDir(f)) return { e: `${cmd}: ${f}: Is a directory\n` };
        text += read(f);
      }
      return { text };
    }

    const C = {};
    C.pwd = () => out(cwd + '\n');
    C.cd = (a) => {
      const p = norm(a[0] || HOME);
      if (!exists(p)) return err(`cd: ${a[0]}: No such file or directory\n`);
      if (!isDir(p)) return err(`cd: ${a[0]}: Not a directory\n`);
      cwd = p;
      env.PWD = p;
      return out('');
    };
    C.ls = (a) => {
      const { f, rest } = flags(a, 'laS1htr');
      const targets = rest.length ? rest : ['.'];
      const res = [];
      let e = '';
      targets.forEach((t, ti) => {
        const p = norm(t);
        if (!exists(p)) { e += `ls: cannot access '${t}': No such file or directory\n`; return; }
        let names = isDir(p) ? children(p).filter((n) => f.a || !n.startsWith('.')) : [t];
        const full = (n) => (isDir(p) ? (p === '/' ? '' : p) + '/' + n : p);
        if (f.S) names.sort((x, y) => size(full(y)) - size(full(x)) || (x < y ? -1 : 1));
        if (f.r) names.reverse();
        if (targets.length > 1 && isDir(p)) res.push((ti ? '\n' : '') + t + ':');
        if (f.l) {
          if (isDir(p)) res.push('total ' + names.length * 4);
          names.forEach((n) => {
            const nd = nodes[full(n)];
            const sz = f.h ? human(size(full(n))) : String(size(full(n)));
            res.push(`${modeStr(nd.mode, nd.type === 'dir')} 1 intern staff ${sz.padStart(6)} Jun 14 09:00 ${n}`);
          });
        } else res.push(...names);
      });
      return { out: joinL(res), err: e };
    };
    function human(b) {
      if (b >= 1048576) return (b / 1048576).toFixed(1) + 'M';
      if (b >= 1024) return (b / 1024).toFixed(1) + 'K';
      return String(b);
    }
    C.cat = (a, stdin) => {
      const r = inputOf(a, stdin, 'cat');
      return r.e ? err(r.e) : out(r.text);
    };
    C.echo = (a) => out(a.join(' ') + '\n');
    C.mkdir = (a) => {
      const { f, rest } = flags(a, 'p');
      let e = '';
      rest.forEach((d) => {
        const p = norm(d);
        if (exists(p)) { if (!f.p) e += `mkdir: cannot create directory '${d}': File exists\n`; return; }
        if (!f.p && !isDir(parent(p))) { e += `mkdir: cannot create directory '${d}': No such file or directory\n`; return; }
        mkdirp(p);
      });
      return err(e);
    };
    C.touch = (a) => {
      let e = '';
      a.forEach((x) => { if (!exists(x)) { try { write(x, ''); } catch (ex) { e += 'touch: ' + ex.message + '\n'; } } });
      return err(e);
    };
    C.rm = (a) => {
      const { f, rest } = flags(a, 'rRf');
      let e = '';
      rest.forEach((x) => {
        const p = norm(x);
        if (!exists(p)) { if (!f.f) e += `rm: cannot remove '${x}': No such file or directory\n`; return; }
        if (isDir(p) && !(f.r || f.R)) { e += `rm: cannot remove '${x}': Is a directory\n`; return; }
        if (p === '/' || p === HOME) { e += `rm: refusing to remove '${x}'\n`; return; }
        remove(p);
      });
      return err(e);
    };
    function cpmv(a, move) {
      const { f, rest } = flags(a, 'rRf');
      const name = move ? 'mv' : 'cp';
      if (rest.length < 2) return err(`${name}: missing destination file operand\n`);
      const dst = rest.pop();
      const dstDir = isDir(dst);
      if (rest.length > 1 && !dstDir) return err(`${name}: target '${dst}' is not a directory\n`);
      let e = '';
      rest.forEach((src) => {
        if (!exists(src)) { e += `${name}: cannot stat '${src}': No such file or directory\n`; return; }
        if (isDir(src) && !move && !(f.r || f.R)) { e += `cp: -r not specified; omitting directory '${src}'\n`; return; }
        const target = dstDir ? norm(dst) + '/' + base(norm(src)) : norm(dst);
        if (!isDir(parent(target))) { e += `${name}: cannot create '${dst}': No such file or directory\n`; return; }
        copy(src, target);
        if (move) remove(src);
      });
      return err(e);
    }
    C.cp = (a) => cpmv(a, false);
    C.mv = (a) => cpmv(a, true);
    C.chmod = (a) => {
      if (a.length < 2) return err('chmod: missing operand\n');
      const m = a[0];
      let e = '';
      a.slice(1).forEach((x) => {
        const p = norm(x);
        const n = nodes[p];
        if (!n) { e += `chmod: cannot access '${x}': No such file or directory\n`; return; }
        if (/^[0-7]{3}$/.test(m)) { n.mode = m; return; }
        const mm = m.match(/^([ugoa]*)([+\-=])([rwx]+)$/);
        if (!mm) { e += `chmod: invalid mode: '${m}'\n`; return; }
        const who = mm[1] || 'a';
        const bit = [...mm[3]].reduce((s, c) => s | { r: 4, w: 2, x: 1 }[c], 0);
        const digits = n.mode.split('').map(Number);
        const idx = { u: [0], g: [1], o: [2], a: [0, 1, 2] };
        [...who].forEach((w) => idx[w].forEach((i) => {
          if (mm[2] === '+') digits[i] |= bit;
          else if (mm[2] === '-') digits[i] &= ~bit;
          else digits[i] = bit;
        }));
        n.mode = digits.join('');
      });
      return err(e);
    };
    C.grep = (a, stdin) => {
      const { f, rest } = flags(a, 'ivcnlrEw');
      if (!rest.length) return err('Usage: grep [OPTION]... PATTERNS [FILE]...\n');
      const pat = rest.shift();
      let re;
      try { re = new RegExp(f.w ? '\\b(?:' + pat + ')\\b' : pat, f.i ? 'i' : ''); } catch (e) { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), f.i ? 'i' : ''); }
      let files = rest;
      if (f.r) files = [].concat(...(files.length ? files : ['.']).map((x) => walk(x).filter(isFile)));
      const multi = files.length > 1 || f.r;
      const res = [];
      let e = '';
      const doText = (text, label) => {
        const hits = lines(text).map((l, i) => [l, i]).filter(([l]) => re.test(l) !== !!f.v);
        if (f.l) { if (hits.length) res.push(label); return; }
        if (f.c) { res.push((multi ? label + ':' : '') + hits.length); return; }
        hits.forEach(([l, i]) => res.push((multi ? label + ':' : '') + (f.n ? i + 1 + ':' : '') + l));
      };
      if (!files.length) doText(stdin || '', '(standard input)');
      files.forEach((x) => {
        if (!exists(x)) { e += `grep: ${x}: No such file or directory\n`; return; }
        if (isDir(x)) { e += `grep: ${x}: Is a directory\n`; return; }
        doText(read(x), x);
      });
      return { out: joinL(res), err: e };
    };
    function headTail(a, stdin, tail) {
      let n = 10;
      let from = null;
      const files = [];
      for (let i = 0; i < a.length; i++) {
        if (a[i] === '-n' && /^\+\d+$/.test(a[i + 1] || '')) from = parseInt(a[++i].slice(1), 10);
        else if (a[i] === '-n') n = parseInt(a[++i], 10);
        else if (/^-n\d+$/.test(a[i])) n = parseInt(a[i].slice(2), 10);
        else if (/^-\d+$/.test(a[i])) n = parseInt(a[i].slice(1), 10);
        else files.push(a[i]);
      }
      const r = inputOf(files, stdin, tail ? 'tail' : 'head');
      if (r.e) return err(r.e);
      const L = lines(r.text);
      if (tail && from != null) return out(joinL(L.slice(Math.max(0, from - 1))));
      return out(joinL(tail ? L.slice(Math.max(0, L.length - n)) : L.slice(0, n)));
    }
    C.head = (a, s) => headTail(a, s, false);
    C.tail = (a, s) => headTail(a, s, true);
    C.wc = (a, stdin) => {
      const { f, rest } = flags(a, 'lwc');
      const one = (text) => {
        const L = lines(text).length;
        const W = (text.match(/\S+/g) || []).length;
        const B = text.length;
        if (f.l && !f.w && !f.c) return String(L);
        if (f.w && !f.l && !f.c) return String(W);
        if (f.c && !f.l && !f.w) return String(B);
        return [L, W, B].join(' ');
      };
      if (!rest.length) return out(one(stdin || '') + '\n');
      const res = [];
      let e = '';
      rest.forEach((x) => {
        if (!isFile(x)) { e += `wc: ${x}: No such file or directory\n`; return; }
        res.push(one(read(x)) + ' ' + x);
      });
      return { out: joinL(res), err: e };
    };
    C.sort = (a, stdin) => {
      const { f, rest } = flags(a, 'nruf');
      const r = inputOf(rest, stdin, 'sort');
      if (r.e) return err(r.e);
      let L = lines(r.text);
      L.sort((x, y) => {
        if (f.n) return (parseFloat(x) || 0) - (parseFloat(y) || 0) || (x < y ? -1 : x > y ? 1 : 0);
        const a2 = f.f ? x.toLowerCase() : x;
        const b2 = f.f ? y.toLowerCase() : y;
        return a2 < b2 ? -1 : a2 > b2 ? 1 : 0;
      });
      if (f.r) L.reverse();
      if (f.u) L = L.filter((x, i) => i === 0 || x !== L[i - 1]);
      return out(joinL(L));
    };
    C.uniq = (a, stdin) => {
      const { f, rest } = flags(a, 'c');
      const r = inputOf(rest, stdin, 'uniq');
      if (r.e) return err(r.e);
      const res = [];
      lines(r.text).forEach((l) => {
        const lastR = res[res.length - 1];
        if (lastR && lastR[0] === l) lastR[1]++;
        else res.push([l, 1]);
      });
      return out(joinL(res.map(([l, n]) => (f.c ? String(n).padStart(7) + ' ' + l : l))));
    };
    C.cut = (a, stdin) => {
      let d = '\t';
      let spec = null;
      const files = [];
      for (let i = 0; i < a.length; i++) {
        if (a[i] === '-d') d = a[++i];
        else if (a[i].startsWith('-d')) d = a[i].slice(2);
        else if (a[i] === '-f') spec = a[++i];
        else if (a[i].startsWith('-f')) spec = a[i].slice(2);
        else files.push(a[i]);
      }
      if (!spec) return err('cut: you must specify a list of fields\n');
      const want = [];
      spec.split(',').forEach((p) => {
        const m = p.match(/^(\d*)-(\d*)$/);
        if (m) for (let k = +(m[1] || 1); k <= +(m[2] || 99); k++) want.push(k);
        else want.push(+p);
      });
      const r = inputOf(files, stdin, 'cut');
      if (r.e) return err(r.e);
      return out(joinL(lines(r.text).map((l) => {
        const parts = l.split(d);
        return parts.length === 1 ? l : want.filter((k) => k <= parts.length).map((k) => parts[k - 1]).join(d);
      })));
    };
    C.find = (a) => {
      let start = '.';
      let i = 0;
      if (a[0] && !a[0].startsWith('-')) { start = a[0]; i = 1; }
      let name = null;
      let type = null;
      let del = false;
      for (; i < a.length; i++) {
        if (a[i] === '-name' || a[i] === '-iname') name = globToRe(a[++i]);
        else if (a[i] === '-type') type = a[++i];
        else if (a[i] === '-delete') del = true;
      }
      if (!exists(start)) return err(`find: '${start}': No such file or directory\n`);
      const absStart = norm(start);
      const hits = walk(absStart).filter((p) => (!name || name.test(base(p))) && (!type || (type === 'f' ? isFile(p) : isDir(p))));
      const shown = hits.map((p) => (start.startsWith('/') ? p : (start === '.' ? '.' : start.replace(/\/$/, '')) + p.slice(absStart.length)));
      if (del) {
        hits.slice().reverse().forEach((p) => { if (exists(p)) remove(p); });
        return out('');
      }
      return out(joinL(shown));
    };
    C.du = (a) => {
      const { f, rest } = flags(a, 'ahs');
      const targets = rest.length ? rest : ['.'];
      const res = [];
      const kb = (b) => (f.h ? human(b) : String(Math.ceil(b / 1024)));
      targets.forEach((t) => {
        if (!exists(t)) return;
        const all = walk(t).filter(isFile);
        if (f.a && !f.s) all.forEach((p) => res.push(kb(size(p)) + '\t' + (t.startsWith('/') ? p : p.replace(norm(t), t))));
        res.push(kb(all.reduce((s, p) => s + size(p), 0)) + '\t' + t);
      });
      return out(joinL(res));
    };
    C.df = () => {
      const used = capacity ? Math.min(99, Math.round(totalBytes() / capacity * 100)) : 41;
      return out(`Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  ${(used / 5).toFixed(1)}G  ${(20 - used / 5).toFixed(1)}G  ${used}% /\n`);
    };
    C.ps = () => out(joinL(['  PID TTY      %CPU COMMAND'].concat(procs.map((p) => `${String(p.pid).padStart(5)} ?        ${String(p.cpu).padStart(4)} ${p.name}`))));
    C.kill = (a) => {
      const pid = parseInt(a.filter((x) => !x.startsWith('-'))[0], 10);
      const p = procs.find((x) => x.pid === pid);
      if (!p) return err(`kill: (${a[a.length - 1]}) - No such process\n`);
      procs = procs.filter((x) => x !== p);
      return out('');
    };
    C.whoami = () => out('intern\n');
    C.hostname = () => out('showctl-01\n');
    C.date = () => out('Mon Jun 14 09:00:00 EDT 2027\n');
    C.uname = (a) => out(a.includes('-a') ? 'Linux showctl-01 6.1.0 #1 SMP x86_64 GNU/Linux\n' : 'Linux\n');
    C.history = () => out(joinL(history.map((h, i) => String(i + 1).padStart(5) + '  ' + h.cmd)));
    C.clear = () => ({ out: '', err: '', clear: true });
    C.sed = (a, stdin) => {
      let inplace = false;
      const rest = [];
      a.forEach((x) => { if (x === '-i') inplace = true; else rest.push(x); });
      const expr = rest.shift();
      const m = expr && expr.match(/^s(.)(.*?)\1(.*?)\1(g?)$/);
      if (!m) return err('sed: only s/pattern/replacement/[g] is supported here\n');
      let re;
      try { re = new RegExp(m[2], m[4] ? 'g' : ''); } catch (e) { return err('sed: bad regex\n'); }
      if (inplace) {
        let e = '';
        rest.forEach((x) => { if (!isFile(x)) e += `sed: can't read ${x}: No such file or directory\n`; else write(x, lines(read(x)).map((l) => l.replace(re, m[3])).join('\n') + '\n'); });
        return err(e);
      }
      const r = inputOf(rest, stdin, 'sed');
      if (r.e) return err(r.e);
      return out(joinL(lines(r.text).map((l) => l.replace(re, m[3]))));
    };
    C.tr = (a, stdin) => {
      if (a[0] === '-d') return out((stdin || '').split('').filter((c) => !a[1].includes(c)).join(''));
      const from = (a[0] || '').replace('a-z', 'abcdefghijklmnopqrstuvwxyz').replace('A-Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const to = (a[1] || '').replace('a-z', 'abcdefghijklmnopqrstuvwxyz').replace('A-Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      return out((stdin || '').split('').map((c) => { const i = from.indexOf(c); return i === -1 ? c : to[Math.min(i, to.length - 1)]; }).join(''));
    };
    C.tee = (a, stdin) => {
      const { f, rest } = flags(a, 'a');
      rest.forEach((x) => write(x, stdin || '', f.a));
      return out(stdin || '');
    };
    C.man = (a) => out(a[0] && HELP[a[0]] ? `${a[0]}: ${HELP[a[0]]}\n` : 'What manual page do you want? Try: man grep\n');
    C.help = () => out('Available commands:\n' + Object.keys(HELP).map((k) => '  ' + k.padEnd(8) + HELP[k]).join('\n') + '\n');
    C.sh = (a) => {
      const file = a[0];
      if (!file || !isFile(file)) return err(`sh: ${file}: No such file or directory\n`);
      const args = a.slice(1);
      let o = '';
      lines(read(file)).forEach((l) => {
        if (!l.trim() || l.trim().startsWith('#')) return;
        const line = l.replace(/\$(\d)/g, (m, d) => args[+d - 1] || '');
        const r = execLine(line);
        o += r.out;
      });
      return out(o);
    };
    C.bash = C.sh;
    C.true = () => out('');
    C.exit = () => out('logout (just kidding, you are still here)\n');

    const HELP = {
      pwd: 'print working directory', cd: 'change directory', ls: 'list files (-l long, -a all, -S by size, -h human)', cat: 'print files',
      echo: 'print text', mkdir: 'make directory (-p parents)', touch: 'create empty file', rm: 'remove (-r recursive, -f force)',
      cp: 'copy (-r for directories)', mv: 'move / rename', chmod: 'change mode (755, +x, go-w)', grep: 'search text (-i -v -c -n -l -r)',
      head: 'first lines (-n N)', tail: 'last lines (-n N)', wc: 'count (-l lines, -w words, -c bytes)', sort: 'sort lines (-n -r -u)',
      uniq: 'collapse repeats (-c count)', cut: 'cut fields (-d , -f 1)', find: 'find files (-name "*.log" -type f -delete)',
      du: 'disk usage (-a all, -h human, -s summary)', df: 'free disk space', ps: 'list processes', kill: 'stop a process by PID',
      sed: "replace text: sed 's/old/new/g' file (-i edit in place)", tr: 'translate characters', tee: 'write stdin to file and screen',
      sh: 'run a script file', history: 'show command history', clear: 'clear the screen', whoami: 'current user', man: 'manual for a command',
    };

    // ── execution ────────────────────────────────────────
    function runPipeline(text) {
      const stages = splitTop(text, ['|']).map((p) => p.text.trim()).filter((x) => x !== '');
      let stdin = null;
      let errs = '';
      let result = { out: '', err: '' };
      for (const stage of stages) {
        const toks = tokenize(stage);
        const args = [];
        let outFile = null;
        let append = false;
        let inFile = null;
        for (let i = 0; i < toks.length; i++) {
          const t = toks[i];
          if (t.op === '>' || t.op === '>>') {
            const nt = toks[++i];
            if (!nt) return { out: '', err: 'bash: syntax error near unexpected token `newline\'\n' };
            if (args.length && args[args.length - 1] === '2') { args.pop(); continue; }
            outFile = nt.v;
            append = t.op === '>>';
          } else if (t.op === '<') {
            inFile = (toks[++i] || {}).v;
          } else args.push(...glob(t));
        }
        if (!args.length) {
          if (outFile && outFile !== '/dev/null') {
            try { write(outFile, '', append); } catch (e) { errs += 'bash: ' + e.message + '\n'; }
          }
          continue;
        }
        const cmd = args.shift();
        let fn = C[cmd];
        if (!fn && cmd.includes('/')) {
          if (!isFile(cmd)) fn = () => err(`bash: ${cmd}: No such file or directory\n`);
          else if (!(parseInt(nodes[norm(cmd)].mode[0], 10) & 1)) fn = () => err(`bash: ${cmd}: Permission denied\n`);
          else fn = (ar) => C.sh([cmd].concat(ar));
        }
        if (inFile) {
          if (!isFile(inFile)) return { out: '', err: `bash: ${inFile}: No such file or directory\n` };
          stdin = read(inFile);
        }
        if (!fn) {
          result = err(`bash: ${cmd}: command not found\n`);
        } else {
          try {
            result = fn(args, stdin);
          } catch (e) {
            result = err(cmd + ': ' + e.message + '\n');
          }
        }
        errs += result.err || '';
        if (outFile) {
          if (outFile !== '/dev/null') {
            try { write(outFile, result.out, append); } catch (e) { errs += 'bash: ' + e.message + '\n'; }
          }
          result = { out: '', err: '', clear: result.clear };
        }
        stdin = result.out;
      }
      return { out: result.out || '', err: errs, clear: result.clear };
    }

    function execLine(line) {
      let o = '';
      let clear = false;
      let okPrev = true;
      let skip = false;
      splitTop(line, ['&&', ';']).forEach((part) => {
        if (skip) { skip = part.sep === '&&'; return; }
        const r = runPipeline(part.text.trim());
        o += (r.out || '') + (r.err || '');
        if (r.clear) { clear = true; o = ''; }
        okPrev = !r.err;
        if (part.sep === '&&' && !okPrev) skip = true;
      });
      return { out: o, clear };
    }

    function exec(line) {
      const r = execLine(line);
      history.push({ cmd: line, out: r.out, cwd });
      return r;
    }

    return {
      exec, norm, exists, isDir, isFile, read, children, walk, size, history, procs: () => procs,
      mode: (p) => (nodes[norm(p)] ? nodes[norm(p)].mode : null),
      cwd: () => cwd,
      prompt: () => `intern@showctl:${cwd === HOME ? '~' : cwd.startsWith(HOME + '/') ? '~' + cwd.slice(HOME.length) : cwd}$ `,
      snapshot: () => JSON.stringify({ nodes, cwd, history, procs }),
      restore(json) {
        const d = JSON.parse(json);
        Object.keys(nodes).forEach((k) => delete nodes[k]);
        Object.assign(nodes, d.nodes);
        cwd = d.cwd;
        env.PWD = cwd;
        history.length = 0;
        history.push(...d.history);
        procs = d.procs || [];
      },
      // Helpers for objective checks
      ranOutput(text) {
        const want = String(text).trim();
        return history.some((h) => h.out.split('\n').some((l) => l.trim() === want) || h.out.trim() === want);
      },
      ran(re) {
        return history.some((h) => re.test(h.cmd));
      },
    };
  }

  // objectives: [{ text, check(sh) }]
  function grade(task, sh) {
    const results = task.objectives.map((o) => {
      let pass = false;
      try { pass = !!o.check(sh); } catch (e) { pass = false; }
      return { pass, got: pass ? 'done' : 'not yet', label: o.text };
    });
    return { results, logs: [] };
  }

  const api = { create, grade, HOME, label: 'Bash (simulated)' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.shell = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
