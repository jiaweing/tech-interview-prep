/* shadcn/ui-style controls for the whole app, without a framework.
   - Select: every native <select> gets a button trigger and a popover list with a check on the chosen item.
     The native select stays in the page (hidden) and still fires "change", so existing code keeps working.
   - Slider: range inputs show the filled part of the track (CSS reads --p).
   - Tooltip: any element with a title shows a small dark tooltip instead of the browser's.
   - UI.confirm(text, {ok, danger}) is an alert dialog that returns a promise of true or false.
   Checkboxes and number inputs are styled in CSS only. Loaded once, after the app's scripts. */
(() => {
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  /* ---------- select ---------- */
  let menu = null;
  function close(refocus) {
    if (!menu) return;
    const m = menu; menu = null;
    m.btn.setAttribute('aria-expanded', 'false'); m.el.remove();
    if (refocus) m.btn.focus();
  }
  function open(sel, btn) {
    if (menu && menu.btn === btn) { close(true); return; }
    close(false);
    const el = document.createElement('div'); el.className = 'ui-select-menu'; el.setAttribute('role', 'listbox');
    if (btn.getAttribute('aria-label')) el.setAttribute('aria-label', btn.getAttribute('aria-label'));
    Array.from(sel.options).forEach((o, i) => {
      const it = document.createElement('div'); it.className = 'ui-select-item'; it.setAttribute('role', 'option'); it.tabIndex = -1; it.dataset.i = i;
      it.setAttribute('aria-selected', String(i === sel.selectedIndex)); if (o.disabled) it.setAttribute('aria-disabled', 'true');
      const t = document.createElement('span'); t.textContent = o.textContent; it.appendChild(t); it.insertAdjacentHTML('beforeend', CHECK);
      el.appendChild(it);
    });
    document.body.appendChild(el);
    const r = btn.getBoundingClientRect(), h = Math.min(el.scrollHeight, 320), below = window.innerHeight - r.bottom;
    el.style.minWidth = r.width + 'px';
    el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - el.offsetWidth - 8)) + 'px';
    el.style.top = (below < h + 12 && r.top > below ? r.top - h - 4 : r.bottom + 4) + 'px';
    menu = { el, btn, sel }; btn.setAttribute('aria-expanded', 'true');
    const items = Array.from(el.children), pick = i => {
      if (i < 0 || items[i].getAttribute('aria-disabled')) return;
      if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
      close(true);
    };
    (items[sel.selectedIndex] || items[0] || el).focus();
    el.addEventListener('click', e => { const it = e.target.closest('.ui-select-item'); if (it) pick(+it.dataset.i); });
    el.addEventListener('keydown', e => {
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[i]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[0]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') close(false);
      else if (e.key.length === 1) { const k = e.key.toLowerCase(); const n = items.slice(i + 1).concat(items.slice(0, i + 1)).find(x => x.textContent.trim().toLowerCase().startsWith(k)); if (n) n.focus(); }
    });
  }
  function enhanceSelect(sel) {
    if (sel.dataset.ui || sel.multiple || sel.size > 1 || sel.closest('.ui-select')) return;
    sel.dataset.ui = '1';
    // the wrapper gets ui-for-<class> names, so code that looks up the select by its class still finds the select
    const wrap = document.createElement('span'); wrap.className = ['ui-select'].concat(Array.from(sel.classList).filter(c => c !== 'sel').map(c => 'ui-for-' + c)).join(' ');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ui-select-trigger';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    const lab = sel.getAttribute('aria-label') || (sel.labels && sel.labels[0] && sel.labels[0].textContent.trim()); if (lab) btn.setAttribute('aria-label', lab);
    const val = document.createElement('span'); val.className = 'ui-select-value'; btn.appendChild(val); btn.insertAdjacentHTML('beforeend', CHEV);
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel); wrap.appendChild(btn);
    sel.classList.add('ui-select-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const sync = () => { const o = sel.options[sel.selectedIndex]; val.textContent = o ? o.textContent : ''; btn.disabled = sel.disabled; };
    sync(); sel.addEventListener('change', sync);
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true });
    btn.addEventListener('click', () => open(sel, btn));
    btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(sel, btn); } });
  }
  document.addEventListener('mousedown', e => { if (menu && !menu.el.contains(e.target) && !menu.btn.contains(e.target)) close(false); }, true);
  window.addEventListener('scroll', e => { if (menu && !menu.el.contains(e.target)) close(false); }, true);
  window.addEventListener('resize', () => close(false));
  window.addEventListener('hashchange', () => close(false));

  /* ---------- slider ---------- */
  const fill = r => { const min = +r.min || 0, max = r.max === '' ? 100 : +r.max, v = +r.value; r.style.setProperty('--p', (max > min ? (v - min) / (max - min) * 100 : 0) + '%'); };
  document.addEventListener('input', e => { if (e.target.type === 'range') fill(e.target); }, true);

  /* ---------- tooltip ---------- */
  let tip = null, tipFor = null, tipTimer = 0;
  function hideTip() { clearTimeout(tipTimer); if (tip) tip.remove(); tip = null; tipFor = null; }
  function showTip(el) {
    const text = el.dataset.tip; if (!text) return;
    hideTip(); tipFor = el;
    tipTimer = setTimeout(() => {
      if (tipFor !== el || !el.isConnected) return;
      tip = document.createElement('div'); tip.className = 'ui-tooltip'; tip.setAttribute('role', 'tooltip'); tip.textContent = text;
      document.body.appendChild(tip);
      const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      const top = r.top - h - 8 < 4 ? r.bottom + 8 : r.top - h - 8;
      tip.style.top = top + 'px'; tip.style.left = Math.max(6, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 6)) + 'px';
    }, 350);
  }
  // move title into data-tip, keeping it as the accessible name or description
  function adoptTitle(el) {
    const t = el.getAttribute('title'); if (!t) return;
    el.dataset.tip = t; el.removeAttribute('title');
    if (!el.getAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', t);
    else if (!el.getAttribute('aria-label') && !el.getAttribute('aria-description')) el.setAttribute('aria-description', t);
  }
  document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('[title],[data-tip]'); if (!el || el === tipFor) return; adoptTitle(el); showTip(el); }, true);
  document.addEventListener('mouseout', e => { if (tipFor && (!e.relatedTarget || !tipFor.contains(e.relatedTarget))) hideTip(); }, true);
  document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[title],[data-tip]'); if (el && el.matches(':focus-visible')) { adoptTitle(el); showTip(el); } });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('mousedown', hideTip, true);
  window.addEventListener('scroll', hideTip, true);

  /* ---------- alert dialog ---------- */
  function confirmDialog(text, o) {
    o = o || {};
    return new Promise(res => {
      const d = document.createElement('dialog'); d.className = 'ui-alert';
      d.innerHTML = '<form method="dialog"><h2></h2>' + (o.detail ? '<p></p>' : '') + '<div class="ui-alert-row"><button value="no" class="btn small">' + (o.cancel || 'Cancel') + '</button><button value="yes" class="btn small ' + (o.danger ? 'ui-danger' : 'primary') + '">' + (o.ok || 'Continue') + '</button></div></form>';
      d.querySelector('h2').textContent = text; if (o.detail) d.querySelector('p').textContent = o.detail;
      d.addEventListener('close', () => { res(d.returnValue === 'yes'); d.remove(); });
      document.body.appendChild(d); d.showModal(); d.querySelector('[value=no]').focus();
    });
  }

  /* ---------- phones: Ask Claude sits in the bottom icon bar instead of floating ---------- */
  const fab = document.getElementById('aiFab'), home = fab && fab.parentNode, phone = window.matchMedia('(max-width: 560px)');
  function placeFab() {
    const bar = document.querySelector('.topbar .tb-in'); if (!fab || !bar) return;
    if (phone.matches) { if (fab.parentNode !== bar) bar.appendChild(fab); fab.classList.add('in-bar'); fab.dataset.tip = 'Ask Claude'; }
    else if (fab.parentNode !== home) { home.appendChild(fab); fab.classList.remove('in-bar'); delete fab.dataset.tip; }
  }
  if (fab) { placeFab(); phone.addEventListener('change', placeFab); }

  /* ---------- apply to everything, now and as pages render ---------- */
  function scan(root) {
    if (!root.querySelectorAll) return;
    if (root.tagName === 'SELECT') enhanceSelect(root);
    root.querySelectorAll('select').forEach(enhanceSelect);
    if (root.type === 'range') fill(root);
    root.querySelectorAll('input[type=range]').forEach(fill);
  }
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) scan(n); }))).observe(document.documentElement, { childList: true, subtree: true });
  scan(document.body || document.documentElement);
  window.UI = { confirm: confirmDialog, enhanceSelect };
})();
