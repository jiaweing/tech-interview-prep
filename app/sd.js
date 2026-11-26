/* System design realm: views, architecture diagrams with animated request flows, concept sims, whiteboard. */
(function () {
'use strict';
const D = window.SD_DATA || {};
const CONCEPTS = D.concepts || [], DESIGNS = D.designs || [], PRACTICE = D.practice || [], DRILL = D.drill || [], CHEAT = D.cheat || {}, ROUND = D.round || {};
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const store = {
  get(k, d) { try { const v = localStorage.getItem('pg:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pg:' + k, JSON.stringify(v)); } catch (e) {} }
};
const byId = a => Object.fromEntries(a.map(x => [x.id, x]));
const CON = byId(CONCEPTS), DES = byId(DESIGNS), PRA = byId(PRACTICE);
const app = () => window.APP10K || { xp() {}, toast() {} };
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const prog = {
  get: () => store.get('sdProg', {}),
  mark(k) { const p = this.get(); if (p[k]) return false; p[k] = Date.now(); store.set('sdProg', p); return true; },
  has(k) { return !!this.get()[k]; }
};

const NAV = [['sd', 'sd-learn', 'Learn'], ['sd-designs', 'sd-designs', 'Designs'], ['sd-practice', 'sd-practice', 'Practice'], ['sd-drill', 'sd-drill', 'Drill'], ['sd-cheat', 'sd-cheat', 'Cheat sheet'], ['sd-board', 'sd-board', 'Whiteboard']];
function tabFor(h) {
  if (h === 'sd-cheat') return 'sd-cheat';
  if (/^sd-(practice|q-|drill|board)/.test(h)) return 'sd-practice';
  return 'sd-learn';
}

/* ---------------- icons ---------------- */
const IC = {
  client: '<rect x="2" y="3" width="12" height="8" rx="1.5"/><path d="M6 14h4M8 11v3"/>',
  user: '<circle cx="8" cy="5" r="2.6"/><path d="M3 14c.6-2.8 2.6-4.2 5-4.2s4.4 1.4 5 4.2"/>',
  mobile: '<rect x="4.5" y="1.5" width="7" height="13" rx="1.6"/><path d="M7 12.5h2"/>',
  dns: '<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/>',
  cdn: '<path d="M4.5 12.5h7.2a3 3 0 0 0 .3-6 4.2 4.2 0 0 0-8-.6A3.3 3.3 0 0 0 4.5 12.5Z"/>',
  lb: '<path d="M2 8h4M6 8l3-4h5M6 8l3 4h5M12 2l2 2-2 2M12 10l2 2-2 2"/>',
  gateway: '<path d="M8 1.8 13.5 4v4c0 3.2-2.4 5.4-5.5 6.2C4.9 13.4 2.5 11.2 2.5 8V4Z"/><path d="m5.6 8 1.7 1.7L10.6 6.4"/>',
  auth: '<circle cx="5.5" cy="8" r="3"/><path d="M8.5 8H14M12 8v2.5M14 8v2"/>',
  service: '<rect x="2.5" y="2.5" width="11" height="11" rx="2.5"/><path d="M5.5 6h5M5.5 8h5M5.5 10h3"/>',
  worker: '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6 5 5M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4"/>',
  fn: '<path d="M9.5 2.5H8a2 2 0 0 0-2 2v7a2 2 0 0 1-2 2H2.5M4 7.5h6M10 9l4 4M14 9l-4 4"/>',
  ws: '<path d="M2 6h10l-2.5-2.5M14 10H4l2.5 2.5"/>',
  cache: '<path d="M9 1.8 3.5 9h4L7 14.2 12.5 7h-4Z"/>',
  db: '<ellipse cx="8" cy="3.8" rx="5.2" ry="2"/><path d="M2.8 3.8v8.4c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V3.8M2.8 8c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2"/>',
  nosql: '<ellipse cx="8" cy="3.8" rx="5.2" ry="2"/><path d="M2.8 3.8v8.4c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V3.8"/><path d="M6 8.2h.01M8 8.2h.01M10 8.2h.01M6 10.8h.01M8 10.8h.01M10 10.8h.01"/>',
  tsdb: '<ellipse cx="8" cy="3.8" rx="5.2" ry="2"/><path d="M2.8 3.8v8.4c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V3.8"/><path d="m4.5 11 2-2.5 2 1.5 3-3.5"/>',
  storage: '<path d="M2 4.5h12l-1.2 9H3.2ZM2 4.5l1.5-2.5h9L14 4.5"/>',
  search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/>',
  index: '<path d="M3 3h10M3 6.3h10M3 9.6h6M3 13h4"/><circle cx="12" cy="11.5" r="2"/>',
  queue: '<rect x="1.8" y="5" width="3" height="6" rx=".8"/><rect x="6.5" y="5" width="3" height="6" rx=".8"/><rect x="11.2" y="5" width="3" height="6" rx=".8"/>',
  stream: '<path d="M1.8 5c2-2 4.2-2 6.2 0s4.2 2 6.2 0M1.8 11c2-2 4.2-2 6.2 0s4.2 2 6.2 0"/>',
  cron: '<circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/>',
  notify: '<path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8ZM6.5 14h3"/>',
  ext: '<path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M11.5 9.5v3.5h-9v-9H6"/>',
  analytics: '<path d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5"/>',
  ml: '<circle cx="4" cy="4" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="12" cy="8" r="1.6"/><path d="M5.5 4.6 10.5 7.4M5.5 11.4l5-2.8M4 5.6v4.8"/>',
  map: '<path d="M8 14.5s4.5-4.3 4.5-7.8a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.8 4.5 7.8Z"/><circle cx="8" cy="6.6" r="1.6"/>'
};
const KIND_NAME = { client: 'Web client', user: 'User', mobile: 'Mobile app', dns: 'DNS', cdn: 'CDN', lb: 'Load balancer', gateway: 'API gateway', auth: 'Auth', service: 'Service', worker: 'Worker', fn: 'Function', ws: 'WebSocket', cache: 'Cache', db: 'SQL DB', nosql: 'NoSQL DB', tsdb: 'Time-series DB', storage: 'Object store', search: 'Search', index: 'Index', queue: 'Queue', stream: 'Stream', cron: 'Scheduler', notify: 'Notifier', ext: 'External API', analytics: 'Analytics', ml: 'ML model', map: 'Maps/geo' };
const KIND_GROUP = [['Edge', ['client', 'user', 'mobile', 'dns', 'cdn']], ['Entry', ['lb', 'gateway', 'auth']], ['Compute', ['service', 'worker', 'fn', 'ws']], ['Data', ['cache', 'db', 'nosql', 'tsdb', 'storage', 'search', 'index']], ['Async', ['queue', 'stream', 'cron', 'notify']], ['Other', ['ext', 'analytics', 'ml', 'map']]];
const icon = (k, x, y, s) => '<g class="ic" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + (IC[k] || IC.service) + '</g>';
const iconSvg = k => '<svg viewBox="0 0 16 16" aria-hidden="true">' + (IC[k] || IC.service) + '</svg>';

/* ---------------- diagram geometry ---------------- */
const NH = 52;
const nodeW = n => n.w || Math.max(118, Math.min(200, Math.round(Math.max((n.label || '').length * 7.4, (n.sub || '').length * 6.1) + 52)));
function clip(cx, cy, w, h, dx, dy, pad) {
  const hw = w / 2 + pad, hh = h / 2 + pad;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return [cx + dx * t, cy + dy * t];
}
function edgeGeom(dg, e, nodes) {
  const a = nodes[e.from], b = nodes[e.to];
  if (!a || !b) return null;
  let dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
  // offset parallel edges (a->b and b->a both present) so they don't overlap
  const twin = (dg.edges || []).some(o => o !== e && o.from === e.to && o.to === e.from);
  const off = twin ? 7 : 0, ox = -dy * off, oy = dx * off;
  const [x1, y1] = clip(a.x + ox, a.y + oy, nodeW(a), NH, dx, dy, 3);
  const [x2, y2] = clip(b.x + ox, b.y + oy, nodeW(b), NH, -dx, -dy, 7);
  if (e.curve) {
    const mx = (x1 + x2) / 2 - dy * e.curve, my = (y1 + y2) / 2 + dx * e.curve;
    return { x1, y1, x2, y2, mx, my, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1), lx: (x1 + 2 * mx + x2) / 4, ly: (y1 + 2 * my + y2) / 4, ang: Math.atan2(y2 - my, x2 - mx) };
  }
  return { x1, y1, x2, y2, d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1), lx: (x1 + x2) / 2 + ox * 0.6, ly: (y1 + y2) / 2 + oy * 0.6, ang: Math.atan2(dy, dx) };
}
function arrowHead(x, y, ang) {
  const s = 7, a1 = ang + Math.PI * 0.85, a2 = ang - Math.PI * 0.85;
  return 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + (x + Math.cos(a1) * s).toFixed(1) + ' ' + (y + Math.sin(a1) * s).toFixed(1) + ' L' + (x + Math.cos(a2) * s).toFixed(1) + ' ' + (y + Math.sin(a2) * s).toFixed(1) + 'Z';
}
function diagramSVG(dg, opt) {
  opt = opt || {};
  const nodes = byId(dg.nodes || []);
  const W = dg.w || 960, H = dg.h || 460;
  let s = '<svg class="sdg-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Architecture diagram') + '">';
  (dg.groups || []).forEach(g => { s += '<g class="sdg-grp"><rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="' + g.h + '" rx="16"/><text x="' + (g.x + 12) + '" y="' + (g.y + 16) + '">' + esc(g.label) + '</text></g>'; });
  (dg.edges || []).forEach((e, i) => {
    const g = edgeGeom(dg, e, nodes); if (!g) return;
    const id = e.id || ('e' + i);
    s += '<g class="sdg-edge' + (e.dashed ? ' dashed' : '') + '" data-e="' + esc(id) + '"><path class="hit" d="' + g.d + '"/><path class="ln" d="' + g.d + '"/>' +
      '<path class="ah" d="' + arrowHead(g.x2, g.y2, g.ang) + '"/>' + (e.bi ? '<path class="ah" d="' + arrowHead(g.x1, g.y1, g.ang + Math.PI) + '"/>' : '');
    if (e.label && !opt.noLabels) {
      const tw = e.label.length * 5.9 + 10, seg = Math.hypot(g.x2 - g.x1, g.y2 - g.y1), ux = Math.abs(Math.cos(g.ang)), uy = Math.abs(Math.sin(g.ang));
      let lx = g.lx, ly = g.ly;
      // label wider than the visible segment: lift it off the line so it never sits on a node
      if (!e.curve && ux * tw + uy * 15 + 6 > seg) { if (uy < .5) ly -= 13; else lx += (tw / 2 + 6) * (Math.sin(g.ang) * Math.cos(g.ang) >= 0 ? 1 : -1); }
      s += '<rect class="lb" x="' + (lx - tw / 2).toFixed(1) + '" y="' + (ly - 8).toFixed(1) + '" width="' + tw.toFixed(1) + '" height="15" rx="7"/><text x="' + lx.toFixed(1) + '" y="' + (ly + 3.5).toFixed(1) + '" text-anchor="middle">' + esc(e.label) + '</text>';
    }
    s += '</g>';
  });
  (dg.nodes || []).forEach(n => {
    const w = nodeW(n), x = n.x - w / 2, y = n.y - NH / 2;
    s += '<g class="sdg-node k-' + esc(n.kind || 'service') + '" data-n="' + esc(n.id) + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><rect class="b" width="' + w + '" height="' + NH + '" rx="13"/>' +
      '<rect class="chip" x="9" y="' + (NH / 2 - 13) + '" width="26" height="26" rx="8"/>' + icon(n.kind, 14, NH / 2 - 8) +
      '<text class="l" x="43" y="' + (n.sub ? 22 : 30) + '">' + esc(n.label) + '</text>' + (n.sub ? '<text class="s" x="43" y="37">' + esc(n.sub) + '</text>' : '') + '</g>';
  });
  s += '<circle class="sdg-pkt" r="6" cx="-20" cy="-20" visibility="hidden"/></svg>';
  return s;
}
function legendHTML(dg) {
  const kinds = [...new Set((dg.nodes || []).map(n => n.kind))];
  const grp = KIND_GROUP.filter(([, ks]) => ks.some(k => kinds.includes(k)));
  return '<div class="sdg-legend">' + grp.map(([g, ks]) => '<span class="k-' + ks.find(k => kinds.includes(k)) + '"><i></i>' + g + '</span>').join('') + '</div>';
}

