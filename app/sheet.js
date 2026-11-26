/* Cheatsheet cards: masonry grid or list, column/width controls, drag-to-reorder, hide numbers. Ported from SG Theory Prep. */
(function () {
'use strict';
const PK = 'pg:sheetPref';
let PREF = {}; try { PREF = JSON.parse(localStorage.getItem(PK) || '{}') || {}; } catch (e) { PREF = {}; }
const savePref = () => { try { localStorage.setItem(PK, JSON.stringify(PREF)); } catch (e) {} };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const EXPAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>', SHRINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>';
const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
const motionOK = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const slug = t => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
const cardsOf = box => Array.from(box.querySelectorAll('.sec'));
const colsOf = box => Array.from(box.querySelectorAll(':scope > .mcol'));
const isGrid = () => (PREF.sheetLayout || 'grid') === 'grid' && window.innerWidth >= 600;
const isDeck = () => PREF.sheetLayout === 'cards';
const byKey = box => { const m = {}; (box._orig || cardsOf(box)).forEach(c => { m[c.dataset.key] = c; }); return m; };
function flatKeys(box) {
  const saved = (PREF.sheetOrder || {})[box.dataset.test] || [], m = byKey(box), out = [];
  saved.forEach(k => { if (m[k] && !out.includes(k)) out.push(k); });
  (box._orig || []).forEach(c => { if (!out.includes(c.dataset.key)) out.push(c.dataset.key); });
  return out;
}
function colCount(box) {
  const w = box.getBoundingClientRect().width || box.parentElement.getBoundingClientRect().width;
  const fit = Math.max(1, Math.floor((w + 16) / (300 + 16))), want = +PREF.sheetCols || 0;
  return want ? Math.min(want, fit) : Math.max(1, Math.min(4, Math.floor((w + 16) / (380 + 16))));
}
function renderBox(box) {
  if (!box._orig) return;
  const m = byKey(box), keys = flatKeys(box);
  if (isDeck()) { document.body.dataset.sheet = 'cards'; keys.forEach(k => box.appendChild(m[k])); colsOf(box).forEach(c => c.remove()); box._n = 0; box.classList.add('deck'); deckPaint(box); return; }
  box.classList.remove('deck'); cardsOf(box).forEach(c => { c.classList.remove('deck-cur', 'deck-n1', 'deck-n2'); c.style.transform = ''; c.style.transition = ''; c.style.opacity = ''; c.style.height = ''; });
  { const bar = box.nextElementSibling; if (bar && bar.classList.contains('deck-bar')) bar.remove(); }
  document.body.dataset.sheet = isGrid() ? 'grid' : 'list';
  if (!isGrid()) { keys.forEach(k => box.appendChild(m[k])); colsOf(box).forEach(c => c.remove()); box._n = 0; return; }
  const n = colCount(box); box._n = n;
  colsOf(box).forEach(c => c.remove());
  const cols = [];
  for (let i = 0; i < n; i++) { const c = document.createElement('div'); c.className = 'mcol'; box.appendChild(c); cols.push(c); }
  const placed = {};
  keys.filter(k => m[k].classList.contains('sec-wide')).reverse().forEach(k => { box.insertBefore(m[k], box.firstChild); placed[k] = 1; });
  const saved = ((PREF.sheetCols2 || {})[box.dataset.test] || {})[n];
  if (saved && saved.length === n) saved.forEach((list, ci) => list.forEach(k => { if (m[k] && !placed[k] && !m[k].classList.contains('sec-wide')) { cols[ci].appendChild(m[k]); placed[k] = 1; } }));
  keys.forEach(k => { if (placed[k]) return; let best = cols[0]; cols.forEach(c => { if (c.offsetHeight < best.offsetHeight) best = c; }); best.appendChild(m[k]); placed[k] = 1; });
}
function flip(box, mutate, skip) {
  const cards = cardsOf(box), first = new Map();
  cards.forEach(c => { if (c !== skip) first.set(c, c.getBoundingClientRect()); });
  mutate();
  if (!motionOK()) return;
  cards.forEach(c => {
    if (c === skip || !first.has(c)) return;
    const a = first.get(c), b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) return;
    c.style.transition = 'none'; c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; void c.offsetWidth;
    c.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)'; c.style.transform = '';
    c.addEventListener('transitionend', function te() { c.style.transition = ''; c.removeEventListener('transitionend', te); });
  });
}
function current() { return document.querySelector('.sheet-test'); }
function saveOrder(box) {
  const t = box.dataset.test; PREF.sheetOrder = PREF.sheetOrder || {};
  if (box._n) {
    PREF.sheetCols2 = PREF.sheetCols2 || {}; PREF.sheetCols2[t] = PREF.sheetCols2[t] || {};
    PREF.sheetCols2[t][box._n] = colsOf(box).map(c => cardsOf(c).map(s => s.dataset.key));
    PREF.sheetOrder[t] = cardsOf(box).map(s => { const r = s.getBoundingClientRect(); return [Math.round(r.top / 40), r.left, s.dataset.key]; }).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]);
  } else { PREF.sheetOrder[t] = cardsOf(box).map(s => s.dataset.key); if (PREF.sheetCols2) delete PREF.sheetCols2[t]; }
  savePref(); updateReset();
}
function updateReset() {
  const box = current(), btn = document.getElementById('orderReset'); if (!btn || !box) return;
  const t = box.dataset.test; btn.hidden = !(((PREF.sheetOrder || {})[t] || []).length || (PREF.sheetCols2 || {})[t]);
}
function applyLayout(animate) {
  { const b0 = current(); if (b0 && b0.classList.contains('focused')) focusSet(b0, null); }
  const lay = PREF.sheetLayout === 'list' || PREF.sheetLayout === 'cards' ? PREF.sheetLayout : 'grid', cols = String(+PREF.sheetCols || 0), mw = String(+PREF.sheetMaxW || 0);
  document.querySelectorAll('#colSeg [data-cols]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cols === cols)));
  document.querySelectorAll('#widthSeg [data-maxw]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.maxw === mw)));
  document.querySelectorAll('#layoutSeg [data-layout]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layout === lay)));
  document.documentElement.style.setProperty('--sheet-maxw', +mw ? mw + 'px' : 'none');
  ['colSeg', 'widthSeg'].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = lay !== 'grid'; });
  const box = current(); if (box) { if (animate) flip(box, () => renderBox(box)); else renderBox(box); }
}
const SEG = (id, lab, attr, opts) => '<div class="layout-seg" id="' + id + '" role="group" aria-label="' + lab + '">' + (lab === 'Layout' ? '' : '<span class="seg-lab">' + lab + '</span>') + opts.map(([v, t]) => '<button class="btn sm" type="button" data-' + attr + '="' + v + '" aria-pressed="false">' + t + '</button>').join('') + '</div>';
function mount(host, key, cards) {
  host.innerHTML = '<div class="sheet-bar">' +
    SEG('layoutSeg', 'Layout', 'layout', [['grid', 'Grid'], ['list', 'List'], ['cards', 'Cards']]) +
    SEG('colSeg', 'Columns', 'cols', [['0', 'Auto'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]) +
    SEG('widthSeg', 'Width', 'maxw', [['0', 'Full'], ['1920', '1920'], ['1600', '1600'], ['1280', '1280']]) +
    '<div class="tool-seg"><button class="btn sm" id="orderReset" type="button" hidden>Reset order</button><button class="btn sm" id="quizToggle" type="button" aria-pressed="false">Hide numbers</button></div></div>' +
    '<div class="sheet-test" data-test="' + esc(key) + '">' + cards.map(c => '<section class="sec' + (c.wide ? ' sec-wide' : '') + '"><div class="sec-title"><h2>' + esc(c.title) + '</h2></div><div class="sec-b">' + c.html + '</div></section>').join('') + '</div>';
  const box = host.querySelector('.sheet-test'), seen = {};
  cardsOf(box).forEach(sec => {
    const h = sec.querySelector('.sec-title h2'); let k = slug(h ? h.textContent : '');
    if (seen[k]) k += '-' + (++seen[k]); else seen[k] = 1;
    sec.dataset.key = k;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'drag-h'; b.innerHTML = GRIP; b.title = 'Drag to reorder';
    b.setAttribute('aria-label', 'Move card: ' + (h ? h.textContent : 'card') + '. Drag, or use arrow keys');
    const fx = document.createElement('button'); fx.type = 'button'; fx.className = 'focus-h'; fx.innerHTML = EXPAND; fx.title = 'Focus this card';
    fx.setAttribute('aria-label', 'Focus card: ' + (h ? h.textContent : 'card'));
    sec.querySelector('.sec-title').appendChild(fx);
    sec.querySelector('.sec-title').appendChild(b);
  });
  box._orig = cardsOf(box);
  host.querySelector('#layoutSeg').onclick = e => { const b = e.target.closest('[data-layout]'); if (b) { PREF.sheetLayout = b.dataset.layout; savePref(); applyLayout(true); if (b.dataset.layout === 'cards') requestAnimationFrame(() => { const dk = host.querySelector('.sheet-test'); if (dk) dk.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' }); }); } };
  host.querySelector('#colSeg').onclick = e => { const b = e.target.closest('[data-cols]'); if (b) { PREF.sheetCols = +b.dataset.cols; savePref(); applyLayout(true); } };
  host.querySelector('#widthSeg').onclick = e => { const b = e.target.closest('[data-maxw]'); if (b) { PREF.sheetMaxW = +b.dataset.maxw; savePref(); applyLayout(true); } };
  host.querySelector('#orderReset').onclick = () => { const t = box.dataset.test; if (PREF.sheetOrder) delete PREF.sheetOrder[t]; if (PREF.sheetCols2) delete PREF.sheetCols2[t]; savePref(); flip(box, () => renderBox(box)); updateReset(); };
  const qt = host.querySelector('#quizToggle');
  document.body.classList.remove('quizzing');
  qt.onclick = () => { const on = !document.body.classList.contains('quizzing'); document.body.classList.toggle('quizzing', on); qt.setAttribute('aria-pressed', String(on)); qt.textContent = on ? 'Show numbers' : 'Hide numbers'; box.querySelectorAll('.n').forEach(el => el.classList.remove('shown')); };
  applyLayout(false); updateReset();
  requestAnimationFrame(() => renderBox(box));
}
/* ---------- Cards view: a swipeable stack ---------- */
function deckPaint(box) {
  const cards = cardsOf(box), n = cards.length;
  box._di = Math.max(0, Math.min(n - 1, box._di || 0));
  const i = box._di;
  cards.forEach((c, k) => { c.classList.toggle('deck-cur', k === i); c.classList.toggle('deck-n1', k === i + 1); c.classList.toggle('deck-n2', k === i + 2); c.style.transform = ''; c.style.transition = ''; c.style.opacity = ''; });
  let bar = box.nextElementSibling;
  if (!bar || !bar.classList.contains('deck-bar')) {
    bar = document.createElement('div'); bar.className = 'deck-bar';
    bar.innerHTML = '<button type="button" class="btn sm" data-deck="-1" aria-label="Previous card">‹ Back</button><span class="deck-count" aria-live="polite"></span><button type="button" class="btn sm primary" data-deck="1" aria-label="Next card">Next ›</button>';
    box.after(bar);
    bar.addEventListener('click', e => { const b = e.target.closest('[data-deck]'); if (b) deckGo(box, +b.dataset.deck); });
  }
  { cards.forEach(c => { c.style.height = ''; }); const cur = cards[i], h = cur ? cur.offsetHeight : 0; cards.forEach((c, k) => { c.style.height = (k === i + 1 || k === i + 2) && h ? h + 'px' : ''; }); }
  bar.querySelector('.deck-count').textContent = (n ? i + 1 : 0) + ' / ' + n + (cards[i] ? '  ·  ' + ((cards[i].querySelector('.sec-title h2') || {}).textContent || '') : '');
  bar.querySelector('[data-deck="-1"]').disabled = i === 0;
  bar.querySelector('[data-deck="1"]').disabled = i >= n - 1;
  if (window.EXPLAIN && EXPLAIN.fitMinis && cards[i]) EXPLAIN.fitMinis(cards[i]);
}
function deckGo(box, d, fromSwipe) {
  const cards = cardsOf(box), i = box._di || 0, j = i + d;
  if (j < 0 || j >= cards.length) { const c = cards[i]; if (c && motionOK()) { c.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)'; c.style.transform = ''; } return; }
  const cur = cards[i];
  if (motionOK() && cur) {
    cur.style.transition = 'transform .28s ease, opacity .28s ease';
    cur.style.transform = 'translateX(' + (d > 0 ? -115 : 115) + '%) rotate(' + (d > 0 ? -9 : 9) + 'deg)'; cur.style.opacity = '0';
    setTimeout(() => { box._di = j; deckPaint(box); }, 230);
  } else { box._di = j; deckPaint(box); }
}
let swipe = null;
document.addEventListener('pointerdown', e => {
  if (e.button > 0 || !isDeck()) return;
  const sec = e.target.closest && e.target.closest('.sheet-test.deck .sec.deck-cur'); if (!sec) return;
  if (e.target.closest('a, button, summary, input, select, textarea, label, pre, code, .n, .ex-mctl')) return;
  swipe = { sec, box: sec.closest('.sheet-test'), x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId };
}, true);
document.addEventListener('pointermove', e => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
  if (!swipe.on) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 12) swipe = null; return; } swipe.on = true; try { swipe.sec.setPointerCapture(swipe.id); } catch (er) {} swipe.sec.classList.add('swiping'); }
  swipe.dx = dx; swipe.sec.style.transition = 'none';
  swipe.sec.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 22) + 'deg)';
}, true);
function endSwipe() {
  if (!swipe) return; const sw = swipe; swipe = null; sw.sec.classList.remove('swiping');
  if (!sw.on) return;
  const swallow = ev => { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener('click', swallow, true); };
  document.addEventListener('click', swallow, true); setTimeout(() => document.removeEventListener('click', swallow, true), 0);
  if (Math.abs(sw.dx) > 90) deckGo(sw.box, sw.dx < 0 ? 1 : -1, true);
  else { sw.sec.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)'; sw.sec.style.transform = ''; }
}
document.addEventListener('pointerup', endSwipe, true);
document.addEventListener('pointercancel', endSwipe, true);
document.addEventListener('keydown', e => {
  if (!isDeck() || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.CodeMirror'))) return;
  const box = current(); if (!box || !box.classList.contains('deck')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); deckGo(box, 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); deckGo(box, -1); }
});
function focusCard(host, title) {
  const box = host.querySelector('.sheet-test'); if (!box) return;
  const cards = cardsOf(box), k = cards.findIndex(c => { const h = c.querySelector('.sec-title h2'); return h && h.textContent.trim() === title; });
  if (k < 0) return;
  if (isDeck()) { box._di = k; deckPaint(box); box.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' }); return; }
  const sec = cards[k]; sec.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
  sec.classList.remove('pf-flash'); void sec.offsetWidth; sec.classList.add('pf-flash');
}
/* ---------- Focus: one card in view ---------- */
function focusSet(box, sec) {
  const cards = cardsOf(box);
  cards.forEach(c => { c.classList.toggle('focus-cur', c === sec); const fb = c.querySelector('.focus-h'); if (fb) { const on = c === sec; fb.innerHTML = on ? SHRINK : EXPAND; fb.title = on ? 'Show all cards (Esc)' : 'Focus this card'; fb.setAttribute('aria-pressed', String(on)); } });
  box.classList.toggle('focused', !!sec);
  let bar = box.parentElement.querySelector(':scope > .focus-bar');
  if (!sec) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement('div'); bar.className = 'focus-bar';
    bar.innerHTML = '<button type="button" class="btn sm" data-fx="-1" aria-label="Previous card">‹ Prev</button><span class="focus-count" aria-live="polite"></span><button type="button" class="btn sm" data-fx="1" aria-label="Next card">Next ›</button><button type="button" class="btn sm primary" data-fx="0">Show all</button>';
    box.after(bar);
    bar.addEventListener('click', e => { const b = e.target.closest('[data-fx]'); if (!b) return; const d = +b.dataset.fx; if (!d) { focusSet(box, null); return; } focusStep(box, d); });
  }
  const i = cards.indexOf(sec);
  bar.querySelector('.focus-count').textContent = (i + 1) + ' / ' + cards.length + '  ·  ' + ((sec.querySelector('.sec-title h2') || {}).textContent || '');
  bar.querySelector('[data-fx="-1"]').disabled = i === 0;
  bar.querySelector('[data-fx="1"]').disabled = i >= cards.length - 1;
  if (window.EXPLAIN && EXPLAIN.fitMinis) EXPLAIN.fitMinis(sec);
  const top = sec.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: Math.max(0, top), behavior: motionOK() ? 'smooth' : 'auto' });
}
function focusStep(box, d) {
  // follow the order you see the cards in (row by row across the columns)
  const cards = cardsOf(box), cur = box.querySelector('.sec.focus-cur'), i = cards.indexOf(cur), j = i + d;
  if (cur && j >= 0 && j < cards.length) focusSet(box, cards[j]);
}
document.addEventListener('click', e => {
  const fb = e.target.closest('.sheet-test .focus-h'); if (!fb) return;
  e.preventDefault(); e.stopPropagation();
  const sec = fb.closest('.sec'), box = sec.closest('.sheet-test');
  focusSet(box, sec.classList.contains('focus-cur') ? null : sec);
}, true);
document.addEventListener('keydown', e => {
  const box = current(); if (!box || !box.classList.contains('focused') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
  if (e.key === 'Escape') { e.preventDefault(); focusSet(box, null); }
  else if (e.key === 'ArrowRight' && !isDeck()) { e.preventDefault(); focusStep(box, 1); }
  else if (e.key === 'ArrowLeft' && !isDeck()) { e.preventDefault(); focusStep(box, -1); }
});
let drag = null, pend = null, ghost = null;
function placeGhost(sec, tx, ty, glide) {
  if (!ghost) return; const r = sec.getBoundingClientRect(), w = r.width / 1.01, h = r.height / 1.01;
  ghost.classList.toggle('glide', !!glide && motionOK());
  ghost.style.left = (r.left - tx + (r.width - w) / 2) + 'px'; ghost.style.top = (r.top - ty + (r.height - h) / 2) + 'px'; ghost.style.width = w + 'px'; ghost.style.height = h + 'px';
}
function startDrag(p) {
  const sec = p.sec, r = sec.getBoundingClientRect();
  ghost = document.createElement('div'); ghost.className = 'drop-ghost'; ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.appendChild(ghost); void ghost.offsetWidth; ghost.classList.add('on');
  drag = { sec, box: sec.closest('.sheet-test'), offX: p.x - r.left, offY: p.y - r.top, tx: 0, ty: 0, moved: false, lastSwap: 0 };
  sec.classList.add('dragging'); drag.box.classList.add('is-dragging');
  const sel = window.getSelection && window.getSelection(); if (sel) sel.removeAllRanges();
  try { sec.setPointerCapture(p.id); } catch (er) {}
}
function follow(d, x, y) { const r = d.sec.getBoundingClientRect(), natX = r.left - d.tx, natY = r.top - d.ty; d.tx = x - d.offX - natX; d.ty = y - d.offY - natY; d.sec.style.transform = 'translate(' + d.tx + 'px,' + d.ty + 'px) scale(1.01)'; }
function dropSpot(d, x, y) {
  const lists = d.box._n ? colsOf(d.box) : [d.box]; let list = lists[0], bestDx = Infinity;
  lists.forEach(c => { const b = c.getBoundingClientRect(), dx = x < b.left ? b.left - x : x > b.right ? x - b.right : 0; if (dx < bestDx) { bestDx = dx; list = c; } });
  const items = Array.from(list.querySelectorAll(':scope > .sec')).filter(c => c !== d.sec); let before = null;
  for (const it of items) { const b = it.getBoundingClientRect(); if (y < b.top + Math.min(b.height / 2, 90)) { before = it; break; } }
  if (d.sec.parentElement === list && d.sec.nextElementSibling === before) return null;
  if (d.sec.parentElement === list && !before && !d.sec.nextElementSibling) return null;
  return [list, before];
}
document.addEventListener('pointerdown', e => {
  if (e.button > 0 || drag || isDeck() || (current() && current().classList.contains('focused'))) return;
  const sec = e.target.closest && e.target.closest('.sheet-test .sec'); if (!sec) return;
  const onHandle = e.target.closest('.drag-h');
  if (!onHandle && e.target.closest('a, button, summary, input, select, textarea, label, pre, code, .n')) return;
  pend = { sec, x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType === 'touch', timer: null };
  if (onHandle) { e.preventDefault(); startDrag(pend); pend = null; return; }
  if (pend.touch) { const pp = pend; pp.timer = setTimeout(() => { if (pend === pp) { startDrag(pp); pend = null; } }, 320); }
});
document.addEventListener('touchmove', e => { if (drag) e.preventDefault(); }, { passive: false });
document.addEventListener('pointermove', e => {
  if (pend) { const dist = Math.abs(e.clientX - pend.x) + Math.abs(e.clientY - pend.y); if (pend.touch) { if (dist > 10) { clearTimeout(pend.timer); pend = null; } return; } if (dist < 6) return; startDrag(pend); pend = null; }
  if (!drag) return; e.preventDefault();
  const d = drag; d.moved = true; follow(d, e.clientX, e.clientY); placeGhost(d.sec, d.tx, d.ty, false);
  if (Date.now() - d.lastSwap < 90) return;
  const spot = dropSpot(d, e.clientX, e.clientY); if (!spot) return;
  d.lastSwap = Date.now(); flip(d.box, () => spot[0].insertBefore(d.sec, spot[1]), d.sec);
  follow(d, e.clientX, e.clientY); placeGhost(d.sec, d.tx, d.ty, true);
});
function endDrag() {
  if (pend) { clearTimeout(pend.timer); pend = null; }
  if (!drag) return; const d = drag; drag = null; d.box.classList.remove('is-dragging');
  if (ghost) { const g = ghost; ghost = null; g.classList.remove('on'); setTimeout(() => g.remove(), 200); }
  const sec = d.sec; if (motionOK()) sec.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease';
  sec.style.transform = ''; setTimeout(() => { sec.classList.remove('dragging'); sec.style.transition = ''; }, motionOK() ? 260 : 0);
  if (d.moved) {
    const swallow = ev => { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener('click', swallow, true); };
    document.addEventListener('click', swallow, true); setTimeout(() => document.removeEventListener('click', swallow, true), 0);
    saveOrder(d.box); sec.classList.add('drop-flash'); setTimeout(() => sec.classList.remove('drop-flash'), 520);
  }
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);
document.addEventListener('keydown', e => {
  const h = e.target.closest && e.target.closest('.drag-h'); if (!h) return;
  const k = e.key; if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) return;
  e.preventDefault();
  const sec = h.closest('.sec'), box = sec.closest('.sheet-test'), list = sec.parentElement, items = Array.from(list.querySelectorAll(':scope > .sec')), i = items.indexOf(sec);
  flip(box, () => {
    if (k === 'ArrowUp' && i > 0) list.insertBefore(sec, items[i - 1]);
    else if (k === 'ArrowDown' && i < items.length - 1) list.insertBefore(sec, items[i + 1].nextSibling);
    else if (box._n && (k === 'ArrowLeft' || k === 'ArrowRight')) { const cols = colsOf(box), ci = cols.indexOf(list), nj = ci + (k === 'ArrowLeft' ? -1 : 1); if (nj < 0 || nj >= cols.length) return; const dest = Array.from(cols[nj].querySelectorAll(':scope > .sec')); cols[nj].insertBefore(sec, dest[Math.min(i, dest.length)] || null); }
  });
  h.focus({ preventScroll: true }); saveOrder(box);
});
document.addEventListener('click', e => { if (!document.body.classList.contains('quizzing')) return; const el = e.target.closest('.sheet-test .n'); if (el) el.classList.toggle('shown'); });
let rl = false;
window.addEventListener('resize', () => { const box = current(); if (!box || rl || isDeck()) return; rl = true; requestAnimationFrame(() => { rl = false; if (isGrid() && colCount(box) === box._n) return; renderBox(box); }); });
// card content helpers
const H = {
  facts: rows => '<div class="facts">' + rows.map(r => '<div class="fact"><div class="n">' + r[0] + '</div><div class="t">' + r[1] + (r[2] ? '<i>' + r[2] + '</i>' : '') + '</div></div>').join('') + '</div>',
  // a short answer sits in a pill on the right; a sentence goes on its own line under the label
  pairs: rows => '<div class="pats">' + rows.map(r => String(r[1]).replace(/<[^>]+>/g, '').length > 28
    ? '<div class="pat pat-stack"><div class="ph">' + r[0] + '</div><div class="ex pat-ans">' + r[1] + '</div>' + (r[2] ? '<div class="ex">' + r[2] + '</div>' : '') + '</div>'
    : '<div class="pat"><div class="ph">' + r[0] + '</div><div class="sc">' + r[1] + '</div>' + (r[2] ? '<div class="ex">' + r[2] + '</div>' : '') + '</div>').join('') + '</div>',
  list: items => '<ul class="rlist">' + items.map(x => '<li>' + x + '</li>').join('') + '</ul>',
};
window.SHEET = { mount, H, focus: (host, t) => focusCard(host, t) };
})();
/* small pictures for cheatsheet cards */
(function () {
const T = (x, y, s, cls, anchor) => '<text x="' + x + '" y="' + y + '" class="' + (cls || 'pv-t') + '" text-anchor="' + (anchor || 'middle') + '">' + s + '</text>';
function row(vals, x0, y, o) {
  o = o || {}; const w = o.w || 30, h = o.h || 30; let s = '';
  vals.forEach((v, i) => { const x = x0 + i * (w + 4), cls = (o.hi || []).includes(i) ? 'pv-hi' : (o.dim || []).includes(i) ? 'pv-dim' : 'pv-cell'; s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" class="' + cls + '"/>' + T(x + w / 2, y + h / 2 + 4, v, (o.hi || []).includes(i) ? 'pv-th' : 'pv-t'); });
  return s;
}
const ptr = (x0, i, y, lab, cls, w) => { const x = x0 + i * ((w || 30) + 4) + (w || 30) / 2; return T(x, y, lab, cls || 'pv-p') + '<path d="M' + (x - 4) + ' ' + (y + 3) + ' L' + (x + 4) + ' ' + (y + 3) + ' L' + x + ' ' + (y + 9) + 'Z" class="' + (cls === 'pv-p2' ? 'pv-a2' : 'pv-a') + '"/>'; };
const svg = (h, inner) => '<svg class="pv" viewBox="0 0 320 ' + h + '" role="img" aria-hidden="true">' + inner + '</svg>';
const PICS = {
  'two-pointers': () => svg(84, '<rect x="44" y="34" width="102" height="38" rx="10" class="pv-band"/>' + row(['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], 10, 38, { hi: [1, 2, 3] }) + ptr(10, 1, 22, 'L') + ptr(10, 3, 22, 'R', 'pv-p2') + T(300, 80, 'grow R, shrink L', 'pv-s', 'end')),
  'binary-search': () => svg(84, row([1, 3, 4, 7, 9, 12, 15, 20], 10, 38, { dim: [0, 1, 2], hi: [4] }) + ptr(10, 3, 22, 'lo') + ptr(10, 4, 22, 'mid', 'pv-p2') + ptr(10, 7, 22, 'hi') + T(300, 80, 'halve the range each step', 'pv-s', 'end')),
  hashing: () => svg(84, row([3, 1, 3, 2], 10, 26, { hi: [2] }) + '<path d="M150 41 H186" class="pv-ln"/><path d="M186 37 L193 41 L186 45Z" class="pv-a"/>' + '<rect x="200" y="14" width="110" height="54" rx="12" class="pv-set"/>' + T(255, 34, 'seen = {3, 1}', 'pv-t') + T(255, 55, '3 in seen → O(1)', 'pv-s') + T(10, 80, 'remember, don’t search', 'pv-s', 'start')),
  'prefix-sums': () => svg(96, T(4, 30, 'A', 'pv-s', 'start') + row([2, 4, 1, 5], 22, 12) + T(4, 72, 'P', 'pv-s', 'start') + row([0, 2, 6, 7, 12], 22, 54, { hi: [1, 3] }) + T(300, 92, 'sum A[1..2] = P[3] − P[1] = 5', 'pv-s', 'end')),
  stack: () => svg(100, '<rect x="30" y="64" width="70" height="24" rx="6" class="pv-cell"/>' + T(65, 81, '(', 'pv-t') + '<rect x="30" y="36" width="70" height="24" rx="6" class="pv-cell"/>' + T(65, 53, '[', 'pv-t') + '<rect x="30" y="8" width="70" height="24" rx="6" class="pv-hi"/>' + T(65, 25, '{', 'pv-th') + T(120, 25, '← top: pop on ‘}’', 'pv-s', 'start') + T(120, 60, 'push openers,', 'pv-s', 'start') + T(120, 76, 'match closers', 'pv-s', 'start')),
  kadane: () => { const v = [3, 2, -6, 4, 0, 5, -2], b = [3, 4, 5]; let s = '<line x1="10" y1="58" x2="310" y2="58" class="pv-ln"/>'; v.forEach((x, i) => { const h = Math.abs(x) * 7, y = x >= 0 ? 58 - h : 58; s += '<rect x="' + (14 + i * 42) + '" y="' + y + '" width="30" height="' + Math.max(2, h) + '" rx="5" class="' + (b.includes(i) ? 'pv-hi' : x < 0 ? 'pv-neg' : 'pv-cell') + '"/>' + T(29 + i * 42, 102, x, 'pv-s'); }); return svg(108, s + T(310, 14, 'best run = 9', 'pv-s', 'end')); },
  dp: () => { let s = row([1, 1, 2, 3, 5, 8], 10, 30, { hi: [5] }); s += '<path d="M120 26 C130 6, 160 6, 175 26" class="pv-ln" fill="none"/><path d="M154 26 C160 14, 168 14, 175 26" class="pv-ln" fill="none"/>'; return svg(78, s + T(310, 74, 'dp[i] = dp[i−1] + dp[i−2]', 'pv-s', 'end')); },
  sorting: () => svg(96, row([5, 2, 9, 1, 5], 10, 8) + '<path d="M90 44 V58" class="pv-ln"/><path d="M86 56 L90 63 L94 56Z" class="pv-a"/>' + row([1, 2, 5, 5, 9], 10, 64, { hi: [2, 3] }) + T(310, 30, 'sort once, O(N log N)', 'pv-s', 'end') + T(310, 84, 'neighbours: dupes, gaps', 'pv-s', 'end')),
  strings: () => svg(84, row(['h', 'i', ' ', 'y', 'o', 'u'], 10, 12, { dim: [2] }) + T(10, 66, 'split → ["hi", "you"] → join', 'pv-s', 'start') + T(10, 82, 'build with a list, then join', 'pv-s', 'start')),
  math: () => { let s = ''; for (let i = 0; i < 6; i++) for (let j = 0; j <= i; j++) s += '<rect x="' + (14 + j * 14) + '" y="' + (8 + i * 14) + '" width="11" height="11" rx="3" class="pv-cell"/>'; return svg(96, s + T(120, 40, '1 + 2 + … + N', 'pv-t', 'start') + T(120, 62, '= N(N + 1) / 2', 'pv-th2', 'start') + T(120, 84, 'formula, not a loop', 'pv-s', 'start')); },
  'greedy-sim': () => { let s = ''; for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) s += '<rect x="' + (10 + i * 22) + '" y="' + (6 + j * 22) + '" width="20" height="20" rx="4" class="pv-cell"/>'; s += '<path d="M21 83 V39 H65 V17" class="pv-path"/><circle cx="65" cy="17" r="6" class="pv-dot"/>'; return svg(96, s + T(130, 34, 'state: x, y, heading', 'pv-t', 'start') + T(130, 56, 'apply each command', 'pv-s', 'start') + T(130, 74, 'rules as data, not ifs', 'pv-s', 'start')); },
};
function speedChart(rows) {
  const N = 100000, ops = s => /2\^N|2\^n/.test(s) ? 1e15 : /N\^2|N²|n\^2|n²/.test(s) ? N * N : /N log N|n log n/.test(s) ? N * 17 : /log/.test(s) ? 17 : /O\(1\)/.test(s) ? 1 : N;
  const items = [['O(1)', 1], ['O(log N)', 17], ['O(N)', N], ['O(N log N)', N * 17], ['O(N²)', N * N]];
  let s = ''; const mx = Math.log10(N * N);
  items.forEach(([l, v], i) => { const w = Math.max(3, Math.log10(Math.max(1, v)) / mx * 200), y = 8 + i * 22; s += T(4, y + 12, l, 'pv-s', 'start') + '<rect x="90" y="' + y + '" width="' + w.toFixed(1) + '" height="14" rx="5" class="' + (v > 1e8 ? 'pv-neg' : 'pv-hi') + '"/>' + T(96 + w, y + 12, v >= 1e9 ? (v / 1e9) + 'B ops' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : v, 'pv-s', 'start'); });
  return svg(122, s + T(316, 118, 'at N = 100,000 (log scale)', 'pv-s', 'end'));
}
function latencyBars(L) {
  const mx = Math.log10(Math.max(...L.map(x => x.ns || 1)));
  return '<div class="latb">' + L.map(x => '<div class="lb"><span class="lb-l">' + x.op + '</span><span class="lb-bar"><i style="width:' + Math.max(2, Math.log10(Math.max(1, x.ns)) / mx * 100).toFixed(1) + '%"></i></span><span class="n">' + x.label + '</span></div>').join('') + '</div>';
}
function timeline(steps) {
  return '<div class="tl">' + steps.map((s, i) => '<div class="tl-seg c' + (i % 6) + '" style="flex:' + (parseFloat(s.minutes) || 1) + '" title="' + s.title + '"></div>').join('') + '</div>' +
    '<div class="facts">' + steps.map((s, i) => '<div class="fact"><div class="n"><i class="tl-dot c' + (i % 6) + '"></i>' + s.minutes + '</div><div class="t">' + s.title + '</div></div>').join('') + '</div>';
}
Object.assign(window.SHEET, { PICS, speedChart, latencyBars, timeline });
})();
