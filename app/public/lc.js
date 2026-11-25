/* LeetCode list (#leetcode): every LeetCode problem as a link (title, difficulty, topics, acceptance),
   and a curated core list grouped by pattern. Statements stay on LeetCode. Ticks are kept in this browser.
   Runs inside the main IIFE (uses esc, store, YT_ICON). */
const LCI = (() => {
  const D = window.LC_DATA || { rows: [], tags: [], core: [], patterns: [] };
  const DIFF = ['Easy', 'Medium', 'Hard'];
  const bySlug = {}; D.rows.forEach(r => { bySlug[r[2]] = r; });
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
  const done = () => store.get('lcDone', {});
  const st = { view: store.get('lcView', 'core'), q: '', diff: -1, pat: -1, hidePaid: store.get('lcHidePaid', false), hideDone: false, shown: 100 };

  function row(r, d) {
    const [id, title, slug, diff, paid, tags, ac] = r;
    const tagTxt = tags.slice(0, 3).map(i => D.tags[i].replace(/-/g, ' ')).join(' · ');
    const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('leetcode ' + id + ' ' + title + ' neetcode');
    return '<div class="lcr' + (d[slug] ? ' is-done' : '') + '">' +
      '<button type="button" class="sdot lc-tick' + (d[slug] ? ' solved' : '') + '" data-slug="' + esc(slug) + '" aria-pressed="' + !!d[slug] + '" aria-label="Mark ' + esc(title) + ' done">' + (d[slug] ? '✓' : '') + '</button>' +
      '<span class="lc-id">' + esc(id) + '</span>' +
      '<a class="lc-t" href="https://leetcode.com/problems/' + esc(slug) + '/" target="_blank" rel="noopener noreferrer">' + esc(title) + (paid ? '<span class="lc-lock" title="LeetCode Premium">' + LOCK + '</span>' : '') + '</a>' +
      '<span class="lc-tags">' + esc(tagTxt) + '</span>' +
      '<span class="lvl ' + DIFF[diff].toLowerCase() + '">' + DIFF[diff] + '</span>' +
      '<span class="lc-ac" title="Acceptance rate">' + ac + '%</span>' +
      '<a class="yt-btn" href="' + yt + '" target="_blank" rel="noopener noreferrer" title="Find a video walkthrough">' + YT_ICON + '</a>' +
      '</div>';
  }
  function matches(r, d) {
    if (st.hidePaid && r[4]) return false;
    if (st.hideDone && d[r[2]]) return false;
    if (st.diff >= 0 && r[3] !== st.diff) return false;
    if (st.pat >= 0 && !D.patterns[st.pat].tags.some(t => r[5].includes(t))) return false;
    if (st.q) { const q = st.q.toLowerCase(); if (!(r[1].toLowerCase().includes(q) || String(r[0]) === q || r[2].includes(q.replace(/\s+/g, '-')))) return false; }
    return true;
  }
  function coreHTML(d) {
    return D.core.map(g => {
      const rs = g.slugs.map(s => bySlug[s]).filter(r => r && matches(r, d));
      if (!rs.length) return '';
      const n = g.slugs.filter(s => d[s]).length;
      return '<section class="lc-grp"><div class="lc-gh"><h2>' + esc(g.name) + '</h2><span class="muted">' + n + ' of ' + g.slugs.length + '</span>' +
        (g.ex ? '<a class="chip lc-learn" href="#x-' + esc(g.ex) + '">Learn the pattern</a>' : '') + '</div>' +
        '<div class="lc-list">' + rs.map(r => row(r, d)).join('') + '</div></section>';
    }).join('') || '<p class="muted lc-none">Nothing matches.</p>';
  }
  function allHTML(d) {
    const rs = D.rows.filter(r => matches(r, d));
    const pat = st.pat >= 0 ? D.patterns[st.pat] : null;
    return '<div class="lc-gh"><span class="muted">' + rs.length.toLocaleString() + ' problems</span>' +
      (pat && pat.ex ? '<a class="chip lc-learn" href="#x-' + esc(pat.ex) + '">Learn ' + esc(pat.name.toLowerCase()) + '</a>' : '') + '</div>' +
      '<div class="lc-list">' + rs.slice(0, st.shown).map(r => row(r, d)).join('') + '</div>' +
      (rs.length > st.shown ? '<button type="button" class="btn small lc-more">Show ' + Math.min(100, rs.length - st.shown) + ' more</button>' : '');
  }
  function render(page) {
    const coreN = D.core.reduce((a, g) => a + g.slugs.length, 0);
    page.innerHTML = '<header class="lc-head"><h1>LeetCode list</h1><p class="muted">' + coreN + ' core problems by pattern, and all ' + D.rows.length.toLocaleString() + ' LeetCode problems. Each opens on LeetCode; your ticks stay in this browser.</p>' +
      '<div class="lc-prog"><div class="lc-bar"><i></i></div><span></span></div></header>' +
      '<div class="lc-tools">' +
        '<div class="seg" role="tablist"><button type="button" role="tab" data-v="core">Core ' + coreN + '</button><button type="button" role="tab" data-v="all">All ' + D.rows.length.toLocaleString() + '</button></div>' +
        '<input type="search" class="lc-q" placeholder="Search by name or number" aria-label="Search problems">' +
        '<div class="lc-chips" aria-label="Difficulty">' + DIFF.map((x, i) => '<button type="button" class="chip" data-d="' + i + '">' + x + '</button>').join('') + '</div>' +
        '<label class="lc-chk"><input type="checkbox" class="lc-paid"> Hide Premium</label><label class="lc-chk"><input type="checkbox" class="lc-hd"> Hide done</label>' +
      '</div>' +
      '<div class="lc-chips lc-pats" aria-label="Pattern">' + D.patterns.map((p, i) => '<button type="button" class="chip" data-p="' + i + '">' + esc(p.name) + '</button>').join('') + '</div>' +
      '<div class="lc-body"></div>' +
      '<p class="muted lc-src">Titles, links, difficulty, topics and acceptance come from LeetCode\'s public problem list. Problem statements are not copied here.</p>';
    const body = page.querySelector('.lc-body');
    const paint = () => {
      const d = done();
      page.querySelectorAll('.seg [data-v]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === st.view)));
      page.querySelectorAll('[data-d]').forEach(b => b.classList.toggle('on', +b.dataset.d === st.diff));
      page.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', +b.dataset.p === st.pat));
      body.innerHTML = st.view === 'core' ? coreHTML(d) : allHTML(d);
      const coreDone = D.core.reduce((a, g) => a + g.slugs.filter(s => d[s]).length, 0), all = Object.keys(d).length;
      page.querySelector('.lc-bar i').style.width = (100 * coreDone / coreN).toFixed(1) + '%';
      page.querySelector('.lc-prog span').textContent = coreDone + ' of ' + coreN + ' core done' + (all > coreDone ? ' · ' + all + ' in all' : '');
    };
    page.querySelector('.lc-paid').checked = st.hidePaid;
    page.querySelector('.lc-q').addEventListener('input', e => { st.q = e.target.value.trim(); st.shown = 100; paint(); });
    page.addEventListener('change', e => {
      if (e.target.classList.contains('lc-paid')) { st.hidePaid = e.target.checked; store.set('lcHidePaid', st.hidePaid); paint(); }
      if (e.target.classList.contains('lc-hd')) { st.hideDone = e.target.checked; paint(); }
    });
    page.addEventListener('click', e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.v) { st.view = t.dataset.v; st.shown = 100; store.set('lcView', st.view); paint(); }
      else if (t.dataset.d != null) { st.diff = st.diff === +t.dataset.d ? -1 : +t.dataset.d; st.shown = 100; paint(); }
      else if (t.dataset.p != null) { st.pat = st.pat === +t.dataset.p ? -1 : +t.dataset.p; st.shown = 100; paint(); }
      else if (t.classList.contains('lc-more')) { st.shown += 100; paint(); }
      else if (t.classList.contains('lc-tick')) {
        const d = done(), s = t.dataset.slug;
        if (d[s]) delete d[s]; else d[s] = Date.now();
        store.set('lcDone', d);
        if (!d[s]) { paint(); return; }
        try { APP10K.xp(5, 'LeetCode problem'); } catch (er) { /* no xp */ }
        paint();
      }
    });
    paint();
  }
  return { render, count: () => D.rows.length };
})();
