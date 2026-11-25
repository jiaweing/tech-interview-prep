// node shot.js <topic-id> [--page built.html] [--out prefix] [--dark]   screenshots every frame of a topic stacked into one image list (one PNG per frame: out-1.png ...)
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const id = args[0], out = opt('--out') || path.join(__dirname, '..', 'shots', id), dark = args.includes('--dark'), page = opt('--page') || path.join(__dirname, '..', 'index.html');
  require('fs').mkdirSync(path.dirname(out + '-1.png'), { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 900 }, colorScheme: dark ? 'dark' : 'light' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page) + '#x-' + id); await p.waitForTimeout(600);
  const n = await p.evaluate(() => document.querySelectorAll('.ex-dots i').length);
  await p.screenshot({ path: out + '-page.png', fullPage: true });
  for (let i = 0; i < n; i++) { const el = await p.$('.ex-player'); await el.screenshot({ path: out + '-' + (i + 1) + '.png' }); await p.click('[data-a=next]'); await p.waitForTimeout(80); }
  console.log('frames', n, 'errors', errs.length ? errs.join('; ') : 'none', '->', out + '-*.png');
  await b.close();
})();
