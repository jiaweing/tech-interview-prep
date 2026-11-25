/* Companies (#co, #co-<id>): company packs. Each pack is a JSON file in public/packs/ with the rounds,
   timings, reported questions and the public sources they came from. A question is one of:
   {problem: id} a problem in this app, {lc: slug} a LeetCode problem, or {title} anything else
   (a design prompt, a practical task). Picking a pack makes it the active one: the mock interviewer then
   plays that company's round. Runs inside the main IIFE (uses esc, store, prog, probById). */
const CO = (() => {
  const PACKS = (window.PACKS || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const byId = id => PACKS.find(p => p.id === id);
  const KIND = { coding: 'Coding', design: 'System design', behavioural: 'Behavioural' };
  const TAG = { reported: 'Reported', inspired: 'Based on a report', domain: 'Practice in their domain', listed: 'Prep-site list' };
  const ROUND = { oa: 'Online assessment', live: 'Live / pair programming', 'take-home': 'Take-home' };
  const DIFF = ['Easy', 'Medium', 'Hard'];
  const LC = {}; ((window.LC_DATA || {}).rows || []).forEach(r => { LC[r[2]] = r; });
  const active = () => byId(store.get('pack', '')) || null;
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  const srcLink = u => /^https:\/\//.test(u || '') ? '<a class="co-srcl" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" title="Where this was reported">' + esc(host(u)) + '</a>' : '';
  let query = '';

  function index(page) {
    const a = active();
    page.innerHTML = '<header class="co-head"><h1>Companies</h1><p class="muted">' + PACKS.length + ' companies: the rounds candidates report and the questions they were asked, each with its source. Pick one and the mock interviewer plays that company\'s round. Without one, it runs a standard interview.</p>' +
      '<input type="search" class="lc-q co-q" placeholder="Search companies" aria-label="Search companies"></header><div class="co-grid"></div>';
    const grid = page.querySelector('.co-grid'), q = page.querySelector('.co-q');
    const paint = () => {
      const s = query.toLowerCase();
      grid.innerHTML = PACKS.filter(p => !s || (p.name + ' ' + (p.role || '')).toLowerCase().includes(s)).map(p => {
        const n = (p.reported || []).length, mins = p.rounds.map(r => r.minutes).filter(Boolean);
        return '<a class="co-card' + (a && a.id === p.id ? ' on' : '') + '" href="#co-' + esc(p.id) + '"><b>' + esc(p.name) + '</b><span class="muted">' + esc(p.role || '') + '</span>' +
          '<span class="co-meta">' + p.rounds.length + ' round' + (p.rounds.length === 1 ? '' : 's') + (mins.length ? ' · ' + (Math.min(...mins) === Math.max(...mins) ? mins[0] : Math.min(...mins) + '-' + Math.max(...mins)) + ' min' : '') + (n ? ' · ' + n + ' questions' : '') + '</span>' +
          (a && a.id === p.id ? '<span class="co-on">Active</span>' : '') + '</a>';
      }).join('') + (s ? '' : '<div class="co-card co-add"><b>Add a company</b><span class="muted">A pack is one JSON file: rounds, timings, reported questions and sources. See <code>app/public/packs/</code> in the repository.</span></div>');
    };
    q.value = query; q.addEventListener('input', () => { query = q.value.trim(); paint(); });
    paint();
  }

  function row(r) {
    const s = prog.solved(), tag = '<span class="sd-pill co-tag ' + esc(r.tag || '') + '">' + esc(TAG[r.tag] || r.tag || '') + '</span>';
    const note = '<span class="co-note">' + esc(r.note || '') + (r.note && r.source ? ' · ' : '') + srcLink(r.source) + '</span>';
    if (r.problem && probById[r.problem]) {
      const P = probById[r.problem];
      return '<div class="prow co-row"><span class="sdot ' + (s[P.id] ? 'solved' : '') + '">' + (s[P.id] ? '✓' : '') + '</span><span class="ttl"><a href="#p-' + esc(P.id) + '">' + esc(P.title) + '</a> ' + tag + note + '</span><span class="lvl ' + esc(P.level) + '">' + esc(P.level) + '</span></div>';
    }
    if (r.lc && LC[r.lc]) {
      const L = LC[r.lc], d = store.get('lcDone', {});
      return '<div class="prow co-row"><span class="sdot ' + (d[r.lc] ? 'solved' : '') + '">' + (d[r.lc] ? '✓' : '') + '</span><span class="ttl"><a href="https://leetcode.com/problems/' + esc(r.lc) + '/" target="_blank" rel="noopener noreferrer">' + esc(L[0]) + '. ' + esc(L[1]) + '</a> ' + tag + note + '</span><span class="lvl ' + DIFF[L[3]].toLowerCase() + '">' + DIFF[L[3]] + '</span></div>';
    }
    if (r.title) return '<div class="prow co-row"><span class="sdot"></span><span class="ttl">' + esc(r.title) + ' ' + tag + note + '</span><span></span></div>';
    return '';
  }

  function pack(page, P) {
    const a = active(), on = a && a.id === P.id, rep = P.reported || [];
    const isCode = r => r.problem || r.lc;
    const groups = P.problems_from === 'govtech'
      ? ['live', 'oa', 'take-home'].map(k => [ROUND[k], rep.filter(r => r.round === k)])
      : [['Coding questions candidates report', rep.filter(r => isCode(r) && r.tag === 'reported')], ['Other questions candidates report', rep.filter(r => !isCode(r) && r.tag === 'reported')], ['On prep-site lists', rep.filter(r => r.tag !== 'reported')]];
    page.innerHTML = '<div class="prob-head"><a href="#co" class="btn small ghost">← Companies</a></div>' +
      '<header class="co-head"><h1>' + esc(P.name) + '</h1><p class="muted">' + esc(P.summary || '') + '</p>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn small ' + (on ? '' : 'primary') + ' co-pick">' + (on ? 'Active: the mock interviewer plays ' + esc(P.name) : 'Practise for ' + esc(P.name)) + '</button>' + (on ? '<button type="button" class="btn small ghost co-clear">Use a standard interview</button>' : '') +
      (rep.some(r => r.lc) ? '<a class="btn small ghost" href="#leetcode" data-co="' + esc(P.id) + '">Their LeetCode questions</a>' : '') + '</div></header>' +
      '<section class="gt-sec"><div class="day-h"><h2>Rounds</h2></div><div class="gt-flow">' + P.rounds.map(r =>
        '<a href="#' + esc(r.practice || 'problems') + '"><i>' + esc(KIND[r.kind] || '') + (r.minutes ? ' · ' + r.minutes + ' min' : '') + '</i><b>' + esc(r.name) + '</b><span>' + esc(r.what || '') + '</span></a>').join('') + '</div></section>' +
      ((P.tips || []).length ? '<section class="sd-sec"><div class="day-h"><h2>What helps</h2></div><ul class="sd-list ok co-tips">' + P.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></section>' : '') +
      groups.filter(g => g[1].length).map(([t, rows]) => '<section class="sd-sec"><div class="day-h"><h2>' + esc(t) + '</h2><span class="muted">' + rows.length + '</span></div><div class="plist">' + rows.map(row).join('') + '</div></section>').join('') +
      '<section class="sd-sec co-src"><div class="day-h"><h2>Sources</h2></div><ul>' + (P.sources || []).map(s => '<li>' + (/^https:\/\//.test(s.url || '') ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>' : esc(s.label)) + '</li>').join('') + '</ul>' +
      (P.caveat ? '<p class="muted">' + esc(P.caveat) + '</p>' : '') + '</section>';
    page.querySelector('.co-pick').onclick = () => { store.set('pack', P.id); try { APP10K.toast(P.name + ' is now the active company', 'ok'); } catch (e) { /* no toast */ } pack(page, P); };
    const c = page.querySelector('.co-clear'); if (c) c.onclick = () => { store.set('pack', ''); pack(page, P); };
    const lk = page.querySelector('[data-co]'); if (lk) lk.onclick = () => { store.set('lcCo', P.id); store.set('lcView', 'all'); };
  }

  function render(page, h) {
    const P = h.startsWith('co-') ? byId(h.slice(3)) : null;
    if (P) pack(page, P); else index(page);
  }
  // the active company's round of one kind, for the mock interviewer
  function round(kind) {
    const P = active(); if (!P) return null;
    const r = P.rounds.find(x => x.kind === kind); if (!r) return null;
    return { company: P.name, name: r.name, minutes: r.minutes, what: r.what };
  }
  // LeetCode slug -> ids of companies whose candidates report it
  const bySlug = {};
  PACKS.forEach(p => (p.reported || []).forEach(r => { if (r.lc) { const L = bySlug[r.lc] = bySlug[r.lc] || []; if (!L.includes(p.id)) L.push(p.id); } }));
  return { render, round, active, packs: PACKS, byId, companiesFor: slug => bySlug[slug] || [] };
})();
window.CO = CO;
