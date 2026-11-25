/* Explained: topic pages with step-by-step visual examples.
   Works in two hosts: the standalone site and the interview prep app. Pure string renderers plus a small DOM player.
   window.EXPLAIN = { TOPICS, TRACKS, viz(kind, frame), topicHTML(t), mountTopic(host, t), indexHTML(track), mountIndex(host, track) } */
(function (root) {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (a, v) => Array.isArray(a) && a.indexOf(v) >= 0;
const hasRC = (a, r, c) => Array.isArray(a) && a.some(p => p && p[0] === r && p[1] === c);
const W = 640;
const svg = (h, inner, label) => '<svg class="ex-svg" viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(label || 'Example') + '">' + inner + '</svg>';
const T = (x, y, s, cls, anchor) => '<text x="' + x + '" y="' + y + '" class="' + (cls || 'ex-t') + '" text-anchor="' + (anchor || 'middle') + '">' + esc(s) + '</text>';
const R = (x, y, w, h, cls, r) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r == null ? 9 : r) + '" class="' + cls + '"/>';
const L = (x1, y1, x2, y2, cls) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 'ex-ln') + '"/>';
const arrowHead = (x2, y2, ang, cls) => { const a = 8, b = 4.5, c = Math.cos(ang), s = Math.sin(ang); return '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - a * c + b * s) + ' ' + (y2 - a * s - b * c) + ' L' + (x2 - a * c - b * s) + ' ' + (y2 - a * s + b * c) + 'Z" class="' + (cls || 'ex-ah') + '"/>'; };
const arrow = (x1, y1, x2, y2, cls, hcls) => { const ang = Math.atan2(y2 - y1, x2 - x1); return L(x1, y1, x2, y2, cls) + arrowHead(x2, y2, ang, hcls); };
const stateCls = (f, i, base) => has(f.bad, i) ? 'ex-bad' : has(f.ok, i) ? 'ex-ok' : has(f.hi, i) ? 'ex-hi' : has(f.dim, i) ? 'ex-dim' : (base || 'ex-cell');
const fit = (n, max, min) => Math.max(min, Math.min(max, Math.floor((W - 40) / Math.max(1, n)) - 6));
const outText = (f, y) => f.out ? T(W - 14, y, f.out, 'ex-out', 'end') : '';

/* ---------- renderers: one per kind ---------- */
const V = {
  array(f) {
    const n = (f.cells || []).length, cw = fit(n, 58, 26), gap = 6, total = n * cw + (n - 1) * gap, x0 = Math.max(20, (W - total) / 2), y = 72;
    let s = '';
    if (f.label) s += T(14, 16, f.label, 'ex-lab', 'start');
    if (Array.isArray(f.band) && f.band.length === 2 && n) { const a = Math.max(0, f.band[0]), b = Math.min(n - 1, f.band[1]); if (b >= a) s += R(x0 + a * (cw + gap) - 5, y - 5, (b - a + 1) * (cw + gap) - gap + 10, cw + 10, 'ex-band', 12); }
    (f.cells || []).forEach((v, i) => { const x = x0 + i * (cw + gap); s += R(x, y, cw, cw, stateCls(f, i)) + T(x + cw / 2, y + cw / 2 + 5, v == null ? '' : v, 'ex-t ' + (has(f.ok, i) || has(f.hi, i) || has(f.bad, i) ? 'ex-t-on' : '')) + (f.noIdx ? '' : T(x + cw / 2, y + cw + 22, i, 'ex-idx')); });
    const P = f.ptr || {}, used = {};
    Object.keys(P).forEach(k => { const i = P[k]; if (typeof i !== 'number' || i < 0 || i >= n) return; const lvl = used[i] = (used[i] || 0) + 1; const x = x0 + i * (cw + gap) + cw / 2, off = (lvl - 1) * 20; s += T(x, y - 17 - off, k, 'ex-ptr') + (lvl === 1 ? arrowHead(x, y - 3, Math.PI / 2, 'ex-ptr-ah') : ''); });
    const h = y + cw + 36 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  map(f) {
    const rows = f.rows || [], rh = 32, y0 = 50, kw = 200, vw = 220, x0 = (W - kw - vw - 4) / 2;
    let s = (f.label ? T(x0, 16, f.label, 'ex-lab', 'start') : '') + T(x0 + kw / 2, 40, (f.heads || [])[0] || 'key', 'ex-idx') + T(x0 + kw + 4 + vw / 2, 40, (f.heads || [])[1] || 'value', 'ex-idx');
    if (!rows.length) s += R(x0, y0, kw + vw + 4, rh, 'ex-dim') + T(W / 2, y0 + 21, 'empty', 'ex-idx');
    rows.forEach((r, i) => { const y = y0 + i * (rh + 4), c = stateCls(f, i); s += R(x0, y, kw, rh, c, 8) + R(x0 + kw + 4, y, vw, rh, c, 8) + T(x0 + kw / 2, y + 21, r[0], 'ex-t ex-t-sm' + (c === 'ex-hi' || c === 'ex-ok' || c === 'ex-bad' ? ' ex-t-on' : '')) + T(x0 + kw + 4 + vw / 2, y + 21, r[1], 'ex-t ex-t-sm' + (c === 'ex-hi' || c === 'ex-ok' || c === 'ex-bad' ? ' ex-t-on' : '')); });
    const h = y0 + Math.max(1, rows.length) * (rh + 4) + 14 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  stack(f) {
    const it = f.items || [], bh = 34, bw = 170, x = W / 2 - bw / 2, n = Math.max(it.length, 1), h = 40 + n * (bh + 5) + 30 + (f.out ? 22 : 0), yb = h - 30 - (f.out ? 22 : 0);
    let s = (f.label ? T(14, 26, f.label, 'ex-lab', 'start') : '') + '<path d="M' + (x - 10) + ' ' + (yb - n * (bh + 5) - 6) + ' V' + (yb + 4) + ' H' + (x + bw + 10) + ' V' + (yb - n * (bh + 5) - 6) + '" class="ex-cup"/>';
    it.forEach((v, i) => { const y = yb - (i + 1) * (bh + 5) + 2; s += R(x, y, bw, bh, stateCls(f, i)) + T(W / 2, y + 22, v, 'ex-t ex-t-sm' + (has(f.hi, i) || has(f.ok, i) || has(f.bad, i) ? ' ex-t-on' : '')); });
    if (it.length) s += T(x + bw + 22, yb - it.length * (bh + 5) + 24, '← top', 'ex-ptr', 'start');
    return svg(h, s + outText(f, h - 8), f.say);
  },
  queue(f) {
    const it = f.items || [], n = it.length, cw = Math.max(30, Math.min(70, Math.floor((W - 150) / Math.max(1, n)) - 6)), gap = 6, total = Math.max(1, n) * (cw + gap) - gap, x0 = (W - total) / 2, y = 52;
    let s = (f.label ? T(14, 28, f.label, 'ex-lab', 'start') : '') + L(x0 - 14, y - 8, x0 + total + 14, y - 8, 'ex-rail') + L(x0 - 14, y + cw + 8, x0 + total + 14, y + cw + 8, 'ex-rail');
    it.forEach((v, i) => { const x = x0 + i * (cw + gap); s += R(x, y, cw, cw, stateCls(f, i)) + T(x + cw / 2, y + cw / 2 + 5, v, 'ex-t ex-t-sm' + (has(f.hi, i) || has(f.ok, i) ? ' ex-t-on' : '')); });
    s += T(x0 - 18, y + cw / 2 + 5, 'front', 'ex-ptr', 'end') + T(x0 + total + 18, y + cw / 2 + 5, 'back', 'ex-ptr', 'start');
    const h = y + cw + 30 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  list(f) {
    const nd = f.nodes || [], n = nd.length, r = 22, tail = typeof f.cycleTo !== 'number' && !f.noNull, gap = Math.min(110, (W - 60 - (tail ? 70 : 0)) / Math.max(1, n)), x0 = (W - gap * (n - 1) - (tail ? 70 : 0)) / 2, y = 70;
    let s = f.label ? T(14, 26, f.label, 'ex-lab', 'start') : '';
    const dir = f.dir || [];
    for (let i = 0; i < n - 1; i++) { const xa = x0 + i * gap, xb = xa + gap; s += dir[i] === 'b' ? arrow(xb - r - 2, y, xa + r + 2, y, 'ex-ln ex-ln-hi', 'ex-ah-hi') : dir[i] === 'x' ? '' : arrow(xa + r + 2, y, xb - r - 2, y); }
    if (typeof f.cycleTo === 'number' && n) { const xa = x0 + (n - 1) * gap, xb = x0 + f.cycleTo * gap; s += '<path d="M' + xa + ' ' + (y + r) + ' C' + xa + ' ' + (y + 70) + ', ' + xb + ' ' + (y + 70) + ', ' + xb + ' ' + (y + r + 4) + '" class="ex-ln" fill="none"/>' + arrowHead(xb, y + r + 4, -Math.PI / 2); }
    else if (n && tail) { const xe = x0 + (n - 1) * gap; s += arrow(xe + r + 2, y, xe + r + 30, y) + T(xe + r + 36, y + 5, 'None', 'ex-idx', 'start'); }
    nd.forEach((v, i) => { const x = x0 + i * gap; s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + stateCls(f, i) + '"/>' + T(x, y + 5, v, 'ex-t ex-t-sm' + (has(f.hi, i) || has(f.ok, i) || has(f.bad, i) ? ' ex-t-on' : '')); });
    const P = f.ptr || {}, used = {};
    Object.keys(P).forEach(k => { const i = P[k]; if (typeof i !== 'number' || i < 0 || i >= n) return; const lvl = used[i] = (used[i] || 0) + 1; s += T(x0 + i * gap, y - r - 10 - (lvl - 1) * 15, k, 'ex-ptr'); });
    const h = (typeof f.cycleTo === 'number' ? y + 84 : y + 44) + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  tree(f) {
    const nd = f.nodes || [], depth = Math.max(1, Math.ceil(Math.log2(nd.length + 1))), lh = 66, r = 19, h = 40 + depth * lh + (f.tag ? 8 : 0) + (f.out ? 22 : 0);
    const pos = i => { const d = Math.floor(Math.log2(i + 1)), k = i - (Math.pow(2, d) - 1), slots = Math.pow(2, d); return [(k + 0.5) * W / slots, 38 + d * lh]; };
    let s = f.label ? T(14, 22, f.label, 'ex-lab', 'start') : '';
    nd.forEach((v, i) => { if (v == null || i === 0) return; const p = Math.floor((i - 1) / 2); if (nd[p] == null) return; const [x1, y1] = pos(p), [x2, y2] = pos(i); s += L(x1, y1 + r, x2, y2 - r, has(f.edge, i) ? 'ex-ln ex-ln-hi' : 'ex-ln'); });
    nd.forEach((v, i) => { if (v == null) return; const [x, y] = pos(i); s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + stateCls(f, i) + '"/>' + T(x, y + 5, v, 'ex-t ex-t-sm' + (has(f.hi, i) || has(f.ok, i) || has(f.bad, i) ? ' ex-t-on' : '')); if (f.tag && f.tag[i] != null) s += T(x, y + r + 15, f.tag[i], has(f.bad, i) ? 'ex-tag ex-tag-bad' : 'ex-tag'); });
    return svg(h, s + outText(f, h - 8), f.say);
  },
  graph(f) {
    const nodes = f.nodes || [], by = {}, h = 318 + (f.out ? 22 : 0), r = 20;
    nodes.forEach(n => { by[n.id] = [30 + n.x / 100 * (W - 60), 30 + n.y / 100 * 240]; });
    const isHiE = (a, b) => (f.edgeHi || []).some(e => (e[0] === a && e[1] === b) || (!f.directed && e[0] === b && e[1] === a));
    let s = f.label ? T(14, 20, f.label, 'ex-lab', 'start') : '';
    (f.edges || []).forEach(e => {
      const A = by[e[0]], B = by[e[1]]; if (!A || !B) return; const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      const x1 = A[0] + r * Math.cos(ang), y1 = A[1] + r * Math.sin(ang), x2 = B[0] - (r + 2) * Math.cos(ang), y2 = B[1] - (r + 2) * Math.sin(ang), hi = isHiE(e[0], e[1]);
      s += f.directed ? arrow(x1, y1, x2, y2, hi ? 'ex-ln ex-ln-hi' : 'ex-ln', hi ? 'ex-ah-hi' : 'ex-ah') : L(x1, y1, x2, y2, hi ? 'ex-ln ex-ln-hi' : 'ex-ln');
      if (e[2] != null) { const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, tw = Math.max(26, 6.8 * String(e[2]).length + 12); s += R(mx - tw / 2, my - 11, tw, 20, 'ex-wbg', 6) + T(mx, my + 4, e[2], 'ex-w'); }
    });
    nodes.forEach(n => { const [x, y] = by[n.id]; const c = has(f.bad, n.id) ? 'ex-bad' : has(f.ok, n.id) ? 'ex-ok' : has(f.hi, n.id) ? 'ex-hi' : has(f.dim, n.id) ? 'ex-dim' : 'ex-cell'; s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + c + '"/>' + T(x, y + 5, n.label || n.id, 'ex-t ex-t-sm' + (c !== 'ex-cell' && c !== 'ex-dim' ? ' ex-t-on' : '')); if (f.dist && f.dist[n.id] != null) { const tx = x + r + 5, ty = y + r + 4, tw = 7.2 * String(f.dist[n.id]).length + 8; s += R(tx - 4, ty - 13, tw, 18, 'ex-wbg', 5) + T(tx, ty, f.dist[n.id], 'ex-tag', 'start'); } });
    return svg(h, s + outText(f, h - 8), f.say);
  },
  grid(f) {
    const g = f.cells || [], rows = g.length, cols = rows ? g[0].length : 0, cw = Math.min(46, Math.floor(360 / Math.max(rows, cols, 1))), x0 = (W - cols * (cw + 4)) / 2, y0 = 30;
    let s = f.label ? T(14, 22, f.label, 'ex-lab', 'start') : '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = g[r][c], x = x0 + c * (cw + 4), y = y0 + r * (cw + 4);
      const cls = hasRC(f.bad, r, c) ? 'ex-bad' : hasRC(f.ok, r, c) ? 'ex-ok' : hasRC(f.hi, r, c) ? 'ex-hi' : hasRC(f.dim, r, c) ? 'ex-dim' : (v === '#' || v === 1 || v === '1') && f.wall ? 'ex-wall' : 'ex-cell';
      const val = f.vals && f.vals[r] && f.vals[r][c] != null ? f.vals[r][c] : (f.wall && (v === '#' || v === 1 || v === '1') ? '' : v);
      s += R(x, y, cw, cw, cls, 6) + T(x + cw / 2, y + cw / 2 + 5, val == null ? '' : val, 'ex-t ex-t-sm' + (cls === 'ex-hi' || cls === 'ex-ok' || cls === 'ex-bad' ? ' ex-t-on' : ''));
    }
    const h = y0 + rows * (cw + 4) + 14 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  table(f) {
    const g = f.cells || [], rows = g.length, cols = rows ? g[0].length : 0, hasRH = Array.isArray(f.rows), hasCH = Array.isArray(f.cols);
    const rh = 34, cw = Math.min(cols <= 2 ? 150 : cols <= 4 ? 110 : 60, Math.floor((W - 80) / Math.max(1, cols + (hasRH ? 1 : 0))) - 4), x0 = (W - (cols + (hasRH ? 1 : 0)) * (cw + 4)) / 2 + (hasRH ? cw + 4 : 0), y0 = hasCH ? 46 : 24;
    let s = f.label ? T(14, 18, f.label, 'ex-lab', 'start') : '';
    if (hasCH) f.cols.forEach((c, j) => { s += T(x0 + j * (cw + 4) + cw / 2, 38, c, 'ex-idx'); });
    for (let r = 0; r < rows; r++) {
      if (hasRH) s += T(x0 - 10, y0 + r * (rh + 4) + rh / 2 + 5, f.rows[r], 'ex-idx', 'end');
      for (let c = 0; c < cols; c++) { const x = x0 + c * (cw + 4), y = y0 + r * (rh + 4), v = g[r][c]; const cls = hasRC(f.bad, r, c) ? 'ex-bad' : hasRC(f.ok, r, c) ? 'ex-ok' : hasRC(f.hi, r, c) ? 'ex-hi' : hasRC(f.dim, r, c) || v == null ? 'ex-dim' : 'ex-cell'; s += R(x, y, cw, rh, cls, 6) + T(x + cw / 2, y + rh / 2 + 5, v == null ? '' : v, 'ex-t ex-t-sm' + (cls === 'ex-hi' || cls === 'ex-ok' || cls === 'ex-bad' ? ' ex-t-on' : '')); }
    }
    const h = y0 + rows * (rh + 4) + 14 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  bars(f) {
    const v = f.vals || [], n = v.length, mx = Math.max(1, ...v.map(Number)), bw = fit(n, 52, 18), gap = 6, total = n * (bw + gap) - gap, x0 = (W - total) / 2, base = 190;
    let s = f.label ? T(14, 20, f.label, 'ex-lab', 'start') : '';
    v.forEach((x, i) => { const hh = Math.max(16, x / mx * 140), xx = x0 + i * (bw + gap); s += R(xx, base - hh, bw, hh, stateCls(f, i), 6) + T(xx + bw / 2, base + 18, x, 'ex-idx'); });
    if (Array.isArray(f.swap) && f.swap.length === 2) { const [a, b] = f.swap, xa = x0 + a * (bw + gap) + bw / 2, xb = x0 + b * (bw + gap) + bw / 2; s += '<path d="M' + xa + ' 46 C' + xa + ' 26, ' + xb + ' 26, ' + xb + ' 46" class="ex-ln ex-ln-hi" fill="none"/>' + T((xa + xb) / 2, 22, 'swap', 'ex-ptr'); }
    const h = base + 30 + (f.out ? 22 : 0);
    return svg(h, s + outText(f, h - 8), f.say);
  },
  sd(f) {
    const nodes = f.nodes || [], by = {}, bw = 118, bh = 46, h = 300 + (f.out ? 22 : 0);
    nodes.forEach(n => { by[n.id] = [20 + bw / 2 + n.x / 100 * (W - 40 - bw), 20 + bh / 2 + n.y / 100 * (240 - bh)]; });
    const isHiE = (a, b) => (f.edgeHi || []).some(e => e[0] === a && e[1] === b);
    let s = f.label ? T(14, 16, f.label, 'ex-lab', 'start') : '', labels = '';
    (f.edges || []).forEach(e => {
      const A = by[e[0]], B = by[e[1]]; if (!A || !B) return;
      const dx = B[0] - A[0], dy = B[1] - A[1], tx = Math.abs(dx) > 0.01 ? (bw / 2 + 4) / Math.abs(dx) : Infinity, ty = Math.abs(dy) > 0.01 ? (bh / 2 + 4) / Math.abs(dy) : Infinity, t = Math.min(tx, ty);
      const twin = (f.edges || []).some(o => o[0] === e[1] && o[1] === e[0]), ln = Math.hypot(dx, dy) || 1, ox = twin ? -dy / ln * 7 : 0, oy = twin ? dx / ln * 7 : 0;
      const x1 = A[0] + dx * t + ox, y1 = A[1] + dy * t + oy, x2 = B[0] - dx * t + ox, y2 = B[1] - dy * t + oy, hi = isHiE(e[0], e[1]);
      const down = e[3] === 'down';
      s += arrow(x1, y1, x2, y2, (down ? 'ex-ln ex-ln-bad ex-dash' : hi ? 'ex-ln ex-ln-hi' : 'ex-ln') + (e[3] === 'async' ? ' ex-dash' : ''), down ? 'ex-ah-bad' : hi ? 'ex-ah-hi' : 'ex-ah');
      if (e[2]) {
        // label sits on the arrow when it fits, otherwise just above it; drawn after the boxes so nothing covers it
        const len = Math.hypot(x2 - x1, y2 - y1), tw = Math.min(150, 6.6 * String(e[2]).length + 14), mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - (tw > len - 12 ? 34 : 0);
        labels += R(mx - tw / 2, my - 11, tw, 20, 'ex-wbg', 6) + T(mx, my + 4, e[2], down ? 'ex-w ex-w-bad' : 'ex-w');
      }
    });
    nodes.forEach(n => { const [x, y] = by[n.id], c = has(f.bad, n.id) ? 'ex-bad' : has(f.ok, n.id) ? 'ex-ok' : has(f.hi, n.id) ? 'ex-hi' : has(f.dim, n.id) ? 'ex-dim' : 'ex-cell'; s += R(x - bw / 2, y - bh / 2, bw, bh, c, 10) + T(x, y + (n.sub ? -1 : 5), n.label, 'ex-t ex-t-sm' + (c === 'ex-hi' || c === 'ex-ok' || c === 'ex-bad' ? ' ex-t-on' : '')) + (n.sub ? T(x, y + 14, n.sub, 'ex-sub' + (c === 'ex-hi' || c === 'ex-ok' || c === 'ex-bad' ? ' ex-t-on' : '')) : ''); });
    return svg(h, s + labels + outText(f, h - 8), f.say);
  }
};
const viz = (kind, f) => (V[kind] || V.array)(f || {});

/* ---------- Python highlighter (small) ---------- */
const KW = new Set('def return if elif else for while in not and or is None True False import from as class with yield lambda pass break continue try except finally raise global nonlocal del'.split(' '));
const BI = new Set('print len range enumerate sorted min max sum dict set list tuple heapq deque defaultdict Counter abs zip map int str'.split(' '));
function hl(code) {
  // tokenize the raw text, then escape each piece, so inserted markup is never re-highlighted
  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(#.*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;
  return String(code).split('\n').map(line => {
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const tok = esc(m[0]);
      out += m[1] ? '<span class="hl-s">' + tok + '</span>' : m[2] ? '<span class="hl-c">' + tok + '</span>' : m[3] ? '<span class="hl-n">' + tok + '</span>' : KW.has(m[0]) ? '<span class="hl-k">' + tok + '</span>' : BI.has(m[0]) ? '<span class="hl-b">' + tok + '</span>' : tok;
      last = m.index + m[0].length;
    }
    return out + esc(line.slice(last));
  }).join('\n');
}

/* ---------- pages ---------- */
const TRACKS = [
  { id: 'py', name: 'Python', video: ['0K_eZGS5NsU', 'Python for Coding Interviews: Everything you need to know'] },
  { id: 'ds', name: 'Data structures', video: ['vVL6NFzr0Rg', 'Every Data Structure Simply Explained in 25 Minutes'] },
  { id: 'algo', name: 'Algorithms', video: ['AU9tsGVnmvM', '25+ Algorithms Simply Explained in 40 Minutes'] },
  { id: 'sd', name: 'System design', video: ['4RJ_GtoHhrs', '100+ System Design Concepts Explained, Part 1'] }
];
const topics = () => root.EXPLAIN_TOPICS || [];
const byId = id => topics().find(t => t.id === id);
const href = id => (root.EXPLAIN_HREF || (x => '#x-' + x))(id);
const REL = () => root.EXPLAIN_REL || { families: [], compare: [] };
const allEdges = () => REL().families.flatMap(fm => fm.edges.map(e => ({ from: e[0], to: e[1], delta: e[2], fam: fm.name, track: fm.track })));
const chip = id => { const t = byId(id); return t ? '<a class="ex-chip ex-link" href="' + href(id) + '">' + esc(t.title) + '</a>' : '<span class="ex-chip">' + esc(id) + '</span>'; };
function buildsOnHTML(t) {
  const inc = allEdges().filter(e => e.to === t.id);
  if (!inc.length) return '';
  return '<section class="ex-blk ex-builds">' + inc.map(e => '<p><span class="ex-bk">Builds on</span> ' + chip(e.from) + ' <span class="ex-arrow">+ one change:</span> ' + esc(e.delta) + '</p>').join('') + '</section>';
}
function nextIdeasHTML(t) {
  const out = allEdges().filter(e => e.from === t.id && byId(e.to));
  if (!out.length) return '';
  return '<section class="ex-blk"><h2>Once this clicks</h2><div class="ex-next">' + out.map(e => '<a class="ex-nx" href="' + href(e.to) + '"><b>' + esc(byId(e.to).title) + '</b><span>' + esc(e.delta) + '</span></a>').join('') + '</div></section>';
}
function compareTable(c, cur) {
  return '<div class="ex-cmp"><h3>' + esc(c.title) + '</h3><div class="ex-tbl" role="table"><div class="ex-tr ex-th" role="row" style="--n:' + c.items.length + '"><span role="columnheader"></span>' + c.items.map(id => '<span role="columnheader" class="' + (id === cur ? 'cur' : '') + '">' + (byId(id) ? '<a href="' + href(id) + '">' + esc(byId(id).title) + '</a>' : esc(id)) + '</span>').join('') + '</div>' +
    c.rows.map(r => '<div class="ex-tr" role="row" style="--n:' + c.items.length + '"><span role="rowheader">' + esc(r[0]) + '</span>' + r.slice(1).map((v, i) => '<span role="cell" class="' + (c.items[i] === cur ? 'cur' : '') + '">' + esc(v) + '</span>').join('') + '</div>').join('') + '</div></div>';
}
function mixUpHTML(t) {
  const C = REL().compare.filter(c => c.items.includes(t.id));
  return C.length ? '<section class="ex-blk"><h2>Easy to mix up</h2>' + C.map(c => compareTable(c, t.id)).join('') + '</section>' : '';
}
function familyMapHTML(trackId) {
  const fams = REL().families.filter(fm => fm.track === trackId);
  if (!fams.length) return '';
  const node = (fm, id, delta, depth, seen) => {
    if (seen.has(id)) return ''; seen.add(id);
    const kids = fm.edges.filter(e => e[0] === id);
    return '<li><div class="ex-fn">' + chip(id) + (delta ? '<span class="ex-fd">' + esc(delta) + '</span>' : '') + '</div>' + (kids.length ? '<ul>' + kids.map(e => node(fm, e[1], e[2], depth + 1, seen)).join('') + '</ul>' : '') + '</li>';
  };
  return '<section class="ex-map"><h2>How they connect</h2><p class="ex-muted">Learn the first one, then each next one is a single change.</p><div class="ex-fams">' + fams.map(fm => {
    const tos = new Set(fm.edges.map(e => e[1])), roots = [...new Set(fm.edges.map(e => e[0]).filter(id => !tos.has(id)))], seen = new Set();
    return '<div class="ex-fam"><h3>' + esc(fm.name) + '</h3><ul class="ex-tree">' + roots.map(r => node(fm, r, '', 0, seen)).join('') + '</ul></div>';
  }).join('') + '</div></section>';
}
function compareListHTML(trackId) {
  const ids = new Set(topics().filter(t => t.track === trackId).map(t => t.id));
  const C = REL().compare.filter(c => c.items.some(id => ids.has(id)));
  return C.length ? '<section class="ex-map ex-wide"><h2>Tell them apart</h2><div class="ex-cmps">' + C.map(c => compareTable(c, '')).join('') + '</div></section>' : '';
}
function thumb(t) { const f = (t.viz && t.viz.frames || [])[Math.min(1, (t.viz.frames || []).length - 1)] || {}; return '<div class="ex-thumb">' + viz(t.viz.kind, Object.assign({}, f, { out: '', label: '' })) + '</div>'; }
function videoHTML(tr) {
  if (!tr || !tr.video) return '';
  const [v, title] = tr.video;
  return '<div class="ex-video" data-v="' + v + '"><button type="button" class="ex-vthumb" aria-label="Play: ' + esc(title) + '"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v + '/mqdefault.jpg" onerror="this.remove()"><span class="ex-vplay"><svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg></span></button>' +
    '<div class="ex-vmeta"><b>' + esc(title) + '</b><span class="ex-muted">' + (v === '0K_eZGS5NsU' ? 'NeetCode' : 'Codist') + ' on YouTube</span><a href="https://www.youtube.com/watch?v=' + v + '" target="_blank" rel="noopener noreferrer">Open on YouTube</a></div></div>';
}
function indexHTML(trackId) {
  const tr = TRACKS.find(x => x.id === trackId) || TRACKS[0];
  const L = topics().filter(t => t.track === tr.id).sort((a, b) => (a.order || 99) - (b.order || 99));
  return '<div class="ex-index"><div class="ex-hero"><h1>' + esc(tr.name) + '</h1>' + videoHTML(tr) + '</div>' + familyMapHTML(tr.id) + '<h2 class="ex-h2">All topics, in learning order</h2><div class="ex-grid">' +
    L.map((t, i) => '<a class="ex-card" href="' + href(t.id) + '"><span class="ex-n">' + (i + 1) + '</span>' + thumb(t) + '<h3>' + esc(t.title) + '</h3><p>' + esc(t.short) + '</p></a>').join('') + '</div>' + compareListHTML(tr.id) + '</div>';
}
function topicHTML(t) {
  const tr = TRACKS.find(x => x.id === t.track) || {}, L = topics().filter(x => x.track === t.track).sort((a, b) => (a.order || 99) - (b.order || 99)), i = L.indexOf(t), prev = L[i - 1], next = L[i + 1];
  const F = (t.viz && t.viz.frames) || [];
  return '<article class="ex-topic">' +
    '<header class="ex-head"><span class="ex-chip">' + esc(tr.name || '') + '</span><h1>' + esc(t.title) + '</h1><p class="ex-short">' + esc(t.short) + '</p></header>' +
    buildsOnHTML(t) + '<section class="ex-blk ex-what"><p>' + esc(t.what) + '</p>' + (t.analogy ? '<p class="ex-analogy"><b>Think of it like</b> ' + esc(t.analogy) + '</p>' : '') + '</section>' +
    (F.length ? '<section class="ex-blk ex-player" data-i="0"><div class="ex-stage">' + viz(t.viz.kind, F[0]) + '</div><p class="ex-say" aria-live="polite">' + esc(F[0].say || '') + '</p>' +
      '<div class="ex-ctl"><button type="button" class="ex-btn" data-a="prev" aria-label="Previous step">‹</button><button type="button" class="ex-btn ex-primary" data-a="play">Play</button><button type="button" class="ex-btn" data-a="next" aria-label="Next step">›</button><span class="ex-dots">' + F.map((_, k) => '<i class="' + (k ? '' : 'on') + '"></i>').join('') + '</span><span class="ex-count">1 / ' + F.length + '</span></div></section>' : '') +
    '<div class="ex-cols">' +
      ((t.when || []).length ? '<section class="ex-blk"><h2>Use it when</h2><ul class="ex-list">' + t.when.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' : '') +
      ((t.cost || []).length ? '<section class="ex-blk"><h2>How fast</h2><div class="ex-cost">' + t.cost.map(r => '<div><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>').join('') + '</div></section>' : '') +
    '</div>' +
    (t.python ? '<section class="ex-blk"><h2>In Python</h2><pre class="ex-code"><code>' + hl(t.python) + '</code></pre>' + (t.output ? '<pre class="ex-output">' + esc(t.output) + '</pre>' : '') + '</section>' : '') +
    '<div class="ex-cols">' +
      ((t.watch || []).length ? '<section class="ex-blk"><h2>Watch out</h2><ul class="ex-list ex-warn">' + t.watch.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' : '') +
      ((t.interview || []).length ? '<section class="ex-blk"><h2>Interview problems</h2><ul class="ex-list">' + t.interview.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' : '') +
    '</div>' +
    mixUpHTML(t) + nextIdeasHTML(t) +
    ((t.related || []).filter(byId).length ? '<section class="ex-blk"><h2>Related</h2><div class="ex-rel">' + t.related.filter(byId).map(id => '<a class="ex-chip ex-link" href="' + href(id) + '">' + esc(byId(id).title) + '</a>').join('') + '</div></section>' : '') +
    '<nav class="ex-pager">' + (prev ? '<a class="ex-btn" href="' + href(prev.id) + '">‹ ' + esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a class="ex-btn ex-primary" href="' + href(next.id) + '">' + esc(next.title) + ' ›</a>' : '<span></span>') + '</nav>' +
  '</article>';
}
function fixedHeight(kind, frames) {
  let mh = 0; frames.forEach(f => { const m = /viewBox="0 0 \d+ ([\d.]+)"/.exec(viz(kind, f)); if (m) mh = Math.max(mh, +m[1]); });
  return mh;
}
function vizFixed(kind, f, mh) { return viz(kind, f).replace(/viewBox="0 0 (\d+) [\d.]+"/, 'viewBox="0 0 $1 ' + mh + '" preserveAspectRatio="xMidYMin meet"'); }
function mountTopic(host, t) {
  host.innerHTML = topicHTML(t);
  const pl = host.querySelector('.ex-player'); if (!pl) return () => {};
  const F = t.viz.frames, stage = pl.querySelector('.ex-stage'), say = pl.querySelector('.ex-say'), cnt = pl.querySelector('.ex-count'), dots = pl.querySelectorAll('.ex-dots i'), playB = pl.querySelector('[data-a=play]');
  let i = 0, timer = null;
  const mh = fixedHeight(t.viz.kind, F);
  stage.innerHTML = vizFixed(t.viz.kind, F[0], mh);
  const draw = () => { stage.innerHTML = vizFixed(t.viz.kind, F[i], mh); say.textContent = F[i].say || ''; cnt.textContent = (i + 1) + ' / ' + F.length; dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; playB.textContent = i >= F.length - 1 ? 'Replay' : 'Play'; };
  const go = d => { i = Math.max(0, Math.min(F.length - 1, i + d)); draw(); if (i >= F.length - 1) stop(); };
  pl.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'prev') { stop(); go(-1); }
    else if (a.dataset.a === 'next') { stop(); go(1); }
    else if (timer) stop();
    else { if (i >= F.length - 1) { i = 0; draw(); } playB.textContent = 'Pause'; timer = setInterval(() => go(1), 2200); }
  });
  const key = e => { if (/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) return; if (e.key === 'ArrowRight') { stop(); go(1); } else if (e.key === 'ArrowLeft') { stop(); go(-1); } };
  document.addEventListener('keydown', key);
  return () => { stop(); document.removeEventListener('keydown', key); };
}
function mountIndex(host, trackId) { host.innerHTML = indexHTML(trackId); return () => {}; }
/* mini player: the topic's step-through animation, for cheatsheet cards. Self-contained; one document-level handler drives every copy. */
const miniCache = {};
const bare = f => Object.assign({}, f, { label: '', out: '' });
const miniNote = f => [f.label, f.out].filter(Boolean).join(' · ');
function miniFrames(id) { const t = byId(id); if (!t || !t.viz) return null; if (!miniCache[id]) miniCache[id] = { t, F: t.viz.frames || [], mh: fixedHeight(t.viz.kind, t.viz.frames || []) }; return miniCache[id]; }
function miniHTML(id) {
  const m = miniFrames(id); if (!m || !m.F.length) return '';
  return '<div class="ex-mini" data-mini="' + esc(id) + '" data-i="0"><div class="ex-mstage">' + viz(m.t.viz.kind, bare(m.F[0])) + '</div><p class="ex-mnote">' + esc(miniNote(m.F[0])) + '</p><p class="ex-msay">' + esc(m.F[0].say || '') + '</p>' +
    '<div class="ex-mctl"><button type="button" class="ex-mbtn" data-m="prev" aria-label="Previous step">‹</button><button type="button" class="ex-mbtn ex-mplay" data-m="play" aria-label="Play">▶</button><button type="button" class="ex-mbtn" data-m="next" aria-label="Next step">›</button><span class="ex-mcount">1 / ' + m.F.length + '</span></div></div>';
}
/* crop a mini drawing to what its frames actually draw (union over every frame, so the size never jumps) */
function miniBox(id) {
  const m = miniFrames(id); if (!m || m.box || typeof document === 'undefined') return m && m.box;
  const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-9999px;top:0;width:640px;visibility:hidden';
  document.body.appendChild(host);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  m.F.forEach(f => { host.innerHTML = viz(m.t.viz.kind, bare(f)); const g = host.querySelector('svg'); try { const b = g.getBBox(); if (b.width) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); } } catch (e) { /* not rendered */ } });
  host.remove();
  m.box = isFinite(x0) ? [x0 - 10, y0 - 8, x1 - x0 + 20, y1 - y0 + 16] : null;
  return m.box;
}
function miniFit(box) {
  const vb = miniBox(box.dataset.mini), g = box.querySelector('.ex-mstage svg');
  if (vb && g) { g.setAttribute('viewBox', vb.map(n => Math.round(n)).join(' ')); g.removeAttribute('preserveAspectRatio'); }
}
function fitMinis(root) { (root || document).querySelectorAll('.ex-mini').forEach(miniFit); }
function miniGo(box, i) {
  const m = miniFrames(box.dataset.mini); if (!m) return;
  i = Math.max(0, Math.min(m.F.length - 1, i)); box.dataset.i = i;
  box.querySelector('.ex-mstage').innerHTML = viz(m.t.viz.kind, bare(m.F[i]));
  box.querySelector('.ex-mnote').textContent = miniNote(m.F[i]);
  box.querySelector('.ex-msay').textContent = m.F[i].say || '';
  box.querySelector('.ex-mcount').textContent = (i + 1) + ' / ' + m.F.length;
  miniFit(box);
}
function miniStop(box) { if (box._t) clearInterval(box._t); box._t = null; const p = box.querySelector('[data-m=play]'); if (p) { p.textContent = '▶'; p.setAttribute('aria-label', 'Play'); } }
if (typeof document !== 'undefined') document.addEventListener('click', e => {
  const b = e.target.closest('.ex-mini [data-m]'); if (!b) return;
  const box = b.closest('.ex-mini'), m = miniFrames(box.dataset.mini); if (!m) return;
  e.preventDefault(); e.stopPropagation();
  const i = +box.dataset.i || 0;
  if (b.dataset.m === 'prev') { miniStop(box); miniGo(box, i - 1); }
  else if (b.dataset.m === 'next') { miniStop(box); miniGo(box, i + 1); }
  else if (box._t) miniStop(box);
  else {
    if (i >= m.F.length - 1) miniGo(box, 0);
    b.textContent = '❚❚'; b.setAttribute('aria-label', 'Pause');
    box._t = setInterval(() => { if (!box.isConnected) return miniStop(box); const k = +box.dataset.i; if (k >= m.F.length - 1) return miniStop(box); miniGo(box, k + 1); }, 2000);
  }
});
/* cheatsheet page: every topic as a card with its mini player, grouped by track */
function sheetHTML() {
  return '<div class="ex-sheet"><div class="ex-hero"><h1>Cheatsheet</h1></div><p class="ex-muted" style="margin:-8px 0 16px">Every topic on one page. Step through each example right in its card.</p>' +
    TRACKS.map(tr => {
      const L = topics().filter(t => t.track === tr.id).sort((a, b) => (a.order || 99) - (b.order || 99));
      return L.length ? '<section class="ex-sheet-track"><h2>' + esc(tr.name) + '</h2><div class="ex-sheet-grid">' + L.map(t => '<article class="ex-scard"><h3><a href="' + href(t.id) + '">' + esc(t.title) + '</a></h3><p class="ex-sshort">' + esc(t.short) + '</p>' + miniHTML(t.id) +
        ((t.when || []).length ? '<ul class="ex-swhen">' + t.when.slice(0, 3).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        ((t.cost || []).length ? '<div class="ex-scost">' + t.cost.slice(0, 3).map(r => '<span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b>').join('') + '</div>' : '') + '</article>').join('') + '</div></section>' : '';
    }).join('') + '</div>';
}
if (typeof document !== 'undefined') document.addEventListener('click', e => {
  const b = e.target.closest('.ex-vthumb'); if (!b) return;
  const box = b.closest('.ex-video'), v = box && box.dataset.v; if (!/^[A-Za-z0-9_-]{11}$/.test(v || '')) return;
  const f = document.createElement('iframe'); f.className = 'ex-vframe'; f.src = 'https://www.youtube-nocookie.com/embed/' + v + '?autoplay=1&rel=0'; f.title = 'Video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
  b.replaceWith(f); box.classList.add('playing');
});
root.EXPLAIN = { miniHTML, sheetHTML, fitMinis, TRACKS, viz, hl, topicHTML, mountTopic, indexHTML, mountIndex, byId, topics, V, familyMapHTML, compareTable };
})(typeof window !== 'undefined' ? window : globalThis);