/* Mount a diagram with a flow player. Returns a destroy function. */
function mountDiagram(host, dg, flows, opt) {
  opt = opt || {};
  flows = (flows || []).filter(f => f && f.steps && f.steps.length);
  host.innerHTML = '<div class="sdg' + (opt.fit ? ' fit' : '') + '"><div class="sdg-scroll">' + diagramSVG(dg, opt) + '</div>' + legendHTML(dg) +
    (flows.length ? '<div class="sdg-flow"><div class="sdg-fl"><b>Trace a request</b>' + flows.map((f, i) => '<button class="chip' + (i ? '' : ' on') + '" data-f="' + i + '">' + esc(f.name) + '</button>').join('') + '</div><div class="sdg-note" aria-live="polite"></div><div class="sdg-ctl"><button class="btn small icon" data-c="prev" aria-label="Previous step">‹</button><button class="btn small" data-c="play">▶ Play</button><button class="btn small icon" data-c="next" aria-label="Next step">›</button><span class="dots"></span><button class="btn small ghost" data-c="reset">Show all</button></div></div>' : '') + '</div>';
  const root = $('.sdg', host), svg = $('svg', root), pkt = $('.sdg-pkt', svg);
  if (!flows.length) return () => {};
  const nodes = byId(dg.nodes || []), edges = Object.fromEntries((dg.edges || []).map((e, i) => [e.id || ('e' + i), e]));
  let fi = 0, si = -1, timer = null, raf = null;
  const note = $('.sdg-note', root), dots = $('.dots', root), playB = $('[data-c=play]', root);
  const flow = () => flows[fi];
  const clear = () => { $$('.on,.hot,.pulse', svg).forEach(el => el.classList.remove('on', 'hot', 'pulse')); pkt.setAttribute('visibility', 'hidden'); if (raf) cancelAnimationFrame(raf); };
  const paintDots = () => { dots.innerHTML = flow().steps.map((_, i) => '<i class="' + (i === si ? 'on' : i < si ? 'past' : '') + '" data-s="' + i + '" title="Step ' + (i + 1) + '"></i>').join(''); };
  const intro = () => { note.innerHTML = ''; };
  function animate(e, rev) {
    const g = edgeGeom(dg, e, nodes); if (!g) return;
    const path = $('[data-e="' + cssEsc(e.id || '') + '"] .ln', svg);
    if (!path || reduced()) return;
    const L = path.getTotalLength(), t0 = performance.now(), dur = 750;
    pkt.setAttribute('visibility', 'visible');
    const tick = now => {
      const t = Math.min(1, (now - t0) / dur), k = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = path.getPointAtLength((rev ? 1 - k : k) * L); pkt.setAttribute('cx', p.x); pkt.setAttribute('cy', p.y);
      if (t < 1) raf = requestAnimationFrame(tick); else pkt.setAttribute('visibility', 'hidden');
    };
    raf = requestAnimationFrame(tick);
  }
  function go(i) {
    const st = flow().steps; si = Math.max(-1, Math.min(st.length - 1, i));
    clear(); root.classList.toggle('playing', si >= 0); paintDots();
    if (si < 0) { intro(); return; }
    const s = st[si];
    // keep nodes touched earlier in this flow faintly visible as context
    st.slice(0, si + 1).forEach(p => { if (p.edge && edges[p.edge]) { const e = edges[p.edge]; [e.from, e.to].forEach(n => { const el = $('[data-n="' + cssEsc(n) + '"]', svg); if (el) el.classList.add('on'); }); } if (p.node) { const el = $('[data-n="' + cssEsc(p.node) + '"]', svg); if (el) el.classList.add('on'); } });
    if (s.edge && edges[s.edge]) { const ee = $('[data-e="' + cssEsc(s.edge) + '"]', svg); if (ee) ee.classList.add('on'); const e = edges[s.edge]; const tgt = s.rev ? e.from : e.to; const tn = $('[data-n="' + cssEsc(tgt) + '"]', svg); if (tn) { tn.classList.add('hot'); } animate(Object.assign({ id: s.edge }, e), !!s.rev); }
    if (s.node) { const el = $('[data-n="' + cssEsc(s.node) + '"]', svg); if (el) { el.classList.add('hot', 'pulse'); } }
    note.innerHTML = '<span class="sn">' + (si + 1) + '/' + st.length + '</span>' + (s.note || '');
  }
  const stop = () => { if (timer) clearInterval(timer); timer = null; playB.textContent = '▶ Play'; };
  const play = () => { if (timer) { stop(); return; } if (si >= flow().steps.length - 1) go(-1); playB.textContent = '❚❚ Pause'; go(si + 1); timer = setInterval(() => { if (si >= flow().steps.length - 1) { stop(); return; } go(si + 1); }, 2300); };
  root.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'), c = e.target.closest('[data-c]'), d = e.target.closest('[data-s]');
    if (f) { stop(); fi = +f.dataset.f; $$('[data-f]', root).forEach(b => b.classList.toggle('on', b === f)); go(-1); }
    if (d) { stop(); go(+d.dataset.s); }
    if (!c) return; const k = c.dataset.c;
    if (k === 'prev') { stop(); go(si - 1); } else if (k === 'next') { stop(); go(si + 1); } else if (k === 'play') play(); else if (k === 'reset') { stop(); si = -1; clear(); root.classList.remove('playing'); paintDots(); intro(); }
  });
  root.tabIndex = 0;
  root.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { stop(); go(si + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { stop(); go(si - 1); e.preventDefault(); } });
  paintDots(); intro();
  return () => { stop(); if (raf) cancelAnimationFrame(raf); };
}
const cssEsc = s => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/"/g, '\\"');

