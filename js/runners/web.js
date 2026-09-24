// Web runner: renders your HTML/CSS/JS page in an iframe, then runs DOM checks
// against it (structure, accessibility and behavior such as clicks and keys).
// A check is { label, fn(doc, win) -> boolean | Promise<boolean>, hidden? }.
(function (root) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function load(frame, html) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        setTimeout(resolve, 60);
      };
      frame.onload = finish;
      frame.srcdoc = html;
      setTimeout(finish, 1500);
    });
  }

  async function runChecks(checks, doc, win) {
    const results = [];
    for (const c of checks) {
      let pass = false;
      let got = '';
      try {
        pass = !!(await c.fn(doc, win));
      } catch (e) {
        got = 'error: ' + e.message;
      }
      results.push({ pass, got: got || (pass ? 'passed' : 'failed'), label: c.label, hidden: !!c.hidden });
    }
    return results;
  }

  // preview: an iframe to render into (optional). A fresh hidden frame is used for grading.
  async function run(task, html, preview, which) {
    if (preview) await load(preview, html);
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:600px;';
    document.body.appendChild(frame);
    const errors = [];
    try {
      await load(frame, html);
      frame.contentWindow.addEventListener('error', (e) => errors.push(e.message));
      const checks = which === 'visible' ? task.checks.filter((c) => !c.hidden) : task.checks;
      const results = await runChecks(checks, frame.contentDocument, frame.contentWindow);
      return { results, logs: errors };
    } catch (e) {
      return { error: 'Could not run the page: ' + e.message, logs: errors };
    } finally {
      frame.remove();
    }
  }

  const api = { run, runChecks, wait, label: 'HTML / CSS / JavaScript' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.web = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
