// Opens every page of index.html in Chromium and reports JS errors and pages that render badly.
// Run from the repository root: node tools/sweep.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; let cur = '';
  p.on('pageerror', e => errs.push(cur + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errs.push(cur + ' console: ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await p.waitForTimeout(1500);
  const hashes = await p.evaluate(() => ['home', 'problems', 'leetcode', 'cheatsheet', 'mock', 'drill', 'testday', 'sd', 'sd-designs', 'sd-practice', 'sd-drill', 'sd-cheat', 'sd-board', 'dd', 'dd-questions', 'dd-mock', 'dd-cheat', 'co', 'me', 'me-rounds', 'me-trophies', 'ex-py', 'ex-ds', 'ex-algo', 'ex-sd', 'ex-which']
    .concat((window.PACKS || []).map(x => 'co-' + x.id), SD_DATA.designs.map(d => 'sd-d-' + d.id), SD_DATA.concepts.map(c => 'sd-c-' + c.id), SD_DATA.practice.map(q => 'sd-q-' + q.id),
      DATA.problems.map(x => 'p-' + x.id), (window.EXPLAIN_TOPICS || []).map(t => 'x-' + t.id)));
  const problems = [];
  for (const h of hashes) {
    cur = h;
    await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(120);
    const r = await p.evaluate(() => {
      const m = document.querySelector('#main'); const out = [];
      if (!m || m.textContent.trim().length < 80) out.push('nearly empty page');
      if (/undefined|NaN|\[object Object\]/.test(m.innerText)) out.push('suspicious text: ' + (m.innerText.match(/.{0,40}(undefined|NaN|\[object Object\]).{0,40}/) || [''])[0]);
      return out;
    });
    if (r.length) problems.push(h + ': ' + r.join('; '));
  }
  console.log('pages', hashes.length); console.log(problems.join('\n') || 'no page problems'); console.log(errs.slice(0, 30).join('\n') || 'no JS errors');
  await b.close();
  process.exit(errs.length || problems.length ? 1 : 0);
})();
