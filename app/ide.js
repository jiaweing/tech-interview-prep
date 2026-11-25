/* Problem pages as a full-page coding interview IDE. Three panels (Question, Code, Console) sit in three slots:
   a = the full-height column, b = top of the other column, c = bottom of the other column.
   Drag a panel's grip onto another panel to swap them; drag the dividers to resize. Runs inside the main IIFE. */
const IDE = (() => {
  const wideEnough = () => window.matchMedia('(min-width: 1000px)').matches;
  const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
  const NAMES = { q: 'Question', code: 'Code', out: 'Console' };
  const DEF = { left: 40, out: 36, flip: false, order: ['q', 'code', 'out'] };
  function drag(handle, onMove, onEnd, onDown) {
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); handle.setPointerCapture(e.pointerId); document.body.classList.add('ide-dragging');
      if (onDown) onDown(e);
      const move = ev => onMove(ev);
      const up = ev => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); document.body.classList.remove('ide-dragging'); onEnd(ev); };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    });
  }
  function mount(page, h) {
    document.body.classList.remove('ide-on');
    if (!h.startsWith('p-') || page.classList.contains('exam')) return;
    const split = $('.split', page), left = $('.left', page), right = $('.right', page), bench = $('.bench', page), ed = bench && $('.ed', bench);
    if (!split || !left || !right || !bench || !ed || !wideEnough()) return;
    document.body.classList.add('ide-on'); page.classList.add('ide');
    const head = $('.prob-head', page), h1 = $('h1', page);
    if (head && h1) { h1.classList.add('ide-title'); head.appendChild(h1); }
    // console panel collects the run output, the trace and the hidden-test check
    const out = document.createElement('div'); out.className = 'ide-out';
    out.innerHTML = '<div class="ide-out-h"><b>Console</b><span class="muted">Run shows the examples; Submit runs the hidden tests</span></div>';
    const body = document.createElement('div'); body.className = 'ide-out-b'; out.appendChild(body);
    ['.results', '.trace-host', '.hidden-panel'].forEach(sel => { const el = $(sel, bench); if (el) body.appendChild(el); });
    const vt = document.createElement('div'); vt.className = 'ide-vt'; vt.setAttribute('role', 'separator'); vt.setAttribute('aria-label', 'Resize columns'); vt.title = 'Drag to resize · double-click to reset';
    const hz = document.createElement('div'); hz.className = 'ide-hz'; hz.setAttribute('role', 'separator'); hz.setAttribute('aria-label', 'Resize rows'); hz.title = 'Drag to resize · double-click to reset';
    bench.appendChild(out); bench.appendChild(hz); split.insertBefore(vt, right);
    // the three movable panels
    const P = { q: left, code: ed, out };
    Object.keys(P).forEach(k => {
      const el = P[k]; el.dataset.ide = k; el.classList.add('ide-panel');
      const g = document.createElement('button'); g.type = 'button'; g.className = 'ide-grip'; g.innerHTML = GRIP;
      g.title = 'Drag onto another panel to swap'; g.setAttribute('aria-label', 'Move the ' + NAMES[k] + ' panel. Drag onto another panel, or press Enter to move it to the next slot');
      const mx = document.createElement('button'); mx.type = 'button'; mx.className = 'ide-max'; mx.dataset.k = k;
      const tools = document.createElement('div'); tools.className = 'ide-tools'; tools.appendChild(mx); tools.appendChild(g);
      el.appendChild(tools);
    });
    let maxed = null, autoOut = null;
    const pref = Object.assign({}, DEF, store.get('idePref', {}));
    if (!Array.isArray(pref.order) || pref.order.slice().sort().join() !== 'code,out,q') pref.order = DEF.order.slice();
    const save = () => store.set('idePref', pref);
    const apply = () => {
      split.style.setProperty('--ide-left', pref.left + '%');
      split.style.setProperty('--ide-out', (autoOut != null ? Math.max(pref.out, autoOut) : pref.out) + '%');
      split.classList.toggle('flip', !!pref.flip);
      split.classList.toggle('maxed', !!maxed);
      pref.order.forEach((k, i) => { P[k].style.gridArea = maxed === k ? '1 / 1 / -1 / -1' : 'abc'[i]; P[k].classList.toggle('ide-hidden', !!maxed && maxed !== k); });
      Object.keys(P).forEach(k => { const b = $('.ide-max', P[k]); const on = maxed === k; b.innerHTML = on ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>'; b.title = on ? 'Restore the layout (Esc)' : 'Fill the workspace with ' + NAMES[k]; b.setAttribute('aria-label', b.title); b.setAttribute('aria-pressed', String(on)); });
      if (bench.cm) bench.cm.refresh();
    };
    apply();
    // resize: the column divider moves with the full-height slot, the row divider sizes slot c
    drag(vt, e => { const r = split.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width * 100; if (pref.flip) x = 100 - x; pref.left = Math.max(22, Math.min(70, x)); apply(); }, save);
    drag(hz, e => { const r = split.getBoundingClientRect(); pref.out = Math.max(12, Math.min(75, (r.bottom - e.clientY) / r.height * 100)); apply(); }, save);
    vt.ondblclick = () => { pref.left = DEF.left; apply(); save(); };
    hz.ondblclick = () => { pref.out = DEF.out; apply(); save(); };
    // maximize: one panel fills the workspace; Esc or the same button restores
    split.addEventListener('click', e => { const b = e.target.closest('.ide-max'); if (!b) return; maxed = maxed === b.dataset.k ? null : b.dataset.k; apply(); });
    const onEsc = e => { if (e.key === 'Escape' && maxed) { maxed = null; apply(); } };
    document.addEventListener('keydown', onEsc);
    // the console grows while the step-through visualizer is open, then shrinks back
    const th = $('.trace-host', body);
    if (th) new MutationObserver(() => { autoOut = th.children.length ? 62 : null; apply(); }).observe(th, { childList: true });
    // swap: drag a grip onto another panel; Enter rotates it to the next slot
    const swap = (a, b) => { const o = pref.order, i = o.indexOf(a), j = o.indexOf(b); if (i < 0 || j < 0 || i === j) return; [o[i], o[j]] = [o[j], o[i]]; apply(); save(); };
    Object.keys(P).forEach(k => {
      const g = $('.ide-grip', P[k]);
      let target = null;
      const mark = el => { $$('.ide-panel.drop', split).forEach(x => x.classList.remove('drop')); if (el) el.classList.add('drop'); };
      drag(g, e => {
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const t = under && under.closest('.ide-panel');
        target = t && t !== P[k] ? t : null; mark(target);
      }, () => { mark(null); P[k].classList.remove('lift'); if (target) swap(k, target.dataset.ide); target = null; }, () => { P[k].classList.add('lift'); });
      g.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault(); const o = pref.order, i = o.indexOf(k); swap(k, o[(i + 1) % 3]); g.focus();
      });
    });
    // a "Swap sides" toggle in the header mirrors the layout
    if (head) {
      const sb = document.createElement('button'); sb.type = 'button'; sb.className = 'btn small ghost ide-flip'; sb.textContent = 'Swap sides';
      const rs = document.createElement('button'); rs.type = 'button'; rs.className = 'btn small ghost ide-reset'; rs.textContent = 'Reset layout';
      sb.onclick = () => { pref.flip = !pref.flip; apply(); save(); };
      rs.onclick = () => { Object.assign(pref, DEF, { order: DEF.order.slice() }); maxed = null; apply(); save(); };
      const fb = document.createElement('button'); fb.type = 'button'; fb.className = 'btn small ghost ide-hidehead';
      const paintF = () => { document.body.classList.toggle('ide-focus', !!pref.focus); fb.textContent = pref.focus ? 'Show header' : 'Hide header'; fb.setAttribute('aria-pressed', String(!!pref.focus)); };
      fb.onclick = () => { pref.focus = !pref.focus; save(); paintF(); requestAnimationFrame(fit); };
      paintF();
      const sp = document.createElement('span'); sp.className = 'ide-sp';
      head.appendChild(sp); head.appendChild(fb); head.appendChild(sb); head.appendChild(rs);
    }
    const fit = () => { page.style.height = Math.max(420, window.innerHeight - page.getBoundingClientRect().top - 12) + 'px'; if (bench.cm) bench.cm.refresh(); };
    if (bench.cm) bench.cm.setSize(null, '100%');
    fit(); setTimeout(fit, 0); window.addEventListener('resize', fit);
    cleanup.push(() => { window.removeEventListener('resize', fit); document.removeEventListener('keydown', onEsc); document.body.classList.remove('ide-on', 'ide-focus'); });
    new MutationObserver(() => { body.scrollTop = 0; }).observe($('.results', body) || body, { childList: true });
  }
  return { mount };
})();
