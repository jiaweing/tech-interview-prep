/* realm switcher: Live coding <-> System design */
(() => {
  const btn = $('#realmBtn'), menu = $('#realmMenu'); if (!btn || !menu) return;
  const opts = () => $$('.realm-opt', menu);
  const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); const cur = opts().find(o => o.getAttribute('aria-selected') === 'true') || opts()[0]; cur.focus(); };
  const close = refocus => { if (menu.hidden) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); };
  const pick = r => {
    close(true);
    const cur = document.body.dataset.realm;
    const home = { sd: 'sd', dd: 'dd', al: 'al', ex: 'ex-py' }[r] || 'home';
    store.set('realm', r);
    if (location.hash === '#' + home) route(); else location.hash = home;
  };
  btn.onclick = e => { e.stopPropagation(); if (menu.hidden) open(); else close(true); };
  menu.onclick = e => { const o = e.target.closest('.realm-opt'); if (o) pick(o.dataset.realm); };
  menu.onkeydown = e => {
    const L = opts(), i = L.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { L[(i + 1) % L.length].focus(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { L[(i - 1 + L.length) % L.length].focus(); e.preventDefault(); }
    else if (e.key === 'Escape') close(true);
    else if (e.key === 'Tab') close(false);
  };
  document.addEventListener('click', e => { if (!e.target.closest('#realm')) close(false); });
  window.addEventListener('hashchange', () => close(false));
})();
