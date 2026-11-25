// node sweep.js [page.html]  visits every page at desktop and phone width, light and dark; reports JS errors, broken links, overflow
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const page = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'));
  const b = await chromium.launch(); const errs = [], probs = [];
  for (const [w, h, scheme] of [[1280, 900, 'light'], [390, 844, 'dark']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme });
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + page + '#home'); await p.waitForTimeout(400);
    const hashes = await p.evaluate(() => ['home', 'ds', 'algo', 'sd', 'which'].concat(EXPLAIN.topics().map(t => 'x-' + t.id)));
    for (const hs of hashes) {
      await p.evaluate(x => { location.hash = x; }, hs); await p.waitForTimeout(60);
      const r = await p.evaluate(() => {
        const out = [], vw = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth > vw + 2) out.push('page wider than screen (' + document.documentElement.scrollWidth + ' > ' + vw + ')');
        document.querySelectorAll('#main a[href^="#x-"]').forEach(a => { if (!EXPLAIN.byId(a.getAttribute('href').slice(3))) out.push('broken link ' + a.getAttribute('href')); });
        if (/undefined|NaN|\[object/.test(document.querySelector('#main').innerText)) out.push('suspicious text');
        // step through every frame once
        const n = document.querySelectorAll('.ex-dots i').length, nx = document.querySelector('[data-a=next]');
        for (let i = 0; i < n; i++) { if (nx) nx.click(); if (/NaN|undefined/.test((document.querySelector('.ex-stage') || {}).innerHTML || '')) { out.push('frame ' + (i + 2) + ' NaN'); break; } }
        return out;
      });
      if (r.length) probs.push(w + 'px ' + hs + ': ' + [...new Set(r)].join('; '));
    }
    await p.close();
  }
  console.log(probs.join('\n') || 'no page problems'); console.log(errs.slice(0, 20).join('\n') || 'no JS errors');
  await b.close();
})();
