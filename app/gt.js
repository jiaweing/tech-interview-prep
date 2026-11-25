/* GovTech live-coding layer: tags, interviewer follow-ups, the GovTech problem set, and the rover grid animator. */
(function () {
'use strict';
const G = window.GT_DATA || {};
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ROUND = { oa: 'Online assessment', live: 'Live / pair programming', 'take-home': 'Take-home' };
const TAG = { reported: 'Reported', inspired: 'Based on a reported task', domain: 'GovTech-flavoured practice' };

function taskExtra(P) {
  const g = P && P.govtech; if (!g) return '';
  return '<div class="gt-sec" style="margin-top:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="gt-tag" title="' + esc((g.source || '') + ' · ' + (g.evidence || '')) + '">' + esc(TAG[g.tag] || g.tag) + '</span><span class="sd-pill">' + esc(ROUND[g.round] || g.round) + '</span></div>' +
    (g.viz && /^(rover|water|window)$/.test(g.viz.kind) ? '<div class="gt-viz" data-pid="' + esc(P.id) + '"></div>' : '') +
    ((g.extensions || []).length ? '<div class="gt-ext"><span class="eyebrow">Follow-ups</span><ol>' + g.extensions.map(x => '<li>' + x + '</li>').join('') + '</ol></div>' : '') + '</div>';
}

/* ---------- rover simulator (same rules as the reference solutions) ---------- */
const DIRS = 'NESW', STEP = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] };
function simulate(spec, mode, obstacles) {
  const lines = String(spec).split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Empty input');
  const dims = lines[0].split(/\s+/).map(Number);
  if (dims.length !== 2 || dims.some(n => !Number.isInteger(n) || n < 0)) throw new Error('First line must be "X Y"');
  const wrap = mode === 'wrap';
  const cols = wrap ? dims[0] : dims[0] + 1, rows = wrap ? dims[1] : dims[1] + 1;
  if (wrap && (cols < 1 || rows < 1)) throw new Error('Planet must be at least 1 x 1');
  const rovers = [];
  for (let i = 1; i < lines.length; i += 2) {
    const p = lines[i].split(/\s+/);
    if (p.length !== 3 || !STEP[p[2]] || isNaN(+p[0]) || isNaN(+p[1])) throw new Error('Rover line ' + (i + 1) + ' must be "x y H" with H in N E S W');
    rovers.push({ x: +p[0], y: +p[1], d: p[2], cmds: (lines[i + 1] || '').replace(/\s+/g, ''), trail: [[+p[0], +p[1]]], stopped: false, done: false });
  }
  const rocks = new Set((obstacles || []).map(o => o[0] + ',' + o[1]));
  const frames = [];
  const snap = (active, ci, note, bad) => frames.push({ rovers: rovers.map(r => ({ x: r.x, y: r.y, d: r.d, stopped: r.stopped, trail: r.trail.slice() })), active, ci, note, bad: !!bad });
  snap(-1, -1, rovers.length + ' rover' + (rovers.length === 1 ? '' : 's') + ' landed on a ' + cols + ' × ' + rows + ' grid' + (rocks.size ? ' with ' + rocks.size + ' rock' + (rocks.size > 1 ? 's' : '') : '') + '.');
  const taken = new Set(rovers.map(r => r.x + ',' + r.y));
  let budget = 600;
  rovers.forEach((r, ri) => {
    taken.delete(r.x + ',' + r.y);
    for (let ci = 0; ci < r.cmds.length && budget > 0; ci++, budget--) {
      const c = r.cmds[ci];
      if (c === 'L' || c === 'R') { const nd = DIRS[(DIRS.indexOf(r.d) + (c === 'R' ? 1 : 3)) % 4]; snap(ri, ci, 'Rover ' + (ri + 1) + ': ' + c + ' turns ' + r.d + ' → ' + nd); r.d = nd; frames[frames.length - 1].rovers[ri].d = nd; continue; }
      if (c === 'M' || c === 'F' || c === 'B') {
        let [dx, dy] = STEP[r.d]; if (c === 'B') { dx = -dx; dy = -dy; }
        let nx = r.x + dx, ny = r.y + dy;
        if (wrap) { nx = ((nx % cols) + cols) % cols; ny = ((ny % rows) + rows) % rows; }
        else if (mode === 'safe') {
          const why = nx < 0 || ny < 0 || nx >= cols || ny >= rows ? 'the edge of the plateau' : rocks.has(nx + ',' + ny) ? 'a rock' : taken.has(nx + ',' + ny) ? 'another rover' : '';
          if (why) { r.stopped = true; snap(ri, ci, 'Rover ' + (ri + 1) + ': ' + c + ' blocked by ' + why + ' at (' + nx + ', ' + ny + '). STOPPED, the rest of its commands are ignored.', true); break; }
        }
        const wrapped = wrap && (Math.abs(nx - r.x) > 1 || Math.abs(ny - r.y) > 1);
        r.x = nx; r.y = ny; r.trail.push(wrapped ? null : [nx, ny]); if (wrapped) r.trail.push([nx, ny]);
        snap(ri, ci, 'Rover ' + (ri + 1) + ': ' + c + ' → (' + nx + ', ' + ny + ')' + (wrapped ? ' wrapped around the planet' : '') + (!wrap && mode !== 'safe' && (nx < 0 || ny < 0 || nx >= cols || ny >= rows) ? '  ⚠ off the plateau' : ''), !wrap && mode !== 'safe' && (nx < 0 || ny < 0 || nx >= cols || ny >= rows));
        continue;
      }
      snap(ri, ci, 'Rover ' + (ri + 1) + ': unknown command "' + c + '" ignored', true);
    }
    taken.add(r.x + ',' + r.y);
  });
  const out = rovers.map(r => r.x + ' ' + r.y + ' ' + r.d + (r.stopped ? ' STOPPED' : '')).join('\n');
  snap(-1, -1, 'Final: ' + out.replace(/\n/g, ' | ') + (budget <= 0 ? ' (animation capped at 600 steps)' : ''));
  return { frames, cols, rows, rocks: [...rocks].map(s => s.split(',').map(Number)), rovers, out, specRovers: rovers.map(r => r.cmds) };
}
const COL = ['var(--accent)', 'var(--hi)', 'var(--ok)', '#8E4EC6', '#DB2777', 'var(--bad)'];
function roverSVG(S, f) {
  const cs = Math.max(14, Math.min(42, Math.floor(420 / Math.max(S.cols, S.rows)))), pad = 22;
  const W = S.cols * cs + pad + 8, H = S.rows * cs + pad + 8;
  const cx = x => pad + x * cs + cs / 2, cy = y => 6 + (S.rows - 1 - y) * cs + cs / 2;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="Rover grid">';
  for (let x = 0; x < S.cols; x++) for (let y = 0; y < S.rows; y++) s += '<rect class="rv-cell" x="' + (pad + x * cs + 1) + '" y="' + (6 + (S.rows - 1 - y) * cs + 1) + '" width="' + (cs - 2) + '" height="' + (cs - 2) + '" rx="' + Math.min(6, cs / 5) + '"/>';
  const lab = Math.max(1, Math.ceil(S.cols / 12));
  for (let x = 0; x < S.cols; x += lab) s += '<text class="rv-ax" x="' + cx(x) + '" y="' + (H - 2) + '" text-anchor="middle">' + x + '</text>';
  for (let y = 0; y < S.rows; y += lab) s += '<text class="rv-ax" x="' + (pad - 6) + '" y="' + (cy(y) + 3) + '" text-anchor="end">' + y + '</text>';
  S.rocks.forEach(([x, y]) => { if (x < S.cols && y < S.rows) s += '<rect class="rv-obs" x="' + (pad + x * cs + cs * .18) + '" y="' + (6 + (S.rows - 1 - y) * cs + cs * .18) + '" width="' + cs * .64 + '" height="' + cs * .64 + '" rx="' + cs * .2 + '"/>'; });
  f.rovers.forEach((r, i) => {
    let d = '', pen = false;
    r.trail.forEach(p => { if (!p) { pen = false; return; } d += (pen ? 'L' : 'M') + cx(p[0]) + ' ' + cy(p[1]); pen = true; });
    if (d) s += '<path class="rv-trail" d="' + d + '" style="stroke:' + COL[i % COL.length] + '"/>';
  });
  const rot = { N: 0, E: 90, S: 180, W: 270 };
  f.rovers.forEach((r, i) => {
    if (r.x < 0 || r.y < 0 || r.x >= S.cols || r.y >= S.rows) return;
    const R = cs * .34, X = cx(r.x), Y = cy(r.y), on = f.active === i;
    s += '<g transform="translate(' + X + ' ' + Y + ') rotate(' + rot[r.d] + ')"><circle r="' + R + '" style="fill:' + COL[i % COL.length] + (r.stopped ? ';stroke:var(--bad);stroke-width:3' : on ? ';stroke:var(--fg);stroke-width:2.5' : '') + '"/><path class="rv-nose" d="M0 ' + (-R - cs * .2) + ' L' + (R * .62) + ' ' + (-R * .35) + ' L' + (-R * .62) + ' ' + (-R * .35) + 'Z"/></g><text class="rv-lab" x="' + X + '" y="' + (Y + 4) + '" text-anchor="middle">' + (i + 1) + '</text>';
  });
  return s + '</svg>';
}
function mountRover(host, P) {
  const v = P.govtech.viz, mode = v.mode || 'classic';
  host.innerHTML = '<div class="rv"><div class="rv-top"><b>Watch the rovers drive</b><span class="muted" style="font-size:13px">' + (mode === 'wrap' ? 'F/B/L/R on a round planet' : mode === 'safe' ? 'rocks and other rovers block moves' : 'L/R turn, M moves') + '</span></div>' +
    '<div class="rv-in"><textarea rows="' + Math.min(7, v.input.split('\n').length + 1) + '" aria-label="Rover input" style="flex:1 1 220px;min-width:0;border-radius:14px;border:1px solid var(--line);background:var(--subtle);color:var(--fg);padding:8px 12px;font:13px/1.5 var(--f-mono);resize:vertical">' + esc(v.input) + '</textarea>' +
    (mode === 'safe' ? '<input aria-label="Rocks" placeholder="rocks: 4 0; 2 3" value="' + esc((v.obstacles || []).map(o => o.join(' ')).join('; ')) + '">' : '') + '<button class="btn small" data-r="run">Run</button></div>' +
    '<div class="rv-stage"></div><div class="rv-note" aria-live="polite"></div><div class="rv-ctl"><button class="btn small icon" data-r="prev" aria-label="Back">‹</button><button class="btn small" data-r="play">▶ Play</button><button class="btn small icon" data-r="next" aria-label="Forward">›</button><input type="range" min="0" value="0" aria-label="Step"><span class="muted mono" style="font-size:12px" data-r="n"></span></div></div>';
  const stage = $('.rv-stage', host), note = $('.rv-note', host), sl = $('input[type=range]', host), num = $('[data-r=n]', host), playB = $('[data-r=play]', host);
  let S = null, k = 0, timer = null;
  const stop = () => { if (timer) clearInterval(timer); timer = null; playB.textContent = '▶ Play'; };
  const show = i => { if (!S) return; k = Math.max(0, Math.min(S.frames.length - 1, i)); const f = S.frames[k]; stage.innerHTML = roverSVG(S, f); note.innerHTML = f.bad ? '<span class="bad">' + esc(f.note) + '</span>' : esc(f.note); sl.value = k; num.textContent = k + '/' + (S.frames.length - 1); };
  const run = () => {
    stop();
    try {
      const rocksIn = $('.rv-in input', host);
      const rocks = rocksIn ? rocksIn.value.split(';').map(s => s.trim().split(/[\s,]+/).map(Number)).filter(a => a.length === 2 && a.every(Number.isFinite)) : [];
      S = simulate($('.rv-in textarea', host).value, mode, rocks);
      if (S.cols > 40 || S.rows > 40) { stage.innerHTML = ''; note.innerHTML = '<span class="bad">Grid too big to draw (' + S.cols + ' × ' + S.rows + '). Try 40 × 40 or smaller. Final answer: ' + esc(S.out.replace(/\n/g, ' | ')) + '</span>'; S = null; return; }
      sl.max = S.frames.length - 1; show(0);
    } catch (e) { S = null; stage.innerHTML = ''; note.innerHTML = '<span class="bad">' + esc(e.message) + '</span>'; }
  };
  host.addEventListener('click', e => {
    const b = e.target.closest('[data-r]'); if (!b) return; const a = b.dataset.r;
    if (a === 'run') run();
    if (a === 'prev') { stop(); show(k - 1); }
    if (a === 'next') { stop(); show(k + 1); }
    if (a === 'play') { if (timer) { stop(); return; } if (!S) run(); if (!S) return; if (k >= S.frames.length - 1) show(0); playB.textContent = '❚❚ Pause'; timer = setInterval(() => { if (!host.isConnected || k >= S.frames.length - 1) { stop(); return; } show(k + 1); }, 420); }
  });
  sl.addEventListener('input', () => { stop(); show(+sl.value); });
  run();
}
/* ---------- generic frame player used by the water and window visualisers ---------- */
function player(host, title, sub, inputsHTML, build) {
  host.innerHTML = '<div class="rv"><div class="rv-top"><b>' + esc(title) + '</b><span class="muted" style="font-size:13px">' + esc(sub) + '</span></div><div class="rv-in">' + inputsHTML + '<button class="btn small" data-r="run">Run</button></div><div class="rv-stage"></div><div class="rv-note" aria-live="polite"></div><div class="rv-ctl"><button class="btn small icon" data-r="prev" aria-label="Back">‹</button><button class="btn small" data-r="play">▶ Play</button><button class="btn small icon" data-r="next" aria-label="Forward">›</button><input type="range" min="0" value="0" aria-label="Step"><span class="muted mono" style="font-size:12px" data-r="n"></span></div></div>';
  const stage = $('.rv-stage', host), note = $('.rv-note', host), sl = $('input[type=range]', host), num = $('[data-r=n]', host), playB = $('[data-r=play]', host);
  let F = null, k = 0, timer = null;
  const stop = () => { if (timer) clearInterval(timer); timer = null; playB.textContent = '▶ Play'; };
  const show = i => { if (!F) return; k = Math.max(0, Math.min(F.frames.length - 1, i)); const f = F.frames[k]; stage.innerHTML = F.draw(f); note.innerHTML = f.bad ? '<span class="bad">' + esc(f.note) + '</span>' : esc(f.note); sl.value = k; num.textContent = k + '/' + (F.frames.length - 1); };
  const run = () => { stop(); try { F = build(host); sl.max = F.frames.length - 1; show(0); } catch (e) { F = null; stage.innerHTML = ''; note.innerHTML = '<span class="bad">' + esc(e.message) + '</span>'; } };
  host.addEventListener('click', e => {
    const b = e.target.closest('[data-r]'); if (!b) return; const a = b.dataset.r;
    if (a === 'run') run();
    if (a === 'prev') { stop(); show(k - 1); }
    if (a === 'next') { stop(); show(k + 1); }
    if (a === 'play') { if (timer) { stop(); return; } if (!F) run(); if (!F) return; if (k >= F.frames.length - 1) show(0); playB.textContent = '❚❚ Pause'; timer = setInterval(() => { if (!host.isConnected || k >= F.frames.length - 1) { stop(); return; } show(k + 1); }, 520); }
  });
  sl.addEventListener('input', () => { stop(); show(+sl.value); });
  run();
}
const parseNums = s => { const a = String(s).replace(/[\[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number); if (a.some(x => !Number.isFinite(x))) throw new Error('Use numbers separated by commas'); return a; };

function mountWater(host, P) {
  const v = P.govtech.viz;
  player(host, 'Watch the two pointers fill the water', 'move the lower side inward; its max decides its water', '<input aria-label="Heights" value="' + esc((v.heights || []).join(', ')) + '" style="flex:1 1 220px">', h => {
    const H = parseNums($('.rv-in input', h).value).map(x => Math.max(0, Math.floor(x)));
    if (!H.length) throw new Error('Enter at least one height');
    if (H.length > 40 || Math.max(...H) > 20) throw new Error('Keep it to 40 bars of height 0-20 so it fits');
    const water = H.map(() => 0), frames = [];
    let l = 0, r = H.length - 1, lmax = 0, rmax = 0, total = 0;
    const snap = (note, cur) => frames.push({ l, r, lmax, rmax, total, water: water.slice(), cur, note });
    snap('Start with L at the left end and R at the right end. Total = 0.', -1);
    while (l <= r) {
      if (H[l] <= H[r]) {
        if (H[l] >= lmax) { lmax = H[l]; snap('h[L] = ' + H[l] + ' ≤ h[R] = ' + H[r] + ', so the right side is at least as tall. h[L] is a new left max (' + lmax + '): no water here.', l); }
        else { water[l] = lmax - H[l]; total += water[l]; snap('h[L] = ' + H[l] + ' ≤ h[R]. Water at ' + l + ' = leftMax ' + lmax + ' − ' + H[l] + ' = ' + water[l] + '. Total ' + total + '.', l); }
        l++;
      } else {
        if (H[r] >= rmax) { rmax = H[r]; snap('h[R] = ' + H[r] + ' < h[L] = ' + H[l] + ', so work on the right. New right max (' + rmax + '): no water here.', r); }
        else { water[r] = rmax - H[r]; total += water[r]; snap('h[R] = ' + H[r] + ' < h[L]. Water at ' + r + ' = rightMax ' + rmax + ' − ' + H[r] + ' = ' + water[r] + '. Total ' + total + '.', r); }
        r--;
      }
    }
    snap('Pointers crossed. Trapped water = ' + total + '. One pass, O(N) time, O(1) extra space.', -1);
    const top = Math.max(1, ...H), cw = Math.max(12, Math.min(34, Math.floor(560 / H.length))), u = Math.max(10, Math.min(22, Math.floor(200 / top))), W = H.length * cw + 40, Ht = top * u + 46;
    return { frames, draw: f => {
      let s = '<svg viewBox="0 0 ' + W + ' ' + Ht + '" width="' + W + '" role="img" aria-label="Elevation map">';
      const base = Ht - 22;
      H.forEach((h, i) => {
        const x = 20 + i * cw;
        if (f.water[i]) s += '<rect x="' + (x + 1) + '" y="' + (base - (h + f.water[i]) * u) + '" width="' + (cw - 2) + '" height="' + f.water[i] * u + '" style="fill:color-mix(in srgb, var(--accent) 35%, transparent)"/>';
        if (h) s += '<rect x="' + (x + 1) + '" y="' + (base - h * u) + '" width="' + (cw - 2) + '" height="' + h * u + '" rx="2" style="fill:' + (i === f.cur ? 'var(--hi)' : 'var(--fg2)') + '"/>';
        s += '<text class="rv-ax" x="' + (x + cw / 2) + '" y="' + (Ht - 8) + '" text-anchor="middle">' + h + '</text>';
      });
      s += '<line x1="20" y1="' + base + '" x2="' + (W - 20) + '" y2="' + base + '" style="stroke:var(--line2)"/>';
      if (f.lmax) s += '<line x1="20" x2="' + (20 + Math.min(f.l, H.length) * cw) + '" y1="' + (base - f.lmax * u) + '" y2="' + (base - f.lmax * u) + '" style="stroke:var(--accent);stroke-dasharray:4 3"/>';
      if (f.rmax) s += '<line x1="' + (20 + (Math.max(f.r, -1) + 1) * cw) + '" x2="' + (W - 20) + '" y1="' + (base - f.rmax * u) + '" y2="' + (base - f.rmax * u) + '" style="stroke:var(--hi);stroke-dasharray:4 3"/>';
      const ptr = (i, t, c) => i >= 0 && i < H.length ? '<text x="' + (20 + i * cw + cw / 2) + '" y="12" text-anchor="middle" style="font:600 11px var(--f-mono);fill:' + c + '">' + t + '</text>' : '';
      s += ptr(f.l, 'L', 'var(--accent)') + ptr(f.r, 'R', 'var(--hi)');
      return s + '</svg>';
    } };
  });
}

function mountWindow(host, P) {
  const v = P.govtech.viz;
  const reqText = (v.requests || []).map(r => r[0] + ' ' + r[1]).join('\n');
  player(host, 'Watch each user\'s sliding window', 'a request is allowed if its user has < limit allowed requests in (t − window, t]',
    '<textarea rows="5" aria-label="Requests, one per line: user time" style="flex:1 1 180px;min-width:0;border-radius:14px;border:1px solid var(--line);background:var(--subtle);color:var(--fg);padding:8px 12px;font:13px/1.5 var(--f-mono);resize:vertical">' + esc(reqText) + '</textarea><label class="muted" style="font-size:13px;display:flex;flex-direction:column;gap:4px">limit<input data-k="limit" value="' + esc(v.limit) + '" style="width:70px"></label><label class="muted" style="font-size:13px;display:flex;flex-direction:column;gap:4px">window<input data-k="window" value="' + esc(v.window) + '" style="width:70px"></label>', h => {
    const limit = +$('[data-k=limit]', h).value, win = +$('[data-k=window]', h).value;
    if (!(limit >= 1) || !(win >= 1)) throw new Error('limit and window must be positive numbers');
    const reqs = $('textarea', h).value.split('\n').map(s => s.trim()).filter(Boolean).map(s => { const p = s.split(/[\s,]+/); if (p.length !== 2 || !Number.isFinite(+p[1])) throw new Error('Each line is "user time"'); return [p[0], +p[1]]; });
    if (!reqs.length) throw new Error('Add a request');
    if (reqs.length > 40) throw new Error('Keep it to 40 requests so it fits');
    const users = [...new Set(reqs.map(r => r[0]))].slice(0, 6), log = {}, res = [], frames = [];
    users.forEach(u => log[u] = []);
    frames.push({ i: -1, res: [], note: 'Each user keeps a queue of the times of their allowed requests.' });
    reqs.forEach(([u, t], i) => {
      const q = log[u] || (log[u] = []);
      let dropped = 0; while (q.length && q[0] <= t - win) { q.shift(); dropped++; }
      const ok = q.length < limit; if (ok) q.push(t); res.push(ok);
      frames.push({ i, res: res.slice(), q: q.slice(), u, t, bad: !ok, note: u + ' at t=' + t + ': drop ' + dropped + ' old time' + (dropped === 1 ? '' : 's') + ' (≤ ' + (t - win) + '), ' + (ok ? (q.length - 1) + ' < ' + limit + ' in the window → allowed' : q.length + ' already in the window → rejected (does not count)') });
    });
    const tmin = Math.min(...reqs.map(r => r[1])) - win, tmax = Math.max(...reqs.map(r => r[1])) + 1, W = 620, lane = 46, H = users.length * lane + 34;
    const X = t => 70 + (t - tmin) / Math.max(1, tmax - tmin) * (W - 90);
    return { frames, draw: f => {
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="Request timeline">';
      users.forEach((u, li) => {
        const y = 20 + li * lane;
        s += '<text class="rv-ax" x="8" y="' + (y + 4) + '" style="font-size:11px">' + esc(u.slice(0, 8)) + '</text><line x1="70" x2="' + (W - 20) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(--line2)"/>';
        if (f.u === u) s += '<rect x="' + X(f.t - win) + '" y="' + (y - 14) + '" width="' + (X(f.t) - X(f.t - win)) + '" height="28" rx="8" style="fill:color-mix(in srgb, var(--hi) 22%, transparent);stroke:var(--hi)"/>';
      });
      reqs.forEach(([u, t], i) => {
        const li = users.indexOf(u); if (li < 0 || i > f.i) return;
        const y = 20 + li * lane, ok = f.res[i];
        s += '<circle cx="' + X(t) + '" cy="' + y + '" r="' + (i === f.i ? 8 : 6) + '" style="fill:' + (ok ? 'var(--ok)' : 'var(--bad)') + (i === f.i ? ';stroke:var(--fg);stroke-width:2' : '') + '"/>';
      });
      const ticks = 8; for (let k = 0; k <= ticks; k++) { const t = Math.round(tmin + (tmax - tmin) * k / ticks); s += '<text class="rv-ax" x="' + X(t) + '" y="' + (H - 4) + '" text-anchor="middle">' + t + '</text>'; }
      return s + '</svg>';
    } };
  });
}

function mountAll(root, probById) {
  $$('.gt-viz:not([data-on])', root).forEach(h => {
    h.dataset.on = '1'; const P = probById[h.dataset.pid], k = P && P.govtech && P.govtech.viz && P.govtech.viz.kind;
    if (k === 'rover') mountRover(h, P); else if (k === 'water') mountWater(h, P); else if (k === 'window') mountWindow(h, P);
  });
}

/* ---------- sections on Learn and Problems ---------- */
function setHTML(PROBLEMS, solved) {
  const gt = PROBLEMS.filter(p => p.govtech);
  if (!gt.length) return '';
  const order = { reported: 0, inspired: 1, domain: 2 }, rorder = { live: 0, oa: 1, 'take-home': 2 };
  const groups = [['grl', 'AI product code'], ['live', 'GovTech live coding'], ['oa', 'GovTech online assessment'], ['take-home', 'GovTech take-homes']];
  const n = gt.filter(p => solved[p.id]).length;
  return '<section class="must gt-sec"><div class="day-h"><h2>GovTech set</h2><span class="muted">' + n + '/' + gt.length + ' solved · from candidate reports</span></div>' +
    groups.map(([r, t]) => { const L = gt.filter(p => r === 'grl' ? p.grl : !p.grl && p.govtech.round === r).sort((a, b) => order[a.govtech.tag] - order[b.govtech.tag] || (a.govtech.order || 99) - (b.govtech.order || 99)); return L.length ? '<div style="display:flex;flex-direction:column;gap:6px"><h3 class="gt-h">' + t + '</h3><div class="plist">' + L.map(p => '<a class="prow" href="#p-' + p.id + '"><span class="sdot ' + (solved[p.id] ? 'solved' : '') + '">' + (solved[p.id] ? '✓' : '') + '</span><span class="ttl">' + esc(p.title) + (p.govtech.tag === 'reported' ? ' <span class="gt-tag ev-direct" style="margin-left:6px;height:20px;font-size:11px">reported</span>' : '') + '</span><span class="lvl ' + p.level + '">' + p.level + '</span></a>').join('') + '</div></div>' : ''; }).join('') + (G.lc ? '<details class="assume"><summary class="eyebrow">LeetCode list</summary><div class="gt-lc">' + G.lc.map(g => '<div><b>' + esc(g.p) + ' <span class="muted" style="font-weight:400">' + esc(g.w) + '</span></b><ul>' + g.items.map(i => '<li><a href="https://leetcode.com/problems/' + esc(i.slug) + '/" target="_blank" rel="noopener noreferrer">' + i.n + '. ' + esc(i.t) + '</a></li>').join('') + '</ul></div>').join('') + '</div></details>' : '') + '</section>';
}
function homeHTML(PROBLEMS, solved) {
  const gt = PROBLEMS.filter(p => p.govtech), n = gt.filter(p => solved[p.id]).length;
  return '<section class="gt-sec"><div class="day-h"><h2>A typical loop</h2><a class="muted" href="#testday">Interview day →</a></div>' +
    '<div class="gt-flow">' + (G.stages || []).map(s => '<a href="#' + esc(s.href) + '"><i>' + esc(s.when) + '</i><b>' + esc(s.title) + '</b><span>' + esc(s.what) + '</span></a>').join('') + '</div>' +
    '</section>';
}
window.GT = { taskExtra, mountAll, setHTML, homeHTML, simulate };
})();
