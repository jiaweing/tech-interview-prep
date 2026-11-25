/* AppLovin "short code" realm: resume-based and fundamentals coding problems. */
(function () {
'use strict';
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const solvedMap = () => { try { return JSON.parse(localStorage.getItem('pg:solved') || '{}') || {}; } catch (e) { return {}; } };
// Where each question was reported. c = a candidate's own report; g = listed by a prep site (unverified).
const REPORTED = {
  'two-sum': ['Final round, Oct 2026', 'c', 'LC 1 Two Sum'],
  'cycle-start': ['SWE I screen, Apr 2025', 'c', 'LC 142 Floyd cycle'],
  'lru-cache': ['Candidate report', 'c'],
  'longest-unique-substring': ['Candidate report', 'c'],
  'number-of-islands': ['Intern screen', 'c'],
  'anagram-queries': ['Phone screen, 2023', 'c'],
  'count-invalid-bst-nodes': ['SWE, Nov 2025', 'c'],
  'backspace-compare': ['SWE question bank', 'c', 'LC 844'],
  'min-window-substring': ['Flagged as likely', 'g'],
  'ad-ctr-window': ['Coding take on a 2026 design prompt', 'g'],
  'valid-bst': ['Prep guide', 'g'],
  'tree-level-order': ['Prep guide', 'g'],
  'grid-shortest-path': ['Prep guides', 'g', 'LC 1091'],
  'anagram-groups': ['Prep guide', 'g'],
  'targeting-intersect': ['Prep guide, ad targeting', 'g'],
  'fibonacci-mod': ['Prep guide', 'g']
};
const EXTRA = ['balanced-brackets', 'anagram-groups', 'merge-intervals', 'longest-unique-substring', 'pair-sum-count', 'first-unique-char', 'rate-limiter-log', 'moving-average'];
function list(P, pill) {
  const s = solvedMap();
  pill = pill || (p => p.al && p.al.from);
  return '<div class="plist">' + P.map(p => '<a class="prow" href="#p-' + p.id + '"><span class="sdot ' + (s[p.id] ? 'solved' : '') + '">' + (s[p.id] ? '✓' : '') + '</span><span class="ttl">' + esc(p.title) + (pill(p) ? ' <span class="sd-pill" style="margin-left:6px">' + esc(pill(p)) + '</span>' : '') + '</span><span class="lvl ' + p.level + '">' + p.level + '</span></a>').join('') + '</div>';
}
function groups(PROBLEMS) {
  const byId = id => PROBLEMS.find(p => p.id === id);
  const rep = Object.keys(REPORTED).map(byId).filter(Boolean);
  const seen = new Set(rep.map(p => p.id));
  const R = PROBLEMS.filter(p => p.al && p.al.kind === 'resume');
  const F = PROBLEMS.filter(p => p.al && p.al.kind === 'fundamentals' && !seen.has(p.id)).concat(EXTRA.map(byId).filter(p => p && !seen.has(p.id)));
  const repPill = p => (REPORTED[p.id][2] ? REPORTED[p.id][2] + ' · ' : '') + REPORTED[p.id][0];
  return { R, F, cand: rep.filter(p => REPORTED[p.id][1] === 'c'), guide: rep.filter(p => REPORTED[p.id][1] === 'g'), repPill };
}
function prep(page, PROBLEMS) {
  const { R, F, cand, guide, repPill } = groups(PROBLEMS);
  page.innerHTML = '<div class="sd-hero"><h1>AppLovin · Short code</h1></div>' +
    '<div class="sd-bul">' +
      '<div class="sd-box soft"><h3>The round</h3><ul class="sd-list"><li>Live coding with a backend engineer</li><li>Code in Python</li><li>LeetCode style, easy to medium</li><li>Either from your resume or fundamentals</li></ul></div>' +
      '<div class="sd-box soft"><h3>In the room</h3><ul class="sd-list ok"><li>Restate, ask 1–2 questions</li><li>Brute force first, say its Big-O</li><li>Run the example, then edge cases</li><li>Improve, then offer a follow-up</li></ul></div>' +
      '<div class="sd-box soft"><h3>From your resume</h3><ul class="sd-list"><li>Be ready to write the core of each fix</li><li>Say how it ran in production</li><li>Know what you would change now</li></ul></div>' +
    '</div>' +
    '<section class="sd-sec"><div class="day-h"><h2>Reported at AppLovin</h2></div>' + list(cand, repPill) + '<h3 class="gt-h">Listed by prep sites</h3>' + list(guide, repPill) + '</section>' +
    '<section class="sd-sec"><div class="day-h"><h2>Your resume → likely question</h2></div>' + list(R) + '</section>' +
    '<section class="sd-sec"><div class="day-h"><h2>Fundamentals</h2></div>' + list(F) + '</section>';
}
function practice(page, PROBLEMS) {
  const { R, F, cand, guide, repPill } = groups(PROBLEMS);
  const Gn = PROBLEMS.filter(p => p.al && p.al.kind === 'generated').reverse();
  page.innerHTML = '<h1 class="sr-only">Practice</h1>' + (Gn.length ? '<h3 class="gt-h">Generated for you</h3>' + list(Gn) : '') + '<h3 class="gt-h">Reported at AppLovin</h3>' + list(cand, repPill) + '<h3 class="gt-h">Listed by prep sites</h3>' + list(guide, repPill) + '<h3 class="gt-h">From your resume</h3>' + list(R) + '<h3 class="gt-h">Fundamentals</h3>' + list(F);
}
function taskExtra(P) {
  const rp = P && REPORTED[P.id];
  const a = P && P.al;
  if (!a) return rp ? '<div class="gt-sec" style="margin-top:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="gt-tag">' + (rp[1] === 'c' ? 'Reported at AppLovin' : 'AppLovin prep list') + '</span><span class="sd-pill">' + esc(rp[0]) + '</span></div></div>' : '';
  return '<div class="gt-sec" style="margin-top:6px"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="gt-tag">' + (rp ? (rp[1] === 'c' ? 'Reported at AppLovin' : 'AppLovin prep list') : a.kind === 'resume' ? 'From your resume' : a.kind === 'generated' ? 'Generated' : 'Fundamentals') + '</span><span class="sd-pill">' + esc(a.from) + '</span></div>' +
    ((a.talk || []).length ? '<div class="gt-ext"><span class="eyebrow">Say while coding</span><ol>' + a.talk.map(x => '<li>' + x + '</li>').join('') + '</ol></div>' : '') +
    ((a.extensions || []).length ? '<div class="gt-ext"><span class="eyebrow">Follow-ups</span><ol>' + a.extensions.map(x => '<li>' + x + '</li>').join('') + '</ol></div>' : '') + '</div>';
}
function render(page, h, PROBLEMS) { if (h === 'al-cheat' && window.CHEATS) { page.classList.add('sheetpage'); CHEATS.al(page); } else if (h === 'al-practice') practice(page, PROBLEMS); else prep(page, PROBLEMS); }
function orderFrom(PROBLEMS) { const g = groups(PROBLEMS); return g.cand.concat(g.guide, g.R, g.F); }
function reportedList() { const all = window.DATA ? DATA.problems : []; return Object.keys(REPORTED).filter(id => REPORTED[id][1] === 'c').map(id => ({ id, title: (all.find(p => p.id === id) || {}).title || id, src: (REPORTED[id][2] ? REPORTED[id][2] + ' · ' : '') + REPORTED[id][0] })); }
window.AL = { render, taskExtra, reported: id => !!REPORTED[id], has: id => !!REPORTED[id] || EXTRA.includes(id), reportedList, orderFrom, tabFor: h => h === 'al' ? 'al-prep' : h === 'al-cheat' ? 'al-cheat' : 'al-practice' };
})();