/* ---------------- interactive concept sims ---------------- */
const SIMS = {};
function simShell(host, title, sub) {
  host.innerHTML = '<div class="sim"><div class="sim-h"><b>' + esc(title) + '</b><span>' + esc(sub || 'interactive') + '</span></div><div class="sim-stage"></div><div class="sim-stats"></div><div class="sim-ctl"></div><div class="sim-note"></div></div>';
  return { stage: $('.sim-stage', host), stats: $('.sim-stats', host), ctl: $('.sim-ctl', host), note: $('.sim-note', host) };
}
function hash32(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

SIMS.ring = host => {
  const ui = simShell(host, 'Consistent hashing ring', 'add or remove a server, watch which keys move');
  const KEYS = Array.from({ length: 24 }, (_, i) => 'user:' + (i * 37 + 11));
  let servers = ['A', 'B', 'C'], vnodes = 4, prevOwner = {}, prevMod = {}, moved = 0, movedMod = 0, nextId = 3;
  const pos = s => (hash32(s) % 3600) / 10; // degrees
  const ringPts = () => servers.flatMap(s => Array.from({ length: vnodes }, (_, v) => ({ s, a: pos(s + '#' + v) }))).sort((a, b) => a.a - b.a);
  const owner = (k, pts) => { const a = pos(k); const p = pts.find(p => p.a >= a) || pts[0]; return p ? p.s : null; };
  const COLORS = ['var(--accent)', 'var(--hi)', 'var(--ok)', '#8E4EC6', '#DB2777', 'var(--bad)', '#0E7490', '#A18072'];
  const col = s => COLORS[(s.charCodeAt(0) - 65) % COLORS.length];
  function draw(changed) {
    const pts = ringPts(), cx = 200, cy = 170, R = 128;
    const own = {}, mod = {};
    KEYS.forEach((k, i) => { own[k] = owner(k, pts); mod[k] = servers[hash32(k) % servers.length]; });
    if (changed) { moved = KEYS.filter(k => prevOwner[k] && prevOwner[k] !== own[k]).length; movedMod = KEYS.filter(k => prevMod[k] && prevMod[k] !== mod[k]).length; }
    let s = '<svg viewBox="0 0 560 340"><circle class="sm-ring" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    const xy = (a, r) => [cx + Math.cos((a - 90) * Math.PI / 180) * r, cy + Math.sin((a - 90) * Math.PI / 180) * r];
    KEYS.forEach(k => { const [x, y] = xy(pos(k), R); const [x2, y2] = xy(pos(k), R - 22); const mv = changed && prevOwner[k] && prevOwner[k] !== own[k]; s += '<line class="sm-line" x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y2 + '"/><circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="' + (mv ? 6 : 4.5) + '" style="fill:' + col(own[k]) + (mv ? ';stroke:var(--fg);stroke-width:2' : '') + '"/>'; });
    pts.forEach(p => { const [x, y] = xy(p.a, R); s += '<rect x="' + (x - 11) + '" y="' + (y - 11) + '" width="22" height="22" rx="7" style="fill:' + col(p.s) + '"/><text class="sm-tw" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + p.s + '</text>'; });
    s += '<text class="sm-ts" x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle">hash space</text><text class="sm-ts" x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle">0 → 2³²</text>';
    // load bars
    const cnt = {}; servers.forEach(x => cnt[x] = 0); KEYS.forEach(k => cnt[own[k]]++);
    s += '<text class="sm-t" x="380" y="40">keys per server</text>';
    servers.forEach((x, i) => { const y = 58 + i * 26, w = cnt[x] / KEYS.length * 120; s += '<text class="sm-t" x="380" y="' + (y + 12) + '">' + x + '</text><rect x="398" y="' + y + '" width="' + Math.max(2, w).toFixed(1) + '" height="16" rx="5" style="fill:' + col(x) + '"/><text class="sm-ts" x="' + (404 + w) + '" y="' + (y + 12) + '">' + cnt[x] + '</text>'; });
    s += '</svg>';
    ui.stage.innerHTML = s;
    ui.stats.innerHTML = '<span>' + servers.length + ' servers × ' + vnodes + ' vnode' + (vnodes > 1 ? 's' : '') + '</span>' + (changed ? '<span class="ok">ring: ' + moved + '/' + KEYS.length + ' keys moved</span><span class="bad">hash % N: ' + movedMod + '/' + KEYS.length + ' would move</span>' : '<span>change the servers to compare</span>');
    prevOwner = own; prevMod = mod;
  }
  ui.ctl.innerHTML = '<button class="btn small" data-a="add">+ Add server</button><button class="btn small" data-a="rm">− Remove server</button><label>virtual nodes <input type="range" min="1" max="8" value="4" data-a="v"></label>';
  ui.ctl.onclick = e => { const a = (e.target.closest('[data-a]') || {}).dataset; if (!a) return; if (a.a === 'add' && servers.length < 8) { servers.push(String.fromCharCode(65 + nextId++ % 8)); servers = [...new Set(servers)]; draw(true); } if (a.a === 'rm' && servers.length > 1) { servers.splice(Math.floor(servers.length / 2), 1); draw(true); } };
  $('[data-a=v]', ui.ctl).oninput = e => { vnodes = +e.target.value; prevOwner = {}; prevMod = {}; draw(false); };
  ui.note.innerHTML = 'Each key walks clockwise to the next server. Adding a server only steals keys from its clockwise neighbour, about <b>1/N</b> of keys. With <code>hash % N</code>, changing N remaps almost everything. More virtual nodes even out the load bars.';
  draw(false);
};

SIMS.bucket = host => {
  const ui = simShell(host, 'Token bucket rate limiter', 'tokens refill at a steady rate; each request spends one');
  let cap = 5, rate = 1, tokens = 5, last = performance.now(), log = [], ok = 0, rej = 0, raf;
  function refill() { const now = performance.now(); tokens = Math.min(cap, tokens + (now - last) / 1000 * rate); last = now; }
  function send(n) { for (let i = 0; i < n; i++) { refill(); const pass = tokens >= 1; if (pass) { tokens -= 1; ok++; } else rej++; log.push({ t: performance.now(), pass }); } if (log.length > 60) log.splice(0, log.length - 60); }
  function draw() {
    refill(); const now = performance.now();
    let s = '<svg viewBox="0 0 560 200">';
    // bucket
    const bh = 130, fill = tokens / cap * bh;
    s += '<path d="M40 30 L52 170 L148 170 L160 30" class="sm-box" style="fill:var(--bg)"/><path d="M' + (52 - (170 - (170 - fill)) * 0 + 0) + ' ' + (170 - fill) + ' L148 ' + (170 - fill) + ' L148 170 L52 170 Z" class="sm-water"/>';
    for (let i = 0; i < Math.floor(tokens); i++) s += '<circle cx="' + (70 + (i % 4) * 20) + '" cy="' + (160 - Math.floor(i / 4) * 20) + '" r="7" class="sm-hi"/>';
    s += '<text class="sm-t" x="100" y="20" text-anchor="middle">' + tokens.toFixed(1) + ' / ' + cap + ' tokens</text><text class="sm-ts" x="100" y="190" text-anchor="middle">+' + rate + ' token/s</text>';
    // timeline
    s += '<text class="sm-t" x="200" y="30">last 10 s of requests</text><line class="sm-line" x1="200" y1="150" x2="540" y2="150"/>';
    log.forEach(r => { const age = (now - r.t) / 1000; if (age > 10) return; const x = 540 - age * 34; s += '<rect x="' + (x - 3).toFixed(1) + '" y="' + (r.pass ? 110 : 60) + '" width="6" height="' + (r.pass ? 40 : 40) + '" rx="3" class="' + (r.pass ? 'sm-ok' : 'sm-bad') + '"/>'; });
    s += '<text class="sm-ts" x="204" y="56">rejected · 429</text><text class="sm-ts" x="204" y="106">allowed</text><text class="sm-ts" x="540" y="166" text-anchor="end">now</text></svg>';
    ui.stage.innerHTML = s;
    ui.stats.innerHTML = '<span class="ok">allowed ' + ok + '</span><span class="bad">rejected ' + rej + '</span>';
    raf = requestAnimationFrame(draw);
  }
  ui.ctl.innerHTML = '<button class="btn small primary" data-n="1">Send 1</button><button class="btn small" data-n="10">Burst of 10</button><label>capacity <input type="range" min="1" max="12" value="5" data-k="cap"></label><label>refill/s <input type="range" min="1" max="6" value="1" data-k="rate"></label>';
  ui.ctl.onclick = e => { const b = e.target.closest('[data-n]'); if (b) send(+b.dataset.n); };
  ui.ctl.oninput = e => { const k = e.target.dataset.k; if (k === 'cap') { cap = +e.target.value; tokens = Math.min(tokens, cap); } if (k === 'rate') rate = +e.target.value; };
  ui.note.innerHTML = 'Capacity sets the <b>burst</b> you tolerate; refill rate sets the <b>sustained</b> limit. Keep the counter in Redis (atomic Lua / INCR with TTL) so every API server shares one bucket per user or IP.';
  draw();
  return () => cancelAnimationFrame(raf);
};

SIMS.lru = host => {
  const ui = simShell(host, 'Cache-aside with LRU eviction', 'request keys; misses go to the database');
  let cap = 4, cache = [], hits = 0, miss = 0, lastEv = null, lastKey = null, lastHit = null;
  const DB_MS = 40, C_MS = 1;
  function req(k) { lastKey = k; const i = cache.indexOf(k); lastEv = null; if (i >= 0) { hits++; lastHit = true; cache.splice(i, 1); cache.unshift(k); } else { miss++; lastHit = false; cache.unshift(k); if (cache.length > cap) lastEv = cache.pop(); } draw(); }
  function draw() {
    let s = '<svg viewBox="0 0 560 170"><text class="sm-t" x="20" y="24">cache (most recent → least recent), capacity ' + cap + '</text>';
    for (let i = 0; i < cap; i++) { const k = cache[i], x = 20 + i * 78; s += '<rect x="' + x + '" y="38" width="68" height="44" rx="10" class="' + (k && k === lastKey ? (lastHit ? 'sm-cellq' : 'sm-cellh') : 'sm-cell') + '"/>' + (k ? '<text class="sm-t" x="' + (x + 34) + '" y="65" text-anchor="middle">' + k + '</text>' : ''); }
    if (lastEv) s += '<text class="sm-ts" x="' + (30 + cap * 78) + '" y="65">evicted ' + lastEv + ' →</text>';
    s += '<rect x="20" y="108" width="140" height="44" rx="10" class="sm-box"/><text class="sm-t" x="90" y="135" text-anchor="middle">database</text>';
    if (lastKey) s += '<text class="sm-t" x="180" y="135">' + (lastHit ? 'GET ' + lastKey + ' → HIT · ~' + C_MS + ' ms' : 'GET ' + lastKey + ' → MISS → read DB (~' + DB_MS + ' ms), write to cache') + '</text>';
    s += '</svg>'; ui.stage.innerHTML = s;
    const tot = hits + miss, avg = tot ? ((hits * C_MS + miss * (DB_MS + C_MS)) / tot).toFixed(1) : '0';
    ui.stats.innerHTML = '<span class="ok">hits ' + hits + '</span><span class="bad">misses ' + miss + '</span><span>hit rate ' + (tot ? Math.round(hits / tot * 100) : 0) + '%</span><span>avg latency ' + avg + ' ms</span>';
  }
  ui.ctl.innerHTML = ['A', 'B', 'C', 'D', 'E', 'F'].map(k => '<button class="btn small" data-k="' + k + '">GET ' + k + '</button>').join('') + '<button class="btn small ghost" data-z="1">Zipf traffic ×20</button><button class="btn small ghost" data-r="1">Reset</button><label>capacity <input type="range" min="2" max="6" value="4"></label>';
  ui.ctl.onclick = e => { const b = e.target.closest('[data-k]'); if (b) req(b.dataset.k); if (e.target.closest('[data-z]')) { for (let i = 0; i < 20; i++) { const r = Math.random(); req(r < .45 ? 'A' : r < .7 ? 'B' : r < .82 ? 'C' : r < .9 ? 'D' : r < .96 ? 'E' : 'F'); } } if (e.target.closest('[data-r]')) { cache = []; hits = miss = 0; lastKey = lastEv = null; draw(); } };
  $('input', ui.ctl).oninput = e => { cap = +e.target.value; while (cache.length > cap) cache.pop(); draw(); };
  ui.note.innerHTML = 'Real traffic is skewed: a few hot keys get most reads, so even a small cache gets a high hit rate. On a write, <b>update the DB, then delete the cache key</b> so the next read refills it.';
  draw();
};

SIMS.lb = host => {
  const ui = simShell(host, 'Load balancer strategies', 'some requests are slow; compare how each strategy copes');
  let algo = 'rr', srv = [0, 0, 0, 0].map((_, i) => ({ q: [], done: 0, i })), rr = 0, t = 0, timer = null, sent = 0;
  const pick = () => algo === 'rr' ? srv[rr++ % srv.length] : algo === 'lc' ? srv.slice().sort((a, b) => a.q.length - b.q.length || a.i - b.i)[0] : srv[Math.floor(Math.random() * srv.length)];
  function tick() { t++; srv.forEach(s => { if (s.q.length) { s.q[0] -= 1; if (s.q[0] <= 0) { s.q.shift(); s.done++; } } }); for (let k = 0; k < 2; k++) { const job = Math.random() < .15 ? 12 : 2; pick().q.push(job); sent++; } draw(); }
  function draw() {
    let s = '<svg viewBox="0 0 560 210"><rect x="20" y="85" width="90" height="40" rx="10" class="sm-boxon"/><text class="sm-t" x="65" y="109" text-anchor="middle">LB</text>';
    srv.forEach((v, i) => { const y = 18 + i * 48; s += '<line class="sm-line" x1="110" y1="105" x2="170" y2="' + (y + 18) + '"/><rect x="170" y="' + y + '" width="80" height="36" rx="9" class="sm-box"/><text class="sm-t" x="210" y="' + (y + 22) + '" text-anchor="middle">srv ' + (i + 1) + '</text>'; let x = 258; v.q.slice(0, 22).forEach(j => { const w = j > 4 ? 22 : 9; s += '<rect x="' + x + '" y="' + (y + 8) + '" width="' + w + '" height="20" rx="4" class="' + (j > 4 ? 'sm-bad' : 'sm-ac') + '"/>'; x += w + 2; }); s += '<text class="sm-ts" x="550" y="' + (y + 22) + '" text-anchor="end">queue ' + v.q.length + '</text>'; });
    s += '</svg>'; ui.stage.innerHTML = s;
    const max = Math.max(...srv.map(v => v.q.length)), min = Math.min(...srv.map(v => v.q.length));
    ui.stats.innerHTML = '<span>sent ' + sent + '</span><span>' + (algo === 'rr' ? 'round robin' : algo === 'lc' ? 'least connections' : 'random') + '</span><span class="' + (max - min > 6 ? 'bad' : 'ok') + '">longest queue ' + max + ' · shortest ' + min + '</span>';
  }
  ui.ctl.innerHTML = '<button class="btn small primary" data-a="run">▶ Run</button><button class="chip on" data-g="rr">Round robin</button><button class="chip" data-g="lc">Least connections</button><button class="chip" data-g="rnd">Random</button><button class="btn small ghost" data-a="reset">Reset</button>';
  const stop = () => { if (timer) clearInterval(timer); timer = null; $('[data-a=run]', ui.ctl).textContent = '▶ Run'; };
  ui.ctl.onclick = e => { const g = e.target.closest('[data-g]'), a = e.target.closest('[data-a]'); if (g) { algo = g.dataset.g; $$('[data-g]', ui.ctl).forEach(b => b.classList.toggle('on', b === g)); draw(); } if (a && a.dataset.a === 'run') { if (timer) stop(); else { timer = setInterval(tick, 260); a.textContent = '❚❚ Pause'; } } if (a && a.dataset.a === 'reset') { srv.forEach(v => { v.q = []; v.done = 0; }); sent = 0; rr = 0; draw(); } };
  ui.note.innerHTML = 'Red blocks are slow requests. Round robin keeps feeding a server stuck on slow work; <b>least connections</b> routes around it. Health checks remove dead servers; keep servers <b>stateless</b> so any one can take any request.';
  draw();
  return stop;
};

SIMS.queue = host => {
  const ui = simShell(host, 'Queue absorbs a traffic spike', 'producers vs consumers; watch the backlog');
  let prod = 6, cons = 3, per = 2, depth = 0, hist = [], timer = null, dropped = 0, maxQ = 400;
  function tick() { const spike = hist.length % 40 > 28 ? prod * 3 : prod; depth += spike; const done = Math.min(depth, cons * per); depth -= done; if (depth > maxQ) { dropped += depth - maxQ; depth = maxQ; } hist.push({ d: depth, in: spike, out: done }); if (hist.length > 120) hist.shift(); draw(); }
  function draw() {
    let s = '<svg viewBox="0 0 560 190"><text class="sm-t" x="20" y="22">backlog over time</text><line class="sm-line" x1="20" y1="170" x2="540" y2="170"/>';
    const mx = Math.max(40, ...hist.map(h => h.d));
    let p = ''; hist.forEach((h, i) => { const x = 20 + i * (520 / 120), y = 170 - h.d / mx * 135; p += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); });
    if (p) s += '<path d="' + p + '" fill="none" stroke="var(--hi)" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<text class="sm-ts" x="540" y="22" text-anchor="end">max ' + mx + '</text></svg>';
    ui.stage.innerHTML = s;
    const h = hist[hist.length - 1] || { in: 0, out: 0 };
    ui.stats.innerHTML = '<span>in ' + h.in + '/tick</span><span>out ' + h.out + '/tick</span><span class="' + (depth > 100 ? 'bad' : 'ok') + '">backlog ' + depth + '</span>' + (dropped ? '<span class="bad">dropped ' + dropped + '</span>' : '');
  }
  ui.ctl.innerHTML = '<button class="btn small primary" data-a="run">▶ Run</button><label>producer rate <input type="range" min="1" max="12" value="6" data-k="p"></label><label>consumers <input type="range" min="1" max="10" value="3" data-k="c"></label>';
  const stop = () => { if (timer) clearInterval(timer); timer = null; $('[data-a=run]', ui.ctl).textContent = '▶ Run'; };
  ui.ctl.onclick = e => { const a = e.target.closest('[data-a]'); if (a) { if (timer) stop(); else { timer = setInterval(tick, 120); a.textContent = '❚❚ Pause'; } } };
  ui.ctl.oninput = e => { if (e.target.dataset.k === 'p') prod = +e.target.value; if (e.target.dataset.k === 'c') cons = +e.target.value; };
  ui.note.innerHTML = 'Spikes land in the queue instead of crashing the workers. If consumers × throughput is below the <b>average</b> input rate, the backlog grows forever: autoscale consumers on queue depth. Add a <b>dead-letter queue</b> for poison messages and make handlers <b>idempotent</b> (delivery is at-least-once).';
  draw();
  return stop;
};

SIMS.geo = host => {
  const ui = simShell(host, 'Geohash grid: find nearby drivers', 'click the map to place a rider');
  const N = 8, CW = 46, drivers = Array.from({ length: 34 }, (_, i) => ({ x: (hash32('dx' + i) % 1000) / 1000 * N * CW, y: (hash32('dy' + i) % 1000) / 1000 * N * CW }));
  let rider = { x: 3.4 * CW, y: 4.6 * CW }, ring = 1;
  function draw() {
    const cx = Math.floor(rider.x / CW), cy = Math.floor(rider.y / CW);
    let s = '<svg viewBox="0 0 560 380"><g transform="translate(10 6)">';
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const inR = Math.abs(i - cx) <= ring && Math.abs(j - cy) <= ring; s += '<rect x="' + i * CW + '" y="' + j * CW + '" width="' + CW + '" height="' + CW + '" class="' + (i === cx && j === cy ? 'sm-cellh' : inR ? 'sm-cellq' : 'sm-cell') + '"/>'; }
    let found = 0; drivers.forEach(d => { const i = Math.floor(d.x / CW), j = Math.floor(d.y / CW), inR = Math.abs(i - cx) <= ring && Math.abs(j - cy) <= ring; if (inR) found++; s += '<circle cx="' + d.x.toFixed(1) + '" cy="' + d.y.toFixed(1) + '" r="5" class="' + (inR ? 'sm-ok' : 'sm-mut') + '"/>'; });
    s += '<circle cx="' + rider.x + '" cy="' + rider.y + '" r="8" class="sm-ink"/><circle cx="' + rider.x + '" cy="' + rider.y + '" r="3" class="sm-bg"/></g>';
    s += '<text class="sm-t" x="392" y="30">cell = geohash prefix</text><text class="sm-ts" x="392" y="50">rider cell: ' + 'w21z' + '0123456789bcdefghjkmnpqrstuvwxyz'[(cx * 8 + cy) % 32] + '</text><text class="sm-ts" x="392" y="68">cells scanned: ' + Math.pow(2 * ring + 1, 2) + '</text><text class="sm-ts" x="392" y="86">drivers checked: ' + found + ' / ' + drivers.length + '</text>';
    s += '<text class="sm-ts" x="392" y="120">Query = rider cell</text><text class="sm-ts" x="392" y="136">+ 8 neighbours, so a</text><text class="sm-ts" x="392" y="152">rider near a border</text><text class="sm-ts" x="392" y="168">still finds drivers</text><text class="sm-ts" x="392" y="184">just across it.</text></svg>';
    ui.stage.innerHTML = s;
    ui.stats.innerHTML = '<span class="ok">' + found + ' candidates</span><span>vs scanning all ' + drivers.length + '</span>';
    $('svg', ui.stage).onclick = e => { const r = e.currentTarget.getBoundingClientRect(), sx = 560 / r.width; const x = (e.clientX - r.left) * sx - 10, y = (e.clientY - r.top) * sx - 6; if (x >= 0 && y >= 0 && x < N * CW && y < N * CW) { rider = { x, y }; draw(); } };
  }
  ui.ctl.innerHTML = '<label>search radius (cells) <input type="range" min="0" max="2" value="1"></label><button class="btn small ghost" data-a="move">Drivers move</button>';
  $('input', ui.ctl).oninput = e => { ring = +e.target.value; draw(); };
  ui.ctl.onclick = e => { if (e.target.closest('[data-a]')) { drivers.forEach(d => { d.x = Math.max(1, Math.min(N * CW - 1, d.x + (Math.random() - .5) * 40)); d.y = Math.max(1, Math.min(N * CW - 1, d.y + (Math.random() - .5) * 40)); }); draw(); } };
  ui.note.innerHTML = 'Drivers ping location every few seconds into an in-memory geo index (Redis <code>GEOADD</code>, geohash or H3 cells). A nearby query reads a handful of cells instead of every driver. Shard the index by city or cell prefix.';
  draw();
};

SIMS.replica = host => {
  const ui = simShell(host, 'Leader–follower replication lag', 'write to the leader, read from a replica');
  let lag = 2, val = 1, followers = [1, 1], pend = [], tnow = 0, timer, msg = '';
  function tick() { tnow++; pend = pend.filter(p => { if (tnow >= p.at) { followers[p.f] = p.v; return false; } return true; }); draw(); }
  function write() { val++; msg = 'wrote v' + val + ' to leader'; [0, 1].forEach(f => pend.push({ f, v: val, at: tnow + lag * (f + 1) })); draw(); }
  function read(which) { const got = which === 'L' ? val : followers[0]; msg = 'read from ' + (which === 'L' ? 'leader' : 'replica 1') + ' → v' + got + (got !== val ? '  ✗ stale (read-your-writes broken)' : '  ✓ fresh'); draw(); }
  function draw() {
    let s = '<svg viewBox="0 0 560 170"><rect x="30" y="60" width="120" height="50" rx="12" class="sm-boxon"/><text class="sm-t" x="90" y="82" text-anchor="middle">leader</text><text class="sm-t" x="90" y="99" text-anchor="middle">v' + val + '</text>';
    followers.forEach((v, i) => { const y = 20 + i * 80; s += '<line class="sm-line" x1="150" y1="85" x2="330" y2="' + (y + 25) + '"/><rect x="330" y="' + y + '" width="130" height="50" rx="12" class="' + (v === val ? 'sm-box' : 'sm-cellh') + '"/><text class="sm-t" x="395" y="' + (y + 22) + '" text-anchor="middle">replica ' + (i + 1) + '</text><text class="sm-t" x="395" y="' + (y + 39) + '" text-anchor="middle">v' + v + '</text>'; });
    pend.forEach(p => { const y = 20 + p.f * 80 + 25, k = 1 - (p.at - tnow) / (lag * (p.f + 1)); const x = 150 + (330 - 150) * Math.max(0, Math.min(1, k)), yy = 85 + (y - 85) * Math.max(0, Math.min(1, k)); s += '<circle cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="6" class="sm-hi"/>'; });
    s += '</svg>'; ui.stage.innerHTML = s;
    ui.stats.innerHTML = '<span>' + esc(msg || 'write, then read quickly from the replica') + '</span>';
  }
  ui.ctl.innerHTML = '<button class="btn small primary" data-a="w">Write</button><button class="btn small" data-a="rr">Read replica</button><button class="btn small" data-a="rl">Read leader</button><label>lag <input type="range" min="1" max="6" value="2"></label>';
  ui.ctl.onclick = e => { const a = (e.target.closest('[data-a]') || {}).dataset; if (!a) return; if (a.a === 'w') write(); if (a.a === 'rr') read('F'); if (a.a === 'rl') read('L'); };
  $('input', ui.ctl).oninput = e => { lag = +e.target.value; };
  timer = setInterval(tick, 500);
  ui.note.innerHTML = 'Replicas scale reads but lag behind. Fixes: read your own writes from the leader for a few seconds, pin a session to one replica, or track a version and wait. Async replication can lose the last writes if the leader dies.';
  draw();
  return () => clearInterval(timer);
};

SIMS.shard = host => {
  const ui = simShell(host, 'Sharding: range vs hash keys', 'insert rows and see where they land');
  let mode = 'hash', rows = [], celeb = false; const S = 4;
  function shardOf(r) { return mode === 'hash' ? hash32(String(r.k)) % S : Math.min(S - 1, Math.floor(r.k / 250)); }
  function add(n) { for (let i = 0; i < n; i++) { const k = celeb && Math.random() < .5 ? 7 : mode === 'range' ? 900 + Math.floor(Math.random() * 99) : Math.floor(Math.random() * 1000); rows.push({ k: mode === 'range' && !celeb ? Math.min(999, 600 + rows.length % 400) : k }); } draw(); }
  function draw() {
    const cnt = Array(S).fill(0); rows.forEach(r => cnt[shardOf(r)]++);
    const mx = Math.max(10, ...cnt);
    let s = '<svg viewBox="0 0 560 170">';
    cnt.forEach((c, i) => { const x = 40 + i * 130, h = c / mx * 110; s += '<rect x="' + x + '" y="' + (140 - h) + '" width="90" height="' + h + '" rx="8" class="' + (c === Math.max(...cnt) && c > rows.length / S * 1.6 ? 'sm-bad' : 'sm-ac') + '"/><text class="sm-t" x="' + (x + 45) + '" y="160" text-anchor="middle">shard ' + i + (mode === 'range' ? ' [' + i * 250 + '–' + (i * 250 + 249) + ']' : '') + '</text><text class="sm-ts" x="' + (x + 45) + '" y="' + (134 - h) + '" text-anchor="middle">' + c + '</text>'; });
    s += '</svg>'; ui.stage.innerHTML = s;
    ui.stats.innerHTML = '<span>' + rows.length + ' rows</span><span>' + (mode === 'hash' ? 'shard = hash(key) % 4' : 'shard = key range') + '</span>' + (celeb ? '<span class="bad">hot key 7</span>' : '');
  }
  ui.ctl.innerHTML = '<button class="chip on" data-m="hash">Hash key</button><button class="chip" data-m="range">Range (time-ordered IDs)</button><button class="btn small primary" data-a="add">Insert 40</button><label><input type="checkbox" data-c> celebrity hot key</label><button class="btn small ghost" data-a="reset">Reset</button>';
  ui.ctl.onclick = e => { const m = e.target.closest('[data-m]'), a = e.target.closest('[data-a]'); if (m) { mode = m.dataset.m; rows = []; $$('[data-m]', ui.ctl).forEach(b => b.classList.toggle('on', b === m)); draw(); } if (a && a.dataset.a === 'add') add(40); if (a && a.dataset.a === 'reset') { rows = []; draw(); } };
  $('[data-c]', ui.ctl).onchange = e => { celeb = e.target.checked; };
  ui.note.innerHTML = 'Range keys keep scans cheap but new, time-ordered IDs all hit the <b>last shard</b>. Hashing spreads writes evenly but range queries must ask every shard. One celebrity key still overloads its shard: split it (key#1…key#N) or cache it.';
  draw();
};

/* ---------------- shared bits ---------------- */
function quizHTML(qs, key) {
  return '<div class="sd-qz" data-key="' + esc(key || '') + '">' + qs.map((q, qi) => '<div class="sdq" data-q="' + qi + '"><div class="qt">' + q.q + '</div><div class="opts">' + q.options.map((o, i) => '<button class="opt" data-o="' + i + '"><span class="l">' + 'ABCDE'[i] + '</span><span>' + o + '</span></button>').join('') + '</div><div class="why" hidden>' + (q.why || '') + '</div></div>').join('') + '</div>';
}
function wireQuiz(root, qs, key) {
  root.addEventListener('click', e => {
    const b = e.target.closest('.sdq .opt'); if (!b || b.disabled) return;
    const box = b.closest('.sdq'), q = qs[+box.dataset.q], i = +b.dataset.o, ok = i === q.answer;
    $$('.opt', box).forEach((o, j) => { o.disabled = true; if (j === q.answer) o.classList.add('right'); else if (j === i) o.classList.add('wrong'); });
    $('.why', box).hidden = false;
    if (ok && prog.mark('qz:' + key + ':' + box.dataset.q)) app().xp(5, 'system design quiz');
  });
}
const sectionsNav = secs => '<div class="tabs sd-tabs" role="tablist">' + secs.map(([id, l], i) => '<button class="tab' + (i ? '' : ' on') + '" data-jump="' + id + '">' + l + '</button>').join('') + '</div>';
function wireJump(page) {
  const tabs = $$('[data-jump]', page);
  page.addEventListener('click', e => { const t = e.target.closest('[data-jump]'); if (!t) return; const el = document.getElementById(t.dataset.jump); if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); });
  if (!('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver(ents => { ents.forEach(en => { if (en.isIntersecting) tabs.forEach(t => t.classList.toggle('on', t.dataset.jump === en.target.id)); }); }, { rootMargin: '-30% 0px -60% 0px' });
  tabs.forEach(t => { const el = document.getElementById(t.dataset.jump); if (el) io.observe(el); });
  return () => io.disconnect();
}
const thumb = dg => '<div class="sd-thumb">' + diagramSVG(dg, { noLabels: true }).replace('class="sdg-svg"', 'class="sdg-svg" preserveAspectRatio="xMidYMid meet" style="min-width:0"') + '</div>';
const govPill = x => x && (x.govtech || x.source === 'govtech' || x.source === 'ogp') ? '<span class="sd-pill gov">' + esc(x.govtech_label || 'GovTech-relevant') + '</span>' : '';

/* ---------------- views ---------------- */
function viewHome(page) {
  const p = prog.get();
  const cDone = CONCEPTS.filter(c => p['c:' + c.id]).length, dDone = DESIGNS.filter(d => p['d:' + d.id]).length, qDone = PRACTICE.filter(q => p['q:' + q.id]).length;
  const kpi = (l, n, t, h) => '<a class="sd-kpi" href="#' + h + '"><span>' + l + '</span><b>' + n + '<small style="font-size:13px;color:var(--muted)"> / ' + t + '</small></b><div class="bar"><i style="width:' + (t ? Math.round(n / t * 100) : 0) + '%"></i></div></a>';
  const groups = [...new Set(CONCEPTS.map(c => c.group))];
  const G = ROUND.grl_cards || [];
  const grlDesigns = DESIGNS.filter(d => /Giant Robots/.test(d.govtech_label || ''));
  page.innerHTML = '<div class="sd-hero"><h1>System design</h1><p>Watch real architectures handle requests. Then practise against the clock.</p></div>' +
    '<div class="sd-kpis">' + kpi('Designs studied', dDone, DESIGNS.length, 'sd-designs') + kpi('Timed rounds done', qDone, PRACTICE.length, 'sd-practice') + kpi('Building blocks', cDone, CONCEPTS.length, 'sd-designs') + '</div>' +
    (G.length ? '<section class="sd-sec"><div class="day-h"><h2>AI product rounds</h2></div><div class="sd-bul">' + G.map(c => '<div class="sd-box soft"><h3>' + esc(c.title) + '</h3><ul class="sd-list' + (c.tone ? ' ' + c.tone : '') + '">' + c.items.map(x => '<li>' + x + '</li>').join('') + '</ul></div>').join('') + '</div>' +
      (grlDesigns.length ? '<div class="sd-grid">' + grlDesigns.map(designCard).join('') + '</div>' : '') + '</section>' : '') +
    (ROUND.steps ? '<section class="sd-sec"><div class="day-h"><h2>The 45-minute shape</h2><span class="muted">hover a step for what to do</span></div><div class="sd-steps">' + ROUND.steps.map((s, i) => '<div class="sd-step" title="' + esc(s.do) + '"><i>' + esc(s.minutes || '') + '</i><b>' + (i + 1) + '. ' + esc(s.title) + '</b></div>').join('') + '</div></section>' : '') +
    '<section class="sd-sec"><div class="day-h"><h2>Classic designs</h2><a class="muted" href="#sd-designs">All ' + DESIGNS.length + ' →</a></div><div class="sd-grid">' + DESIGNS.filter(d => d.featured && !/Giant Robots/.test(d.govtech_label || '')).slice(0, 6).map(designCard).join('') + '</div></section>' +
    groups.map(g => '<section class="sd-sec"><div class="day-h"><h2>' + esc(g) + '</h2><span class="muted">' + CONCEPTS.filter(c => c.group === g && p['c:' + c.id]).length + '/' + CONCEPTS.filter(c => c.group === g).length + '</span></div><div class="sd-chips">' + CONCEPTS.filter(c => c.group === g).map(c => '<a class="sd-chip' + (p['c:' + c.id] ? ' done' : '') + '" href="#sd-c-' + c.id + '"' + (c.sim ? ' title="Has an interactive simulation"' : '') + '>' + (c.sim ? '<svg class="sd-play" viewBox="0 0 12 12" aria-label="interactive"><path d="M3 2l7 4-7 4z"/></svg>' : '') + esc(c.title) + (p['c:' + c.id] ? ' ✓' : '') + '</a>').join('') + '</div></section>').join('') +
    (ROUND.process ? '<details class="sd-more"><summary>What candidates report about GovTech rounds</summary><div class="sd-prose">' + ROUND.process + '</div></details>' : '');
}
function designCard(d) {
  return '<a class="sd-card" href="#sd-d-' + d.id + '">' + (d.diagram ? thumb(d.diagram) : '') + '<h3>' + esc(d.title) + '</h3><p>' + esc(d.tagline) + '</p><div class="sd-meta">' + govPill(d) + (d.mirrors ? '<span class="sd-pill">≈ ' + esc(d.mirrors) + '</span>' : '') + '<span class="sd-pill' + (d.difficulty === 'hard' ? ' lvl-hard' : '') + '">' + esc(d.difficulty || 'medium') + '</span>' + (prog.has('d:' + d.id) ? '<span class="done">✓ studied</span>' : '') + '</div></a>';
}
function viewDesigns(page) {
  let f = 'all';
  page.classList.add('wide');
  page.innerHTML = '<div class="sd-head"><h1>Designs</h1><p>Famous architectures broken into requirements, numbers, components and request flows. Press ▶ on any diagram to watch a request travel through it.</p></div><div class="sd-filter"></div><div class="sd-grid" id="dg"></div>';
  const draw = () => {
    $('.sd-filter', page).innerHTML = [['all', 'All'], ['gov', 'GovTech'], ['classic', 'Classic big-tech']].map(([k, l]) => '<button class="chip' + (f === k ? ' on' : '') + '" data-f="' + k + '">' + l + '</button>').join('');
    const list = DESIGNS.filter(d => f === 'all' || (f === 'gov' ? d.govtech : !d.govtech));
    $('#dg', page).innerHTML = list.map(designCard).join('');
  };
  page.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { f = b.dataset.f; draw(); } });
  draw();
}
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rarr;/g, '→').replace(/&le;/g, '≤').replace(/&ge;/g, '≥');
const more = (title, inner, open) => inner ? '<details class="sd-more"' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="sd-more-b">' + inner + '</div></details>' : '';
function viewDesign(page, d, cleanup) {
  page.classList.add('wide');
  const R = d.requirements || {};
  const pp = PRACTICE.find(q => q.design === d.id);
  const scale = (d.estimates || []).map(e => '<div class="sdkv" title="' + esc(e.calc || '') + '"><span>' + esc(e.label) + '</span><b>' + esc(e.value) + '</b></div>').join('');
  const api = (d.api || []).map(a => '<div class="sdkv api" title="' + esc(a.desc || '') + '"><span class="m ' + esc(a.method) + '">' + esc(a.method) + '</span><code>' + esc(String(a.path).split(' ')[0]) + '</code></div>').join('');
  const data = (d.data || []).map(t => '<div class="sdkv" title="' + esc((t.fields || []).join(', ')) + '"><span>' + esc(t.name) + '</span><b>' + esc(t.store || '') + '</b></div>').join('');
  const dec = (d.tradeoffs || []).map(t => '<details class="dec"><summary><span>' + esc(t.choice) + '</span><b>→ ' + esc(t.pick) + '</b></summary><div>' + t.why + '</div></details>').join('');
  const brk = (d.bottlenecks || []).map(b => '<details class="dec"><summary><span>' + esc(b.issue) + '</span><b>fix ›</b></summary><div>' + b.fix + '</div></details>').join('');
  page.innerHTML = '<div class="sd-head"><div class="row"><a class="btn small ghost" href="#sd-designs">← Designs</a>' + govPill(d) + (d.mirrors ? '<span class="sd-pill">≈ ' + esc(d.mirrors) + '</span>' : '') + '<span class="sd-pill">' + esc(d.difficulty || 'medium') + '</span></div><h1>' + esc(d.title) + '</h1><p>' + esc(d.tagline) + '</p></div>' +
    '<div class="dg-host"></div>' +
    '<div class="sd-cheat">' +
      (scale ? '<div class="sd-box"><h3>Scale</h3>' + scale + '</div>' : '') +
      (api ? '<div class="sd-box"><h3>API</h3>' + api + '</div>' : '') +
      (data ? '<div class="sd-box"><h3>Data</h3>' + data + '</div>' : '') +
      (dec ? '<div class="sd-box wide2"><h3>Key decisions </h3>' + dec + '</div>' : '') +
      (brk ? '<div class="sd-box wide2"><h3>Breaks first</h3>' + brk + '</div>' : '') +
    '</div>' +
    ((d.quiz || []).length ? '<section class="sd-blk" id="s-quiz"><h2>Quick check</h2>' + quizHTML(d.quiz, 'd:' + d.id) + '</section>' : '') +
    '<div class="sd-mores">' +
      more('Requirements (say these first)', '<div class="sd-two"><ul class="sd-list ok">' + (R.functional || []).map(x => '<li>' + x + '</li>').join('') + '</ul><ul class="sd-list">' + (R.nonfunctional || []).map(x => '<li>' + x + '</li>').join('') + '</ul></div>' + ((R.out_of_scope || []).length ? '<ul class="sd-list no">' + R.out_of_scope.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '')) +
      more('Interviewer follow-ups', (d.followups || []).length ? '<div class="sd-qa">' + d.followups.map(f => '<details><summary>' + f.q + '</summary><div class="a">' + f.a + '</div></details>').join('') + '</div>' : '') +
      more('Deep dives', (d.deep || []).map((x, i) => '<div class="sd-box"><h3>' + esc(x.title) + '</h3><div class="sd-prose">' + x.html + '</div>' + (x.diagram ? '<div class="dd-host" data-i="' + i + '"></div>' : '') + (x.sim && SIMS[x.sim] ? '<div class="ds-host" data-sim="' + esc(x.sim) + '"></div>' : '') + '</div>').join('')) +
      more('Why this matters for GovTech', d.govtech_note || '') +
    '</div>' +
    '<div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><button class="btn" id="mk"></button>' + (pp ? '<a class="btn primary" href="#sd-q-' + pp.id + '">Practise this, timed →</a>' : '<a class="btn primary" href="#sd-practice">Practise →</a>') + '</div>';
  cleanup.push(mountDiagram($('.dg-host', page), d.diagram || { nodes: [], edges: [] }, d.flows, { label: d.title }));
  // mount deep-dive diagrams and sims only when that section is opened
  page.addEventListener('toggle', e => {
    const det = e.target; if (!det.open || det.dataset.mounted) return; det.dataset.mounted = '1';
    $$('.dd-host', det).forEach(h => { const x = d.deep[+h.dataset.i]; cleanup.push(mountDiagram(h, x.diagram, x.flows, { label: x.title })); });
    $$('.ds-host', det).forEach(h => { const r = SIMS[h.dataset.sim](h); if (typeof r === 'function') cleanup.push(r); });
  }, true);
  if ((d.quiz || []).length) wireQuiz($('#s-quiz', page), d.quiz, 'd:' + d.id);
  const mk = $('#mk', page), paint = () => { const on = prog.has('d:' + d.id); mk.textContent = on ? '✓ Studied' : 'Mark as studied'; mk.className = 'btn' + (on ? ' go' : ''); };
  mk.onclick = () => { if (prog.mark('d:' + d.id)) app().xp(25, 'studied ' + d.title); paint(); };
  paint();
}
function viewConcept(page, c, cleanup) {
  const idx = CONCEPTS.indexOf(c), nx = CONCEPTS[idx + 1], pv = CONCEPTS[idx - 1];
  page.innerHTML = '<div class="sd-head"><div class="row"><a class="btn small ghost" href="#sd">← System design</a><span class="sd-pill">' + esc(c.group) + '</span></div><h1>' + esc(c.title) + '</h1><p>' + esc(c.tagline) + '</p></div>' +
    (c.sim && SIMS[c.sim] ? '<div class="sim-host"></div>' : '') +
    (c.diagram ? '<div class="dg-host"></div>' : '') +
    ((c.say || []).length ? '<div class="callout key"><div class="lbl">Say this in the interview</div><ul class="sd-list ok" style="margin-top:4px">' + c.say.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' : '') +
    ((c.tradeoffs || []).length ? '<div class="sd-box"><h3>Options</h3>' + c.tradeoffs.map(t => '<details class="dec"><summary><span>' + esc(t.option) + '</span><b>pros / cons ›</b></summary><div><b style="color:var(--ok)">+</b> ' + t.pro + '<br><b style="color:var(--bad)">−</b> ' + t.con + '</div></details>').join('') + '</div>' : '') +
    ((c.numbers || []).length ? '<div class="sd-chips">' + c.numbers.map(x => '<span class="sd-chip static">' + x + '</span>').join('') + '</div>' : '') +
    ((c.quiz || []).length ? '<section class="sd-blk" id="cq"><h2>Quick check</h2>' + quizHTML(c.quiz, 'c:' + c.id) + '</section>' : '') +
    '<div class="sd-mores">' + more('How it works', (c.why || '') + (c.how || '')) + more('Pitfalls', (c.pitfalls || []).length ? '<ul class="sd-list no">' + c.pitfalls.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') +
      more('Used in', (c.used_in || []).filter(id => DES[id]).map(id => '<a class="chip" href="#sd-d-' + id + '">' + esc(DES[id].title) + '</a>').join(' ')) + '</div>' +
    '<div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">' + (pv ? '<a class="btn" href="#sd-c-' + pv.id + '">← ' + esc(pv.title) + '</a>' : '<span></span>') + '<button class="btn" id="mk"></button>' + (nx ? '<a class="btn primary" href="#sd-c-' + nx.id + '">' + esc(nx.title) + ' →</a>' : '<a class="btn primary" href="#sd-designs">On to designs →</a>') + '</div>';
  if (c.sim && SIMS[c.sim]) { const r = SIMS[c.sim]($('.sim-host', page)); if (typeof r === 'function') cleanup.push(r); }
  if (c.diagram) cleanup.push(mountDiagram($('.dg-host', page), c.diagram, c.flows, { label: c.title }));
  if ((c.quiz || []).length) wireQuiz($('#cq', page), c.quiz, 'c:' + c.id);
  const mk = $('#mk', page), paint = () => { const on = prog.has('c:' + c.id); mk.textContent = on ? '✓ Learned' : 'Mark as learned'; mk.className = 'btn' + (on ? ' go' : ''); };
  mk.onclick = () => { if (prog.mark('c:' + c.id)) app().xp(15, 'learned ' + c.title); paint(); };
  paint();
}
function viewPracticeList(page) {
  const p = prog.get();
  const src = q => /Role-specific/.test(q.evidence_tag || '') ? 'grl' : q.source === 'govtech' || q.source === 'ogp' ? 'gov' : 'classic';
  page.innerHTML = '<div class="sd-head"><h1>Timed rounds</h1></div>' +
    [['grl', 'AI products', 'LLM features: retrieval, evals, cost, fallbacks'], ['gov', 'GovTech', 'reported or GovTech-flavoured'], ['classic', 'Classic questions', 'common elsewhere; good practice for the same round']].map(([k, t, s]) => {
      const list = PRACTICE.filter(q => src(q) === k); if (!list.length) return '';
      return '<section class="sd-sec"><div class="day-h"><h2>' + t + '</h2><span class="muted">' + s + '</span></div><div class="plist">' + list.map(q => '<a class="prow" href="#sd-q-' + q.id + '"><span class="sdot ' + (p['q:' + q.id] ? 'solved' : '') + '">' + (p['q:' + q.id] ? '✓' : '') + '</span><span class="ttl">' + esc(q.title) + (q.evidence_tag ? ' <span class="sd-pill gov" style="margin-left:6px">' + esc(q.evidence_tag) + '</span>' : '') + '</span><span class="lvl">' + esc((q.minutes || 45) + ' min') + '</span></a>').join('') + '</div></section>';
    }).join('');
}
function viewPractice(page, q, cleanup) {
  page.classList.add('wide');
  const key = 'sdq:' + q.id, saved = store.get(key, { notes: {}, rubric: {}, t: (q.minutes || 45) * 60 });
  const save = () => store.set(key, saved);
  const D2 = q.design && DES[q.design];
  page.innerHTML = '<div class="sd-head"><div class="row"><a class="btn small ghost" href="#sd-practice">← Practice</a>' + govPill(q) + (q.evidence_tag ? '<span class="sd-pill">' + esc(q.evidence_tag) + '</span>' : '') + '</div><h1>' + esc(q.title) + '</h1></div>' +
    '<div class="sdp-bar"><button class="btn small primary" id="tgo">▶ Start timer</button><span class="tm" id="tm"></span><span class="phase" id="ph"></span><span class="sp"></span><button class="btn small ghost" id="trs">Reset</button></div>' +
    '<div class="callout key"><div class="lbl">The prompt</div>' + q.prompt + '</div>' + (q.evidence ? '<p class="ev">' + q.evidence + '</p>' : '') +
    ((q.clarify || []).length ? '<section class="sd-blk"><h2>Clarifying questions to ask first</h2><p class="muted">Ask before designing. Open one to see a sensible interviewer answer.</p><div class="sd-qa">' + q.clarify.map(c => '<details><summary>' + c.q + '</summary><div class="a">' + c.a + '</div></details>').join('') + '</div></section>' : '') +
    '<section class="sd-blk"><h2>Work it through</h2>' + (q.steps || []).map((s, i) => '<div class="sdp-step" data-i="' + i + '"><div class="h"><i>' + esc(s.minutes || '') + '</i><b>' + (i + 1) + '. ' + esc(s.title) + '</b></div><div class="ask">' + s.ask + '</div><textarea placeholder="Your notes…" data-n="' + i + '">' + esc(saved.notes[i] || '') + '</textarea><div><button class="btn small" data-rev="' + i + '">Show model answer</button></div><div class="sdp-model" hidden>' + s.model + '</div></div>').join('') + '</section>' +
    '<section class="sd-blk"><h2>Sketch your architecture</h2><p class="muted">Add components, connect them, then compare against the reference.</p><div class="wb-host"></div></section>' +
    ((q.rubric || []).length ? '<section class="sd-blk"><h2>Score yourself</h2><div class="rubric">' + q.rubric.map((r, i) => '<label><input type="checkbox" data-r="' + i + '"' + (saved.rubric[i] ? ' checked' : '') + '><span>' + r + '</span></label>').join('') + '</div><div class="sdp-score"><b id="sc"></b><span class="muted" id="scm"></span><span class="sp" style="flex:1"></span>' + (D2 ? '<a class="btn" href="#sd-d-' + D2.id + '">Full reference design</a>' : '') + '<button class="btn primary" id="fin">Finish round</button></div></section>' : '') + '<section class="sd-blk" id="aig"></section>';
  // timer
  let tick = null; const tm = $('#tm', page), ph = $('#ph', page), tgo = $('#tgo', page);
  const total = (q.minutes || 45) * 60;
  const phaseAt = left => { let el = total - left, acc = 0; for (const s of (q.steps || [])) { const m = parseFloat(s.minutes) || 0; acc += m * 60; if (el < acc) return s.title; } return 'Wrap up'; };
  const paintT = () => { const t = Math.max(0, saved.t); tm.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); tm.classList.toggle('low', t < 300); ph.textContent = tick ? 'Now: ' + phaseAt(t) : ''; };
  const stopT = () => { if (tick) clearInterval(tick); tick = null; tgo.textContent = '▶ ' + (saved.t < total ? 'Resume' : 'Start timer'); paintT(); };
  tgo.onclick = () => { if (tick) { stopT(); return; } tick = setInterval(() => { saved.t--; if (saved.t % 5 === 0) save(); if (saved.t <= 0) { stopT(); app().toast('Time! Wrap up and score yourself.', 'big'); } paintT(); }, 1000); tgo.textContent = '❚❚ Pause'; paintT(); };
  $('#trs', page).onclick = () => { stopT(); saved.t = total; save(); paintT(); };
  cleanup.push(() => { if (tick) clearInterval(tick); save(); });
  paintT();
  page.addEventListener('input', e => { const n = e.target.dataset.n; if (n != null) { saved.notes[n] = e.target.value; save(); } });
  page.addEventListener('click', e => { const r = e.target.closest('[data-rev]'); if (r) { const m = r.parentElement.nextElementSibling; m.hidden = !m.hidden; r.textContent = m.hidden ? 'Show model answer' : 'Hide model answer'; } });
  // whiteboard
  cleanup.push(mountBoard($('.wb-host', page), 'sdboard:' + q.id, D2 ? D2.diagram : null, D2 ? D2.title : ''));
  // rubric
  const sc = $('#sc', page), scm = $('#scm', page);
  const paintS = () => { if (!sc) return; const n = Object.values(saved.rubric).filter(Boolean).length, t = (q.rubric || []).length; sc.textContent = n + '/' + t; scm.textContent = n / t >= .8 ? 'Strong hire territory' : n / t >= .55 ? 'Solid: tighten the gaps' : 'Review the model answers'; };
  page.addEventListener('change', e => { const r = e.target.dataset.r; if (r != null) { saved.rubric[r] = e.target.checked; save(); paintS(); } });
  paintS();
  mountAIGrade($('#aig', page), q, saved, save, () => { page.querySelectorAll('[data-r]').forEach(x => { x.checked = !!saved.rubric[x.dataset.r]; }); paintS(); });
  const fin = $('#fin', page); if (fin) fin.onclick = () => { stopT(); const n = Object.values(saved.rubric).filter(Boolean).length; if (prog.mark('q:' + q.id)) app().xp(40 + n * 3, 'design round'); else app().toast('Round saved · ' + n + '/' + (q.rubric || []).length); paintS(); };
}

/* ---------------- AI grade for a practice round ---------------- */
function mountAIGrade(sec, q, saved, save, onRubric) {
  const strip = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const dots = n => '<span class="aig-dots">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>';
  const intro = msg => {
    sec.innerHTML = '<h2>AI grade</h2><p class="muted">Claude reads your notes and whiteboard, scores them like an interviewer and ticks the rubric.</p><div><button class="btn primary" data-g>Grade my answer</button></div>' + (msg ? '<p class="bad" style="margin-top:8px">' + esc(msg) + '</p>' : '');
  };
  const paint = G => {
    const R = q.rubric || [];
    sec.innerHTML = '<h2>AI grade</h2><div class="aig-top"><div class="aig-score"><b>' + esc(G.score) + '</b><span>/10</span></div><div><b class="aig-verdict">' + esc(G.verdict || '') + '</b><p>' + esc(G.summary || '') + '</p></div></div>' +
      ((G.top_fixes || []).length ? '<div class="aig-blk"><h3>Fix first</h3><ol>' + G.top_fixes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' : '') +
      ((G.steps || []).length ? '<div class="aig-blk"><h3>By step</h3>' + G.steps.map(s => { const st = (q.steps || [])[s.i] || {}; return '<div class="aig-step"><div class="aig-sh"><b>' + esc(st.title || ('Step ' + (+s.i + 1))) + '</b>' + dots(+s.score || 0) + '</div>' + (s.good ? '<p><span class="ok">✓</span> ' + esc(s.good) + '</p>' : '') + (s.missing ? '<p><span class="bad">✗</span> ' + esc(s.missing) + '</p>' : '') + '</div>'; }).join('') + '</div>' : '') +
      ((G.rubric || []).length ? '<div class="aig-blk"><h3>Rubric</h3>' + G.rubric.map(r => '<p class="aig-r"><span class="' + (r.met ? 'ok' : 'bad') + '">' + (r.met ? '✓' : '✗') + '</span> <span>' + esc(strip(R[r.i] || '')) + (r.why ? ' <span class="muted">· ' + esc(r.why) + '</span>' : '') + '</span></p>').join('') + '</div>' : '') +
      (G.followup ? '<div class="callout key"><div class="lbl">Next question they would ask</div>' + esc(G.followup) + '</div>' : '') +
      '<div class="row" style="gap:8px;margin-top:12px"><button class="btn small" data-g>Grade again</button></div>';
  };
  const ask = async () => {
    const S = window.APP10K && APP10K.ai ? APP10K.ai() : null;
    if (!S) { sec.innerHTML = '<h2>AI grade</h2><p class="muted">Claude is not available on this page right now.</p>'; return; }
    const notes = (q.steps || []).map((s, i) => String(saved.notes[i] || '').trim());
    const B = store.get('sdboard:' + q.id, null) || { nodes: [], edges: [] };
    if (!notes.some(Boolean) && !B.nodes.length) { intro('Write notes in at least one step or sketch on the whiteboard first.'); return; }
    sec.innerHTML = '<h2>AI grade</h2><p class="muted">Claude is reading your answer…</p>';
    const name = id => { const n = B.nodes.find(x => x.id === id); return n ? n.label : id; };
    const prompt = 'You are a senior engineer grading a ' + (q.minutes || 45) + '-minute system design interview. Grade only what the candidate wrote and drew. The model answers are for your reference; do not credit the candidate for them. Be specific and fair; short answers that hit the key points score well.\n\nQUESTION: ' + strip(q.prompt) +
      '\n\n' + (q.steps || []).map((s, i) => 'STEP ' + i + ': ' + s.title + '\nAsked: ' + strip(s.ask) + '\nCANDIDATE NOTES: <<<' + (notes[i] || '(nothing written)').slice(0, 1500) + '>>>\nReference model answer: ' + strip(s.model).slice(0, 700)).join('\n\n') +
      '\n\nCANDIDATE WHITEBOARD: ' + (B.nodes.length ? 'components: ' + B.nodes.map(n => n.label + ' (' + n.kind + ')').join(', ') + '; connections: ' + (B.edges.map(e => name(e.from) + ' -> ' + name(e.to) + (e.label ? ' (' + e.label + ')' : '')).join(', ') || 'none') : '(empty)') +
      '\n\nRUBRIC:\n' + (q.rubric || []).map((r, i) => i + '. ' + strip(r)).join('\n') +
      '\n\nReply with ONLY JSON: {"score": 1-10, "verdict": "Strong hire|Hire|Lean hire|Lean no hire|No hire", "summary": "two plain sentences", "top_fixes": ["the 3 most important things to add or change"], "steps": [{"i": 0, "score": 1-5, "good": "one short line or empty", "missing": "one short line or empty"}], "rubric": [{"i": 0, "met": true, "why": "a few words"}], "followup": "one probing follow-up question the interviewer would ask next"}';
    try {
      const G = await S.json(prompt, { cache: false });
      if (!G || typeof G !== 'object' || G.score == null) throw { code: 'bad' };
      saved.ai = G;
      (G.rubric || []).forEach(r => { if (r && r.i != null && r.i < (q.rubric || []).length) saved.rubric[r.i] = !!r.met; });
      save(); onRubric();
      if (!saved.aiXp) { saved.aiXp = 1; save(); app().xp(15, 'AI-graded design'); }
      paint(G);
    } catch (e) {
      sec.innerHTML = '<h2>AI grade</h2><p class="muted">' + esc((window.APP10K && APP10K.aiErr && APP10K.aiErr(e && e.code)) || 'Could not get a grade right now.') + '</p><div><button class="btn small" data-g>Try again</button></div>';
    }
  };
  sec.addEventListener('click', e => { if (e.target.closest('[data-g]')) ask(); });
  if (saved.ai) paint(saved.ai); else intro();
}

/* ---------------- whiteboard ---------------- */
const MODE_IC = {
  move: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.04 4.65a.5.5 0 0 1 .61-.61l15.5 5.83a.5.5 0 0 1-.04.95l-6.53 1.8a1.5 1.5 0 0 0-1.05 1.05l-1.8 6.53a.5.5 0 0 1-.95.04z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5"/><path d="M10 5h9v9"/></svg>',
  clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
};
/* The whiteboard. Inline (inside a practice question) it is a card with the palette on top.
   With opt.full it fills the viewport: the page header floats over it and the tools sit in a bar at the bottom. */
function mountBoard(host, key, ref, refTitle, opt) {
  const full = !!(opt && opt.full);
  const st = store.get(key, null) || { nodes: [], edges: [] };
  let sel = null, selE = null, mode = 'move', from = null, drag = null, nid = st.nodes.reduce((m, n) => Math.max(m, +(n.id.slice(1)) || 0), 0) + 1;
  let W = 960, H = 520;
  const addBtn = k => '<button class="btn small ghost k-' + k + '" data-add="' + k + '" title="Add ' + esc(KIND_NAME[k]) + '"' + (full ? ' aria-label="Add ' + esc(KIND_NAME[k]) + '"' : '') + '>' + iconSvg(k) + (full ? '' : esc(KIND_NAME[k])) + '</button>';
  const pal = KIND_GROUP.map(([g, ks]) => ks.map(addBtn).join('')).join('<span class="sep"></span>');
  const modes = full
    ? '<div class="wb-modes" role="group" aria-label="Tool"><button class="wb-tool on" data-mode="move" title="Move (V)" aria-label="Move" aria-pressed="true">' + MODE_IC.move + '</button><button class="wb-tool" data-mode="link" title="Connect (C)" aria-label="Connect" aria-pressed="false">' + MODE_IC.link + '</button></div>'
    : '<button class="chip on" data-mode="move">Move</button><button class="chip" data-mode="link">Connect</button>';
  host.innerHTML = full
    ? '<div class="wb wb-full"><div class="sdg"><div class="sdg-scroll"></div></div><div class="wb-float"><div class="wb-insp"></div><div class="wb-bar" role="toolbar" aria-label="Whiteboard tools">' + modes + '<span class="sep"></span><div class="wb-pal">' + pal + '</div><span class="sep"></span><button class="wb-tool" data-a="clear" title="Clear the board" aria-label="Clear the board">' + MODE_IC.clear + '</button></div></div><div class="wb-cmp" hidden></div></div>'
    : '<div class="wb"><div class="wb-pal">' + pal + '</div><div class="wb-pal" style="padding-top:0">' + modes + '<span class="sp" style="flex:1"></span>' + (ref ? '<button class="btn small" data-a="cmp">Compare with reference</button>' : '') + '<button class="btn small ghost" data-a="clear">Clear</button></div><div class="sdg"><div class="sdg-scroll"></div></div><div class="wb-insp"></div><div class="wb-cmp" hidden></div></div>';
  const wb = $('.wb', host), sc = $('.sdg-scroll', wb), insp = $('.wb-insp', wb), cmp = $('.wb-cmp', wb);
  const save = () => store.set(key, st);
  // full page: the canvas is the viewport, and grows past it when boxes sit further out (then it scrolls)
  function size() {
    if (!full) return;
    W = Math.max(sc.clientWidth || window.innerWidth, ...st.nodes.map(n => n.x + 90));
    H = Math.max(sc.clientHeight || window.innerHeight, ...st.nodes.map(n => n.y + 60));
  }
  function draw() {
    size();
    sc.innerHTML = diagramSVG({ w: W, h: H, nodes: st.nodes, edges: st.edges.map((e, i) => Object.assign({ id: 'w' + i }, e)) }, { label: 'Your whiteboard' });
    const svg = $('svg', sc); svg.style.minWidth = '0';
    if (full) { svg.style.width = W + 'px'; svg.style.height = H + 'px'; }
    if (sel) { const el = $('[data-n="' + cssEsc(sel) + '"]', svg); if (el) el.classList.add('sel'); }
    if (selE != null) { const el = $('[data-e="w' + selE + '"]', svg); if (el) el.classList.add('sel'); }
    if (!st.nodes.length) svg.insertAdjacentHTML('beforeend', '<text x="' + Math.round(full ? sc.scrollLeft + sc.clientWidth / 2 : W / 2) + '" y="' + Math.round(full ? sc.scrollTop + sc.clientHeight / 2 : 260) + '" text-anchor="middle" style="font:500 14px var(--f-body);fill:var(--muted)">' + (full ? 'Add components from the toolbar below' : 'Add components from the palette above') + '</text>');
    paintInsp();
  }
  function paintInsp() {
    const n = st.nodes.find(x => x.id === sel);
    if (n) { insp.innerHTML = '<input value="' + esc(n.label) + '" data-f="label" aria-label="Label"><input value="' + esc(n.sub || '') + '" data-f="sub" placeholder="detail (e.g. Postgres)" aria-label="Detail"><select data-f="kind" aria-label="Kind">' + Object.keys(KIND_NAME).map(k => '<option value="' + k + '"' + (k === n.kind ? ' selected' : '') + '>' + KIND_NAME[k] + '</option>').join('') + '</select><button class="btn small ghost" data-a="del">Delete</button>'; return; }
    if (selE != null && st.edges[selE]) { const e = st.edges[selE]; insp.innerHTML = '<input value="' + esc(e.label || '') + '" data-f="elabel" placeholder="label, e.g. HTTPS" aria-label="Edge label"><button class="btn small ghost" data-a="flip">Flip</button><button class="btn small ghost" data-a="dash">' + (e.dashed ? 'Solid' : 'Async (dashed)') + '</button><button class="btn small ghost" data-a="delE">Delete arrow</button>'; return; }
    insp.innerHTML = mode === 'link' ? (from ? 'Now click the target component.' : 'Click the component the arrow starts from.') : full ? '' : 'Drag to move. Click a component or arrow to edit it.';
  }
  const pt = e => { const svg = $('svg', sc), r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  sc.addEventListener('pointerdown', e => {
    const ng = e.target.closest('.sdg-node'), eg = e.target.closest('.sdg-edge');
    if (ng) {
      const id = ng.dataset.n;
      if (mode === 'link') { if (!from) { from = id; sel = id; selE = null; draw(); } else if (from !== id) { if (!st.edges.some(x => x.from === from && x.to === id)) st.edges.push({ from, to: id }); from = null; sel = null; save(); draw(); } return; }
      sel = id; selE = null; const n = st.nodes.find(x => x.id === id), p = pt(e); drag = { n, dx: p.x - n.x, dy: p.y - n.y }; sc.setPointerCapture(e.pointerId); draw(); return;
    }
    if (eg) { selE = +eg.dataset.e.slice(1); sel = null; draw(); return; }
    sel = null; selE = null; from = null; draw();
  });
  sc.addEventListener('pointermove', e => { if (!drag) return; const p = pt(e); drag.n.x = Math.round(Math.max(70, Math.min(W - 70, p.x - drag.dx)) / 10) * 10; drag.n.y = Math.round(Math.max(30, Math.min(H - 30, p.y - drag.dy)) / 10) * 10; const svg = $('svg', sc); const fresh = diagramSVG({ w: W, h: H, nodes: st.nodes, edges: st.edges.map((x, i) => Object.assign({ id: 'w' + i }, x)) }); svg.innerHTML = fresh.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); const el = $('[data-n="' + cssEsc(drag.n.id) + '"]', svg); if (el) el.classList.add('sel'); });
  sc.addEventListener('pointerup', () => { if (drag) { drag = null; save(); draw(); } });
  wb.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'), m = e.target.closest('[data-mode]'), a = e.target.closest('[data-a]');
    if (add) { const k = add.dataset.add, i = st.nodes.length; st.nodes.push(Object.assign({ id: 'n' + nid++, kind: k, label: KIND_NAME[k] }, full ? fullSpot(i) : { x: 110 + (i * 170) % 760, y: 70 + Math.floor(i * 170 / 760) * 100 % 420 })); sel = st.nodes[st.nodes.length - 1].id; selE = null; save(); draw(); }
    if (m) setMode(m.dataset.mode);
    if (!a) return;
    const k = a.dataset.a;
    if (k === 'del') { st.edges = st.edges.filter(x => x.from !== sel && x.to !== sel); st.nodes = st.nodes.filter(x => x.id !== sel); sel = null; save(); draw(); }
    if (k === 'delE') { st.edges.splice(selE, 1); selE = null; save(); draw(); }
    if (k === 'flip') { const x = st.edges[selE]; [x.from, x.to] = [x.to, x.from]; save(); draw(); }
    if (k === 'dash') { st.edges[selE].dashed = !st.edges[selE].dashed; save(); draw(); }
    if (k === 'clear') (window.UI ? UI.confirm('Clear the whiteboard?', { detail: 'Every box and arrow on this board will be removed.', ok: 'Clear', danger: true }) : Promise.resolve(confirm('Clear the whiteboard?'))).then(yes => { if (yes) { st.nodes = []; st.edges = []; sel = null; selE = null; save(); draw(); } });
    if (k === 'cmp') compare();
  });
  insp.addEventListener('input', e => { const f = e.target.dataset.f; if (!f) return; if (f === 'elabel') st.edges[selE].label = e.target.value; else { const n = st.nodes.find(x => x.id === sel); if (n) n[f] = e.target.value; } save(); const keep = document.activeElement === e.target; const v = e.target.value; sc.innerHTML = ''; draw(); if (keep) { const inp = $('[data-f="' + f + '"]', insp); if (inp) { inp.focus(); inp.setSelectionRange(v.length, v.length); } } });
  insp.addEventListener('change', e => { if (e.target.dataset.f === 'kind') draw(); });
  function compare() {
    cmp.hidden = false;
    const have = new Set(st.nodes.map(n => n.kind)), refK = [...new Set(ref.nodes.map(n => n.kind))];
    const fam = { db: ['db', 'nosql'], nosql: ['db', 'nosql'], queue: ['queue', 'stream'], stream: ['queue', 'stream'], lb: ['lb', 'gateway'], gateway: ['lb', 'gateway'], client: ['client', 'mobile', 'user'], mobile: ['client', 'mobile', 'user'], user: ['client', 'mobile', 'user'], service: ['service', 'fn'], fn: ['service', 'fn'] };
    const covered = k => (fam[k] || [k]).some(x => have.has(x));
    const miss = refK.filter(k => !covered(k)), got = refK.filter(covered);
    cmp.innerHTML = '<div class="day-h"><h2 style="font-size:14px">Compared with the reference' + (refTitle ? ': ' + esc(refTitle) : '') + '</h2><span class="muted">' + got.length + '/' + refK.length + ' component types covered</span></div>' +
      (miss.length ? '<ul class="sd-list no">' + miss.map(k => '<li>No <b>' + esc(KIND_NAME[k]) + '</b> yet. Reference uses: ' + esc(ref.nodes.filter(n => n.kind === k).map(n => n.label).join(', ')) + '</li>').join('') + '</ul>' : '<p class="muted" style="margin:0">Every component type in the reference is on your board. Now compare the arrows.</p>') +
      '<div class="ref-host"></div>';
    mountDiagram($('.ref-host', cmp), ref, [], { label: 'Reference' });
  }
  function setMode(v) { mode = v; from = null; wb.classList.toggle('connecting', mode === 'link'); $$('[data-mode]', wb).forEach(b => { const on = b.dataset.mode === v; b.classList.toggle('on', on); if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on)); }); paintInsp(); }
  // a new box in full mode lands in a grid in the middle of what is on screen, clear of the floating header
  function fullSpot(i) {
    const cols = Math.max(1, Math.min(5, Math.floor((sc.clientWidth - 40) / 170))), cx = sc.scrollLeft + sc.clientWidth / 2, top = sc.scrollTop + Math.max(190, sc.clientHeight * 0.28);
    return { x: Math.round((cx + ((i % cols) - (cols - 1) / 2) * 170) / 10) * 10, y: Math.round((top + (Math.floor(i / cols) % 4) * 100) / 10) * 10 };
  }
  const offs = [];
  if (full) {
    const onResize = () => draw();
    const onKey = e => {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], dialog')) return;
      if (e.key === 'v' || e.key === 'V') setMode('move');
      else if (e.key === 'c' || e.key === 'C') setMode('link');
      else if (e.key === 'Escape') { sel = null; selE = null; from = null; draw(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && (sel || selE != null)) { e.preventDefault(); const b = $(sel ? '[data-a=del]' : '[data-a=delE]', insp); if (b) b.click(); }
    };
    // fade the palette's edges while it has more icons to scroll to
    const palEl = $('.wb-bar .wb-pal', wb), edge = () => { const max = palEl.scrollWidth - palEl.clientWidth; palEl.classList.toggle('fl', palEl.scrollLeft > 2); palEl.classList.toggle('fr', palEl.scrollLeft < max - 2); };
    palEl.addEventListener('scroll', edge, { passive: true }); requestAnimationFrame(edge);
    window.addEventListener('resize', onResize); window.addEventListener('resize', edge); document.addEventListener('keydown', onKey);
    offs.push(() => window.removeEventListener('resize', edge));
    offs.push(() => window.removeEventListener('resize', onResize), () => document.removeEventListener('keydown', onKey));
  }
  draw();
  return () => { save(); offs.forEach(f => f()); };
}

