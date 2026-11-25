// node validate.js <topic.json ...>   (or no args: every topics/*/*.json)
const fs = require('fs'), path = require('path'), cp = require('child_process');
global.window = global; require('./explain.js');
const KINDS = ['array', 'map', 'stack', 'queue', 'list', 'tree', 'graph', 'grid', 'table', 'bars', 'sd'];
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(__dirname, 'topics')).flatMap(d => fs.readdirSync(path.join(__dirname, 'topics', d)).filter(f => f.endsWith('.json')).map(f => path.join(__dirname, 'topics', d, f)));
const allIds = new Set(fs.readdirSync(path.join(__dirname, 'topics')).flatMap(d => fs.readdirSync(path.join(__dirname, 'topics', d)).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5))));
let bad = 0;
const banned = /\b(Java|JavaScript|TypeScript|C\+\+|Golang|Rust|Kotlin|simply|obviously)\b|—/;
for (const f of files) {
  const E = [], W = [];
  let t; try { t = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(f, 'ERROR bad JSON', e.message); bad++; continue; }
  const need = ['id', 'track', 'order', 'title', 'short', 'what', 'analogy', 'viz', 'when', 'python', 'output', 'cost', 'watch', 'interview', 'related'];
  need.forEach(k => { if (t[k] == null) E.push('missing ' + k); });
  if (t.id && path.basename(f, '.json') !== t.id) E.push('file name must equal id');
  if (!['py', 'ds', 'algo', 'sd'].includes(t.track)) E.push('track must be py|ds|algo|sd');
  if ((t.title || '').length > 32) E.push('title > 32 chars');
  if ((t.short || '').length > 70) E.push('short > 70 chars');
  const txt = JSON.stringify([t.title, t.short, t.what, t.analogy, t.when, t.watch, t.cost, (t.viz && t.viz.frames || []).map(x => x.say)]);
  if (banned.test(txt)) E.push('banned word or em dash in text: ' + (txt.match(banned) || [])[0]);
  if (!t.viz || !KINDS.includes(t.viz.kind)) E.push('viz.kind must be one of ' + KINDS.join('|'));
  const F = (t.viz && t.viz.frames) || [];
  if (F.length < 4 || F.length > 9) E.push('need 4-9 frames, got ' + F.length);
  F.forEach((fr, i) => {
    if (!fr.say) E.push('frame ' + (i + 1) + ' has no say'); else if (fr.say.length > 140) E.push('frame ' + (i + 1) + ' say > 140 chars');
    let s = ''; try { s = EXPLAIN.viz(t.viz.kind, fr); } catch (e) { E.push('frame ' + (i + 1) + ' render error: ' + e.message); }
    if (/NaN|undefined|Infinity/.test(s)) E.push('frame ' + (i + 1) + ' renders NaN/undefined');
    const k = t.viz.kind;
    if (k === 'array' && (fr.cells || []).length > 12) E.push('frame ' + (i + 1) + ' > 12 cells');
    if ((k === 'graph' || k === 'sd') && Array.isArray(fr.nodes)) {
      const ids = new Set(fr.nodes.map(n => n.id));
      fr.nodes.forEach(n => { if (!(n.x >= 0 && n.x <= 100 && n.y >= 0 && n.y <= 100)) E.push('frame ' + (i + 1) + ' node ' + n.id + ' x/y must be 0-100'); if (k === 'sd' && String(n.label || '').length > 14) W.push('frame ' + (i + 1) + ' sd label > 14 chars: ' + n.label); });
      (fr.edges || []).forEach(e => { if (!ids.has(e[0]) || !ids.has(e[1])) E.push('frame ' + (i + 1) + ' edge to unknown node ' + e); });
      for (let a = 0; a < fr.nodes.length; a++) for (let b = a + 1; b < fr.nodes.length; b++) {
        const A = fr.nodes[a], B = fr.nodes[b], dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
        if (k === 'sd' ? (dx < 24 && dy < 24) : (dx < 12 && dy < 14)) E.push('frame ' + (i + 1) + ' nodes overlap: ' + A.id + ' / ' + B.id);
      }
    }
    if (k === 'tree' && (fr.nodes || []).length > 15) E.push('frame ' + (i + 1) + ' tree > 15 slots');
  });
  (t.related || []).forEach(r => { if (!allIds.has(r)) W.push('related id not found (yet): ' + r); });
  if ((t.python || '').split('\n').length > 16) E.push('python > 15 lines');
  if (t.python) {
    const r = cp.spawnSync('python3', ['-I', '-c', t.python], { encoding: 'utf8', timeout: 10000 });
    if (r.status !== 0) E.push('python failed: ' + (r.stderr || '').trim().split('\n').slice(-1)[0]);
    else if (r.stdout.trimEnd() !== String(t.output || '').trimEnd()) E.push('output mismatch.\n  got:      ' + JSON.stringify(r.stdout.trimEnd()) + '\n  expected: ' + JSON.stringify(String(t.output).trimEnd()));
  }
  if ((t.when || []).length < 3) E.push('when needs 3-5 items');
  if (!(t.cost || []).length) E.push('cost empty');
  if (E.length) { bad++; console.log(path.relative(__dirname, f), 'ERROR\n  - ' + E.join('\n  - ')); }
  else console.log(path.relative(__dirname, f), 'OK' + (W.length ? ' (' + W.length + ' warnings: ' + W.join('; ') + ')' : ''));
}
process.exit(bad ? 1 : 0);
