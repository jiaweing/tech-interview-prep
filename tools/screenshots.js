// Regenerates the README screenshots in docs/screenshots/. Run from the repository root: node tools/screenshots.js
const { chromium, devices } = require('playwright');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUT = path.resolve(__dirname, '..', 'docs', 'screenshots');
const DESKTOP = [
  ['home-light', 'home', 'light'], ['problem-dark', 'p-mars-rover', 'dark'], ['leetcode-light', 'leetcode', 'light'],
  ['company-light', 'co-govtech', 'light'], ['design-dark', 'sd-d-url-shortener', 'dark'], ['explained-light', 'x-sliding-window', 'light'],
  ['cheatsheet-dark', 'cheatsheet', 'dark'], ['which-light', 'ex-which', 'light'],
];
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const [name, hash, scheme] of DESKTOP) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: scheme });
    await p.goto(PAGE + '#' + hash); await p.waitForTimeout(hash.startsWith('p-') ? 2500 : 900);
    await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.close();
  }
  // the mock interview call, full screen, on a system design question
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' });
    await p.goto(PAGE + '#sd'); await p.waitForTimeout(800);
    const id = await p.evaluate(() => SD_DATA.practice[0].id);
    await p.evaluate(i => { location.hash = 'sd-q-' + i; }, id); await p.waitForTimeout(900);
    await p.click('.iv-start'); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, 'mock-call-dark.png') }); await p.close(); }
  for (const [name, hash, scheme] of [['phone-problem-light', 'p-two-sum', 'light'], ['phone-leetcode-dark', 'leetcode', 'dark']]) {
    const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { colorScheme: scheme }));
    const p = await ctx.newPage(); await p.goto(PAGE + '#' + hash); await p.waitForTimeout(hash.startsWith('p-') ? 2500 : 900);
    await p.screenshot({ path: path.join(OUT, name + '.png') }); await ctx.close();
  }
  await b.close(); console.log('screenshots in', OUT);
})();