function viewBoard(page, cleanup) {
  page.classList.add('wide', 'wb-page'); document.body.classList.add('wb-on');
  page.innerHTML = '<div class="sd-head"><h1>Whiteboard</h1></div><div class="wb-host"></div>';
  cleanup.push(mountBoard($('.wb-host', page), 'sdboard:free', null, '', { full: true }), () => document.body.classList.remove('wb-on'));
}

/* ---------------- drill ---------------- */
function drillPool() {
  const pool = DRILL.map(q => Object.assign({ src: q.topic || 'Drill' }, q));
  CONCEPTS.forEach(c => (c.quiz || []).forEach(q => pool.push(Object.assign({ src: c.title }, q))));
  DESIGNS.forEach(d => (d.quiz || []).forEach(q => pool.push(Object.assign({ src: d.title }, q))));
  return pool;
}
function viewDrill(page) {
  const pool = drillPool();
  let order = [], i = 0, score = 0, streak = 0, best = store.get('sdBest', 0), answered = false;
  const shuffle = a => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  const start = () => { order = shuffle(pool.map((_, k) => k)).slice(0, 10); i = 0; score = 0; streak = 0; draw(); };
  function draw() {
    if (i >= order.length) {
      if (score > best) { best = score; store.set('sdBest', best); }
      page.innerHTML = '<div class="sd-head"><h1>Round over</h1><p>' + score + ' / ' + order.length + ' correct. Best round: ' + best + '.</p></div><div class="row"><button class="btn primary" id="again">Another 10 →</button><a class="btn" href="#sd-cheat">Review the cheat sheet</a></div>';
      $('#again', page).onclick = start; app().xp(score * 3, 'design drill'); return;
    }
    const q = pool[order[i]]; answered = false;
    page.innerHTML = '<div class="sd-head"><h1>Quick drill</h1></div><div class="sdq"><div class="meta"><span>' + (i + 1) + ' / ' + order.length + '</span><span class="sd-pill">' + esc(q.src) + '</span><span class="sp"></span><span>streak ' + streak + ' · score ' + score + '</span></div><div class="qt">' + q.q + '</div><div class="opts">' + q.options.map((o, k) => '<button class="opt" data-o="' + k + '"><span class="l">' + 'ABCDE'[k] + '</span><span>' + o + '</span></button>').join('') + '</div><div class="why" hidden>' + (q.why || '') + '</div><div class="row" style="justify-content:flex-end"><button class="btn primary" id="nx" hidden>Next →</button></div></div>';
    $('.opts', page).onclick = e => { const b = e.target.closest('.opt'); if (!b || answered) return; answered = true; const k = +b.dataset.o, ok = k === q.answer; if (ok) { score++; streak++; } else streak = 0; $$('.opt', page).forEach((o, j) => { o.disabled = true; if (j === q.answer) o.classList.add('right'); else if (j === k) o.classList.add('wrong'); }); $('.why', page).hidden = false; $('#nx', page).hidden = false; $('#nx', page).focus(); };
    $('#nx', page).onclick = () => { i++; draw(); };
  }
  const key = e => { if (!page.isConnected) { document.removeEventListener('keydown', key); return; } if (/^[1-5a-e]$/i.test(e.key) && !answered) { const k = isNaN(+e.key) ? 'abcde'.indexOf(e.key.toLowerCase()) : +e.key - 1; const b = $$('.opt', page)[k]; if (b) b.click(); } else if (e.key === 'Enter' && answered) { const n = $('#nx', page); if (n) n.click(); } };
  document.addEventListener('keydown', key);
  start();
  return () => document.removeEventListener('keydown', key);
}

