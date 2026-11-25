/* Companies (#co, #co-<id>): company packs. Each pack is a JSON file in public/packs/ with the rounds,
   timings, reported tasks (linked to problems here) and the public sources they came from.
   Picking a pack makes it the active one: the mock interviewer then plays that company's round.
   Runs inside the main IIFE (uses esc, store, prog, probById). */
const CO = (() => {
  const PACKS = window.PACKS || [];
  const byId = id => PACKS.find(p => p.id === id);
  const KIND = { coding: 'Coding', design: 'System design', behavioural: 'Behavioural' };
  const TAG = { reported: 'Reported', inspired: 'Based on a report', domain: 'Practice in their domain', listed: 'Listed by a prep site' };
  const ROUND = { oa: 'Online assessment', live: 'Live / pair programming', 'take-home': 'Take-home' };
  const active = () => byId(store.get('pack', '')) || null;

  function index(page) {
    const a = active();
    page.innerHTML = '<header class="co-head"><h1>Companies</h1><p class="muted">Pick a company to see its rounds and the tasks candidates report. The mock interviewer then plays that company\'s round. Without one, it runs a standard interview.</p></header>' +
      '<div class="co-grid">' + PACKS.map(p => {
        const n = (p.reported || []).length, mins = p.rounds.map(r => r.minutes).filter(Boolean);
        return '<a class="co-card' + (a && a.id === p.id ? ' on' : '') + '" href="#co-' + esc(p.id) + '"><b>' + esc(p.name) + '</b><span class="muted">' + esc(p.role || '') + '</span>' +
          '<span class="co-meta">' + p.rounds.length + ' round' + (p.rounds.length === 1 ? '' : 's') + (mins.length ? ' · ' + (Math.min(...mins) === Math.max(...mins) ? mins[0] : Math.min(...mins) + '-' + Math.max(...mins)) + ' min' : '') + (n ? ' · ' + n + ' reported tasks' : '') + '</span>' +
          (a && a.id === p.id ? '<span class="co-on">Active</span>' : '') + '</a>';
      }).join('') +
      '<div class="co-card co-add"><b>Add a company</b><span class="muted">A pack is one JSON file: rounds, timings, reported tasks and sources. See <code>public/packs/</code> in the repository.</span></div></div>';
  }

  function list(rows) {
    const s = prog.solved();
    return '<div class="plist">' + rows.map(r => {
      const P = probById[r.problem]; if (!P) return '';
      return '<a class="prow" href="#p-' + esc(P.id) + '"><span class="sdot ' + (s[P.id] ? 'solved' : '') + '">' + (s[P.id] ? '✓' : '') + '</span><span class="ttl">' + esc(P.title) +
        ' <span class="sd-pill" style="margin-left:6px">' + esc(TAG[r.tag] || r.tag || '') + '</span><span class="co-note">' + esc(r.note || '') + '</span></span><span class="lvl ' + esc(P.level) + '">' + esc(P.level) + '</span></a>';
    }).join('') + '</div>';
  }

  function pack(page, P) {
    const a = active(), on = a && a.id === P.id;
    const rep = P.reported || [];
    const groups = P.problems_from === 'govtech'
      ? ['live', 'oa', 'take-home'].map(k => [ROUND[k], rep.filter(r => r.round === k)])
      : [['Reported by candidates', rep.filter(r => r.tag === 'reported')], ['Listed by prep sites', rep.filter(r => r.tag !== 'reported')]];
    page.innerHTML = '<div class="prob-head"><a href="#co" class="btn small ghost">← Companies</a></div>' +
      '<header class="co-head"><h1>' + esc(P.name) + '</h1><p class="muted">' + esc(P.summary || '') + '</p>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn small ' + (on ? '' : 'primary') + ' co-pick">' + (on ? 'Active: the mock interviewer plays ' + esc(P.name) : 'Practise for ' + esc(P.name)) + '</button>' + (on ? '<button type="button" class="btn small ghost co-clear">Use a standard interview</button>' : '') + '</div></header>' +
      '<section class="gt-sec"><div class="day-h"><h2>Rounds</h2></div><div class="gt-flow">' + P.rounds.map(r =>
        '<a href="#' + esc(r.practice || 'problems') + '"><i>' + esc(KIND[r.kind] || '') + (r.minutes ? ' · ' + r.minutes + ' min' : '') + '</i><b>' + esc(r.name) + '</b><span>' + esc(r.what || '') + '</span></a>').join('') + '</div></section>' +
      ((P.tips || []).length ? '<section class="sd-sec"><div class="day-h"><h2>What helps</h2></div><ul class="sd-list ok co-tips">' + P.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></section>' : '') +
      groups.filter(g => g[1].length).map(([t, rows]) => '<section class="sd-sec"><div class="day-h"><h2>' + esc(t) + '</h2><span class="muted">' + rows.length + '</span></div>' + list(rows) + '</section>').join('') +
      '<section class="sd-sec co-src"><div class="day-h"><h2>Sources</h2></div><ul>' + (P.sources || []).map(s => '<li>' + (/^https:\/\//.test(s.url || '') ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>' : esc(s.label)) + '</li>').join('') + '</ul>' +
      (P.caveat ? '<p class="muted">' + esc(P.caveat) + '</p>' : '') + '</section>';
    page.querySelector('.co-pick').onclick = () => { store.set('pack', P.id); try { APP10K.toast(P.name + ' is now the active company', 'ok'); } catch (e) { /* no toast */ } pack(page, P); };
    const c = page.querySelector('.co-clear'); if (c) c.onclick = () => { store.set('pack', ''); pack(page, P); };
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
  return { render, round, active, packs: PACKS };
})();
window.CO = CO;
