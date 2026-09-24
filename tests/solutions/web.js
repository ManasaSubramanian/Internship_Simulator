// Reference pages for internship 7 (web). Test suite only.
const page = (body, head) => `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Guest App</title>\n${head || ''}</head>\n<body>\n${body}\n</body>\n</html>\n`;

module.exports = {
  h1: page(`  <main>
    <h2>Galaxy Coaster</h2>
    <p class="wait">25 min</p>
    <button type="button">Join Virtual Queue</button>
    <img src="coaster.png" alt="Galaxy Coaster rocket car climbing the lift hill">
  </main>`),
  h2: page(`  <main>
    <h1>Park Updates</h1>
    <form>
      <label for="name">Name</label>
      <input id="name" type="text" required>
      <label for="email">Email</label>
      <input id="email" type="email" required>
      <button type="submit">Sign up</button>
    </form>
  </main>`),
  h3: page(`  <main>
    <p>Status: <span id="status">Open</span></p>
    <button id="toggle" type="button" aria-pressed="false">Toggle</button>
  </main>
  <script>
    const btn = document.getElementById('toggle');
    const status = document.getElementById('status');
    btn.addEventListener('click', () => {
      const closed = status.textContent === 'Open';
      status.textContent = closed ? 'Closed' : 'Open';
      btn.setAttribute('aria-pressed', closed ? 'true' : 'false');
    });
  </script>`),
  h4: page(`  <main>
    <h1>Wait Times</h1>
    <ul id="board"></ul>
  </main>
  <script>
    const rides = [
      { name: 'Galaxy Coaster', wait: 45, open: true },
      { name: 'Sky Tram', wait: 10, open: true },
      { name: 'Haunted Manor', wait: 30, open: false },
      { name: 'River Rapids', wait: 25, open: true },
    ];
    const board = document.getElementById('board');
    rides.filter((r) => r.open).sort((a, b) => a.wait - b.wait).forEach((r) => {
      const li = document.createElement('li');
      li.textContent = r.name + ' — ' + r.wait + ' min';
      board.appendChild(li);
    });
  </script>`),
  h5: page(`  <main>
    <p class="notice">Fireworks start at 9:00 PM tonight!</p>
  </main>`, `  <style>
    .notice { color: #2a211b; background: #fbf6ee; padding: 12px; }
  </style>
`),
  h6: page(`  <main>
    <label for="search">Search attractions</label>
    <input id="search" type="search">
    <ul id="list">
      <li>Galaxy Coaster</li>
      <li>Sky Tram</li>
      <li>River Rapids</li>
      <li>Castle Carousel</li>
    </ul>
  </main>
  <script>
    const search = document.getElementById('search');
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('#list li').forEach((li) => {
        li.hidden = !li.textContent.toLowerCase().includes(q);
      });
    });
  </script>`),
  h7: page(`  <main>
    <h1 id="greeting"></h1>
  </main>
  <script>
    window.greet = function (name) {
      document.getElementById('greeting').textContent = 'Welcome, ' + name + '!';
    };
    greet('Guest');
  </script>`),
  h8: page(`  <main>
    <div id="notify" class="switch" role="switch" tabindex="0" aria-checked="false">Ride alerts</div>
  </main>
  <script>
    const sw = document.getElementById('notify');
    const toggle = () => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    sw.addEventListener('click', toggle);
    sw.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  </script>`),
  h9: page(`  <main>
    <button id="open" type="button">Book Dining</button>
    <div id="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" hidden>
      <h2 id="dlg-title">Confirm your reservation</h2>
      <button id="close" type="button">Close</button>
    </div>
  </main>
  <script>
    const dialog = document.getElementById('dialog');
    document.getElementById('open').addEventListener('click', () => { dialog.hidden = false; });
    document.getElementById('close').addEventListener('click', () => { dialog.hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dialog.hidden = true; });
  </script>`),
  h10: page(`  <main>
    <label for="party">Party size</label>
    <input id="party" type="number" aria-describedby="party-error">
    <p id="party-error" aria-live="polite"></p>
  </main>
  <script>
    const input = document.getElementById('party');
    const err = document.getElementById('party-error');
    input.addEventListener('input', () => {
      const n = Number(input.value);
      const ok = input.value !== '' && Number.isInteger(n) && n >= 1 && n <= 12;
      err.textContent = ok ? '' : 'Party size must be 1–12';
    });
  </script>`),
  h11: page(`  <main>
    <button id="pay" type="button">Pay $129</button>
  </main>
  <script>
    window.charges = 0;
    window.charge = function () { window.charges += 1; };
    const pay = document.getElementById('pay');
    pay.addEventListener('click', () => {
      if (pay.disabled) return;
      pay.disabled = true;
      pay.textContent = 'Processing…';
      window.charge();
    });
  </script>`),
  h12: page(`  <main>
    <p id="sample"></p>
  </main>
  <script>
    window.formatWait = function (m) {
      if (m === 0) return 'Walk right on!';
      if (m < 60) return m + ' min';
      const h = Math.floor(m / 60);
      const r = m % 60;
      return r ? h + ' hr ' + r + ' min' : h + ' hr';
    };
    document.getElementById('sample').textContent = window.formatWait(65);
  </script>`),
  'i-web1': page(`  <main>
    <ul>
      <li><img src="castle.jpg" alt="Castle at sunset"></li>
      <li><img src="coaster.jpg" alt="Coaster cresting the first hill"></li>
      <li><img src="parade.jpg" alt="Parade floats on Main Street"></li>
    </ul>
  </main>`),
  'i-web2': page(`  <main>
    <p>Guests: <span id="count">0</span></p>
    <button id="add" type="button">Add guest</button>
  </main>
  <script>
    const count = document.getElementById('count');
    document.getElementById('add').addEventListener('click', () => {
      count.textContent = Number(count.textContent) + 1;
    });
  </script>`),
  'i-web3': page(`  <main>
    <label for="phone">Phone number</label>
    <input id="phone" type="tel">
  </main>`),
};
