const { chromium } = require('playwright');
(async () => {
  const ids = process.argv.slice(3);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(process.argv[2]) + '#home');
  await p.waitForFunction(() => typeof window.pyTests === 'function', null, { timeout: 60000 });
  const out = await p.evaluate(async (ids) => {
    const res = [];
    const probs = window.DATA.problems.filter(P => (P.govtech || P.al) && (!ids.length || ids.includes(P.id)));
    for (const P of probs) {
      const tests = P.tests.concat(P.perf ? [{ label: P.perf.label, gen: P.perf.gen, expected: P.perf.expected, cat: 'large' }] : []);
      const t0 = performance.now();
      let r;
      try { r = JSON.parse(window.pyTests(window.__instrument(P.solution), JSON.stringify(tests), 'solution')); } catch (e) { r = { compile: String(e), results: [] }; }
      const bad = (r.results || []).filter(x => x.status !== 'pass');
      const perf = (r.results || []).find(x => /performance/.test(x.label));
      res.push(P.id + ': ' + (r.compile ? 'COMPILE ' + r.compile.slice(0, 200) : (r.results.length - bad.length) + '/' + r.results.length + ' pass' + (perf ? ', perf ' + perf.ms + ' ms' : '') + ', total ' + Math.round(performance.now() - t0) + ' ms' + (bad.length ? '  FAIL: ' + bad.map(x => x.label + ' [' + x.status + '] got ' + x.got + ' exp ' + x.expected + (x.error ? ' ' + x.error.slice(-160) : '')).join(' | ') : '')));
      await new Promise(r => setTimeout(r, 10));
    }
    return res;
  }, ids);
  console.log(out.join('\n'));
  await b.close();
})();