/* ---------------- cheat sheet ---------------- */
function viewCheat(page) {
  page.classList.add('sheetpage');
  const H = SHEET.H, L = CHEAT.latency || [];
  const cards = [];
  if ((ROUND.steps || []).length) cards.push({ title: 'The 45 minutes', html: SHEET.timeline(ROUND.steps.map(s => ({ minutes: esc(s.minutes || ''), title: esc(s.title), do: s.do }))) });
  cards.push({ title: 'Classic web stack', html: '<div class="ref-dg" data-ref="web"></div>' });
  cards.push({ title: 'AI product request path', html: '<div class="ref-dg" data-ref="ai"></div>' });
  if (L.length) cards.push({ title: 'Latency', html: SHEET.latencyBars(L.map(x => ({ op: esc(x.op), label: esc(x.label), ns: x.ns }))) });
  if ((CHEAT.capacity || []).length) cards.push({ title: 'Capacity numbers', html: H.facts(CHEAT.capacity.map(e => [esc(e.value), esc(e.label), esc(e.calc || '')])) });
  cards.push({ title: 'Back-of-envelope', html: '<div class="calc"><label>Daily active users<input type="number" value="1000000" min="0" data-c="dau"></label><label>Requests / user / day<input type="number" value="20" min="0" data-c="rpu"></label><label>Read : write<input type="number" value="10" min="1" data-c="rw"></label><label>Bytes per write<input type="number" value="1000" min="0" data-c="sz"></label><label>Years kept<input type="number" value="5" min="0" data-c="yrs"></label><label>Peak / avg<input type="number" value="3" min="1" data-c="pk"></label></div><div class="calc-out" id="co"></div>' });
  if ((CHEAT.pick || []).length) cards.push({ title: 'Which component when', html: H.pairs(CHEAT.pick.map(t => [esc(t.need), esc(t.pick), t.why])) });
  if ((CHEAT.phrases || []).length) cards.push({ title: 'Say this', html: H.list(CHEAT.phrases) });
  if ((CHEAT.mistakes || []).length) cards.push({ title: 'Avoid', html: H.list(CHEAT.mistakes) });
  SHEET.mount(page, 'sd', cards);
  const REF = {
    web: { w: 700, h: 300, nodes: [{ id: 'c', label: 'Client', kind: 'client', x: 80, y: 150 }, { id: 'cdn', label: 'CDN', kind: 'cdn', x: 230, y: 60 }, { id: 'lb', label: 'Load balancer', kind: 'lb', x: 250, y: 220 }, { id: 'app', label: 'App servers', kind: 'service', x: 430, y: 220 }, { id: 'ca', label: 'Cache', kind: 'cache', x: 610, y: 120 }, { id: 'db', label: 'Database', kind: 'db', x: 610, y: 210 }, { id: 'q', label: 'Queue', kind: 'queue', x: 430, y: 60 }, { id: 'wk', label: 'Workers', kind: 'worker', x: 610, y: 40 }],
      edges: [{ id: 'a', from: 'c', to: 'cdn' }, { id: 'b', from: 'c', to: 'lb' }, { id: 'd', from: 'lb', to: 'app' }, { id: 'e', from: 'app', to: 'ca' }, { id: 'f', from: 'app', to: 'db' }, { id: 'g', from: 'app', to: 'q', dashed: true }, { id: 'h', from: 'q', to: 'wk', dashed: true }] },
    ai: { w: 700, h: 300, nodes: [{ id: 'u', label: 'Officer', kind: 'user', x: 75, y: 150 }, { id: 'gw', label: 'API + auth', kind: 'gateway', x: 225, y: 150 }, { id: 'gr', label: 'Guardrails', kind: 'auth', x: 380, y: 60 }, { id: 'rag', label: 'Retrieval', kind: 'search', x: 380, y: 240 }, { id: 'llm', label: 'LLM gateway', kind: 'service', x: 545, y: 150 }, { id: 'p', label: 'Providers', kind: 'ml', x: 640, y: 50 }, { id: 'ev', label: 'Evals + traces', kind: 'analytics', x: 630, y: 255 }],
      edges: [{ id: 'a', from: 'u', to: 'gw' }, { id: 'b', from: 'gw', to: 'gr' }, { id: 'c', from: 'gw', to: 'rag' }, { id: 'd', from: 'gr', to: 'llm' }, { id: 'e', from: 'rag', to: 'llm' }, { id: 'f', from: 'llm', to: 'p' }, { id: 'g', from: 'llm', to: 'ev', dashed: true }] } };
  const SC = d => Object.assign({}, d, { w: 600, h: 290, nodes: d.nodes.map(n => Object.assign({}, n, { x: Math.round(n.x * 0.84), y: Math.round(n.y * 0.95) })) });
  $$('.ref-dg', page).forEach(h => { h.innerHTML = '<div class="sdg fit"><div class="sdg-scroll">' + diagramSVG(SC(REF[h.dataset.ref]), { label: h.dataset.ref }) + '</div></div>'; });
  const fmt = n => n >= 1e15 ? (n / 1e15).toFixed(1) + ' PB' : n >= 1e12 ? (n / 1e12).toFixed(1) + ' TB' : n >= 1e9 ? (n / 1e9).toFixed(1) + ' GB' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n >= 1e3 ? (n / 1e3).toFixed(1) + ' KB' : Math.round(n) + ' B';
  const num = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : n < 10 ? n.toFixed(1) : Math.round(n) + '';
  const calc = () => {
    const v = k => Math.max(0, +($('[data-c=' + k + ']', page).value) || 0);
    const req = v('dau') * v('rpu'), qps = req / 86400, w = qps / (1 + v('rw')), r = qps - w, peak = qps * v('pk'), stor = w * 86400 * 365 * v('yrs') * v('sz');
    const box = (l, val) => '<div><span>' + l + '</span><b>' + val + '</b></div>';
    $('#co', page).innerHTML = box('Avg QPS', num(qps)) + box('Peak QPS', num(peak)) + box('Read QPS', num(r)) + box('Write QPS', num(w)) + box('Storage', fmt(stor)) + box('Servers (1k QPS)', Math.max(1, Math.ceil(peak / 1000)) + '');
  };
  page.addEventListener('input', e => { if (e.target.dataset.c) calc(); });
  calc();
}

/* ---------------- router ---------------- */
function render(page, h, cleanup) {
  if (h.startsWith('sd-d-') && DES[h.slice(5)]) viewDesign(page, DES[h.slice(5)], cleanup);
  else if (h.startsWith('sd-c-') && CON[h.slice(5)]) viewConcept(page, CON[h.slice(5)], cleanup);
  else if (h.startsWith('sd-q-') && PRA[h.slice(5)]) viewPractice(page, PRA[h.slice(5)], cleanup);
  else if (h === 'sd-designs') viewDesigns(page);
  else if (h === 'sd-practice') viewPracticeList(page);
  else if (h === 'sd-drill') { const r = viewDrill(page); if (r) cleanup.push(r); }
  else if (h === 'sd-cheat') viewCheat(page);
  else if (h === 'sd-board') viewBoard(page, cleanup);
  else viewHome(page);
}
window.SD = { NAV, tabFor, render, mountDiagram, diagramSVG, SIMS };
})();
