# ---------- topbar: round picker + 3 tabs per round (SG Theory Prep pattern) ----------
CHEV = '<svg class="realm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
CHECK = '<svg class="ck" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
ICO = {
  'learn': '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  'practice': '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  'cheat': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  'prep': '<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 11h6M9 15h4"/>',
  'user': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
}
def tab(href, key, label, icon):
    return '<a href="#' + href + '" data-tab="' + key + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[icon] + '</svg><span class="tab-text">' + label + '</span></a>'
REALMS = [('dd', 'Deep dive', 'Round 1', 'Your 1-2 projects, decisions, setbacks, stakeholders'),
          ('lc', 'Live coding', 'Round 2', 'Python, GovTech problems, run in the browser'),
          ('sd', 'System design', 'Round 3', 'AI products and classics, animated request flows')]
old_nav = '<nav class="tnav" aria-label="Main"><a href="#home" data-tab="learn">Learn</a><a href="#problems" data-tab="practice">Practice</a><a href="#drill" data-tab="drill">Drill</a><a href="#rush" data-tab="rush">Rush</a><a href="#cheatsheet" data-tab="cheat">Cheat sheet</a><a href="#scratch" data-tab="editor">Editor</a><a href="#think" data-tab="think">Worksheet</a></nav>'
new_nav = ('<div class="realm" id="realm"><button class="realm-btn" id="realmBtn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="realmMenu" aria-label="Choose interview round"><b id="realmLab">Coding</b><span class="realm-sub" id="realmSub">Live coding</span>' + CHEV + '</button>'
  '<div class="realm-menu" id="realmMenu" role="listbox" aria-label="Interview round" hidden><div class="dd-label">GovTech · Giant Robots Labs · 3 rounds</div>'
  + ''.join('<button class="realm-opt" type="button" role="option" data-realm="' + k + '" aria-selected="false"><span><b>' + n + '</b> <span class="muted">' + r + '</span></span>' + CHECK + '</button>' for k, n, r, s in REALMS) +
  '<div class="dd-label">AppLovin · Gist</div><button class="realm-opt" type="button" role="option" data-realm="al" aria-selected="false"><span><b>Short code</b> <span class="muted">Round 1</span></span>' + CHECK + '</button>' +
  '<div class="dd-label">Learn the basics</div><button class="realm-opt" type="button" role="option" data-realm="ex" aria-selected="false"><span><b>Explained</b> <span class="muted">From zero</span></span>' + CHECK + '</button>' +
  '</div></div>'
  '<nav class="tnav" data-realm="lc" aria-label="Live coding">' + tab('home', 'learn', 'Learn', 'learn') + tab('problems', 'practice', 'Practice', 'practice') + tab('cheatsheet', 'cheat', 'Cheatsheet', 'cheat') + '</nav>'
  '<nav class="tnav" data-realm="sd" aria-label="System design" hidden>' + tab('sd', 'sd-learn', 'Learn', 'learn') + tab('sd-practice', 'sd-practice', 'Practice', 'practice') + tab('sd-cheat', 'sd-cheat', 'Cheatsheet', 'cheat') + '</nav>'
  '<nav class="tnav" data-realm="al" aria-label="AppLovin" hidden>' + tab('al', 'al-prep', 'Prep', 'prep') + tab('al-practice', 'al-practice', 'Practice', 'practice') + tab('al-cheat', 'al-cheat', 'Cheatsheet', 'cheat') + '</nav>'
  '<nav class="tnav" data-realm="dd" aria-label="Deep dive" hidden>' + tab('dd', 'dd-prep', 'Prep', 'prep') + tab('dd-questions', 'dd-practice', 'Practice', 'practice') + tab('dd-cheat', 'dd-cheat', 'Cheatsheet', 'cheat') + '</nav>'
  '<nav class="tnav" data-realm="ex" aria-label="Explained" hidden>' + tab('ex-py', 'ex-py', 'Python', 'prep') + tab('ex-ds', 'ex-ds', 'Data structures', 'learn') + tab('ex-algo', 'ex-algo', 'Algorithms', 'practice') + tab('ex-sd', 'ex-sd', 'System design', 'cheat') + tab('ex-which', 'ex-which', 'Which one?', 'prep') + '</nav>'
  '<nav class="tnav" data-realm="me" aria-label="Profile" hidden>' + tab('me', 'me', 'Profile', 'user') + tab('me-rounds', 'me-rounds', 'Rounds', 'flag') + tab('me-trophies', 'me-trophies', 'Trophies', 'trophy') + '</nav>')
html = once(html, old_nav, new_nav)

# ---------- route ----------
html = once(html, "  const h = (location.hash || '#home').slice(1) || 'home';\n  prevHash = curHash; curHash = h;",
  "  const h = (location.hash || '').slice(1) || ({ sd: 'sd', dd: 'dd', al: 'al' }[store.get('realm', 'lc')] || 'home');\n  prevHash = curHash; curHash = h;\n"
  "  const isSD = /^sd(-|$)/.test(h) && !!window.SD, isDD = /^dd(-|$)/.test(h) && !!window.DD, isAL = !!window.AL && (/^al(-|$)/.test(h) || (h.startsWith('p-') && (!!(probById[h.slice(2)] || {}).al || (store.get('realm', 'lc') === 'al' && AL.has(h.slice(2))))) || (h === 'mock' && store.get('realm', 'lc') === 'al'));\n"
  "  const isME = /^me(-|$)/.test(h) || h === 'trophies', isEX = !!window.EXPLAIN && (/^ex-/.test(h) || (h.startsWith('x-') && !!EXPLAIN.byId(h.slice(2))));\n  const realm = isEX ? 'ex' : isME ? 'me' : isSD ? 'sd' : isDD ? 'dd' : isAL ? 'al' : 'lc';\n"
  "  if (!isME) { store.set('realm', realm); store.set('last:' + realm, h); } BACK.visit(realm, h);\n"
  "  document.body.dataset.realm = realm;\n"
  "  $$('.tnav').forEach(n => { n.hidden = n.dataset.realm !== realm; });\n"
  "  $$('.realm-opt').forEach(o => o.setAttribute('aria-selected', String(o.dataset.realm === realm)));\n"
  "  { const R = { lc: ['Live coding', 'Round 2'], sd: ['System design', 'Round 3'], dd: ['Deep dive', 'Round 1'], al: ['Short code', 'AppLovin'], me: ['Profile', ''], ex: ['Explained', 'From zero'] }[realm]; $('#realmLab').textContent = R[0]; $('#realmSub').textContent = R[1]; }")
html = once(html, "  const tab = h === 'cheatsheet' ? 'cheat' : h === 'scratch' ? 'editor' : h === 'think' ? 'think' : /^(problems|p-|mock)/.test(h) ? 'practice' : /^(drill|cards)/.test(h) ? 'drill' : h === 'rush' ? 'rush' : 'learn';",
  "  const tab = isEX ? (h.startsWith('x-') ? 'ex-' + EXPLAIN.byId(h.slice(2)).track : h) : isME ? (h === 'me-rounds' ? 'me-rounds' : h === 'me' ? 'me' : 'me-trophies') : isSD ? SD.tabFor(h) : isDD ? DD.tabFor(h) : isAL ? AL.tabFor(h) : h === 'cheatsheet' ? 'cheat' : /^(problems|p-|mock|drill|cards|rush|mixed)/.test(h) ? 'practice' : 'learn';")
html = once(html, "  { const on = $('.tnav a.on'), nv = $('.tnav'); ", "  { const on = $('.tnav:not([hidden]) a.on'), nv = $('.tnav:not([hidden])'); ")
html = once(html, "  if (h.startsWith('lesson-') && lessonById[h.slice(7)]) viewLesson(page, lessonById[h.slice(7)]);",
  "  if (isEX) { page.classList.add('ex-page'); page.style.maxWidth = h.startsWith('x-') ? '1100px' : '1640px'; page.style.marginLeft = 'auto'; page.style.marginRight = 'auto'; if (h === 'ex-which') page.innerHTML = WHICH.html(); else if (h.startsWith('x-')) cleanup.push(EXPLAIN.mountTopic(page, EXPLAIN.byId(h.slice(2)))); else cleanup.push(EXPLAIN.mountIndex(page, h.slice(3))); }\n  else if (isME) viewProfile(page, h);\n  else if (isSD) SD.render(page, h, cleanup);\n  else if (isDD) DD.render(page, h, cleanup);\n  else if (isAL && /^al(-|$)/.test(h)) { AL.render(page, h, PROBLEMS); if (h === 'al-practice') genBar(page); }\n  else if (h === 'scratch' || h === 'think') { location.replace('#problems'); return; }\n  else if (h.startsWith('lesson-') && lessonById[h.slice(7)]) viewLesson(page, lessonById[h.slice(7)]);")
# practice modes as chips at the top of each practice page (one place for drill / rush / cards / mock)
html = once(html, "  highlightStatic(page);\n  document.body.classList.toggle('wide'",
  "  { const M = { lc: [['problems', 'GovTech problems', 'Code real tasks against hidden tests'], ['drill', 'Pattern drill', 'Read a task, name the pattern'], ['mock', 'Mock test', 'Timed, like the real round']],\n"
  "      sd: [['sd-practice', 'Timed rounds', '45 min, model answers, rubric'], ['sd-drill', 'Quick drill', '10 fast calls an interviewer expects'], ['sd-board', 'Whiteboard', 'Sketch freely']],\n"
  "      dd: [['dd-questions', 'Questions', 'Browse, answer, rate yourself'], ['dd-mock', 'Mock', 'Timed answers with follow-ups']],\n      al: [['al-practice', 'Problems', ''], ['mock', 'Mock test', '']] }[realm];\n"
  "    if (M && M.some(m => m[0] === h)) { const bar = document.createElement('div'); bar.className = 'modes-bar'; bar.innerHTML = M.map(m => '<a class=\"mode' + (m[0] === h ? ' on' : '') + '\" href=\"#' + m[0] + '\" title=\"' + m[2] + '\">' + m[1] + '</a>').join('') + '<span class=\"mode-note\">' + (M.find(m => m[0] === h) || [])[2] + '</span>'; page.prepend(bar); } }\n"
  "  highlightStatic(page);\n  if (window.GT) GT.mountAll(page, probById);\n  BACK.mount(page, realm, h);\n  labelRows(page);\n  listVideoTools(page);\n  refreshMe();\n  IDE.mount(page, h);\n  INTERVIEW.mountButtons(page, h); cleanup.push(INTERVIEW.close);\n  document.body.classList.toggle('wide'")

# ---------- live-coding hooks ----------
html = once(html, "function statementHTML(P) {", "function statementHTML(P) { return statementHTML0(P) + (window.GT && !document.querySelector('#main .page.exam') ? GT.taskExtra(P) + (window.AL ? AL.taskExtra(P) : '') + (window.VIDEOS ? VIDEOS.html(P) : '') : ''); }\nfunction statementHTML0(P) {")
html = once(html, "function viewHome(page) {", "function viewHome(page) {\n  viewHome0(page);\n  if (!window.GT) return;\n  const sec = document.createElement('div'); sec.innerHTML = GT.homeHTML(PROBLEMS, prog.solved());\n  const el = sec.firstElementChild; if (el) page.prepend(el);\n}\nfunction viewHome0(page) {")
# Practice page: GovTech first; the old Codility-style list is collapsed as extra pattern practice
html = once(html, "function viewProblems(page) {", "function viewProblems(page) {\n  viewProblems0(page);\n  if (!window.GT) return;\n  const head = page.firstElementChild, must = $('section.must', page);\n  const wrap = document.createElement('div'); wrap.innerHTML = GT.setHTML(PROBLEMS, prog.solved());\n  const det = document.createElement('details'); det.className = 'sd-more extra-practice'; det.innerHTML = '<summary>Extra pattern practice · ' + PROBLEMS.filter(p => !p.govtech && !p.al).length + ' problems</summary><div class=\"sd-more-b\"></div>';\n  const body = det.lastElementChild; let n = must; const moving = []; while (n) { moving.push(n); n = n.nextElementSibling; } moving.forEach(x => body.appendChild(x));\n  page.appendChild(wrap.firstElementChild || document.createElement('span')); page.appendChild(det);\n}\nfunction viewProblems0(page) {")
html = once(html, "$('#fl2', page).innerHTML = ['all', 'easy', 'medium'].map(", "$('#fl2', page).innerHTML = ['all', 'easy', 'medium', 'hard'].map(")
html = once(html, "'<div class=\"row\" style=\"justify-content:space-between\"><h1>Problems</h1><div class=\"row\"><a class=\"btn\" href=\"#mixed\">Random mixed problem</a><a class=\"btn primary\" href=\"#mock\">Mock assessment →</a></div></div>'", "'<h1 class=\"sr-only\">Problems</h1>'")
# home: drop the OGP-weighted readiness block
html = once(html, "    readinessHTML() +\n", "")
# mock formats: GovTech only
html = once(html, "  const pickSet = fmt => {\n", "  const pickSet = fmt => {\n    if (fmt === 'al') { const r = wsh(PROBLEMS.filter(p => p.al && p.al.kind === 'resume')), f = wsh(PROBLEMS.filter(p => p.al && p.al.kind === 'fundamentals')); return [r[0], f[0]].filter(Boolean).map(p => p.id); }\n    if (fmt === 'govtech' || fmt === 'grl') {\n      const g = PROBLEMS.filter(p => p.govtech && p.govtech.round !== 'take-home');\n      if (fmt === 'grl') { const a = wsh(PROBLEMS.filter(p => p.grl)), b = wsh(g.filter(p => p.govtech.round === 'live' && !p.grl)); return [a[0], b[0]].filter(Boolean).map(p => p.id); }\n      const e = wsh(g.filter(p => p.level === 'easy')), m = wsh(g.filter(p => p.level !== 'easy'));\n      return [e[0], m[0], m[1]].filter(Boolean).map(p => p.id);\n    }\n")
html = once(html, "'<button class=\"mopt on\" data-f=\"ogp\"><b>OGP format</b><span>90 min · 2 coding tasks + essay</span></button>' +\n      '<button class=\"mopt\" data-f=\"classic\"><b>Classic Codility</b><span>90 min · 3 coding tasks</span></button></div>'",
  "'<button class=\"mopt on\" data-f=\"grl\"><b>Live coding round</b><span>60 min · 1 AI-product task + 1 GovTech kata</span></button>' +\n      '<button class=\"mopt\" data-f=\"al\"><b>AppLovin short code</b><span>45 min · 1 from your resume + 1 fundamentals</span></button>' +\n      '<button class=\"mopt\" data-f=\"govtech\"><b>GovTech HackerRank</b><span>70 min · 3 tasks, easy to hard</span></button></div>'")
html = once(html, "    let fmt = 'ogp';", "    let fmt = store.get('realm', 'lc') === 'al' ? 'al' : 'grl';")
html = once(html, "start: Date.now(), dur: 90 * 60000, done: false }", "start: Date.now(), dur: (fmt === 'govtech' ? 70 : fmt === 'al' ? 45 : 60) * 60000, done: false }")
html = once(html, "<b>Submit</b> locks a task, just like Codility.", "<b>Submit</b> locks a task.")

# ---------- copy: GovTech, not OGP/Codility ----------
for old, new in [
    ("Codility performance tests usually push N to 100,000 though.", "Hidden speed tests usually push N to 100,000 though."),
    ("<small>Codility prep · Python</small>", "<small>Python · open source</small>"),
    ("['Codility Slayer', 1750], ['OGP Ready', 2200]", "['Live-coding Ready', 1750], ['Offer Ready', 2200]"),
    ("note: '~70% of what OGP asks'", "note: 'the core of most coding tasks'"),
    ("sec('Clean code (graded by humans at OGP)'", "sec('Clean code (the interviewer reads every line)'"),
    ("' · the most-asked OGP shapes</span>", "' · core coding shapes</span>"),
    ("Before you submit (humans read OGP code)", "Before you submit (the interviewer reads your code)"),
    ("'Review my code like an OGP reviewer'", "'Review my code like a GovTech interviewer'"),
    ("You review Codility take-home results for Open Government Products (Singapore) software engineer hiring. Humans there read every solution for clarity and correctness, and read the short essay for product sense", "You review live-coding results for a GovTech (Singapore) Giant Robots Labs Product Engineer interview. Interviewers read every solution for clarity, correctness and how it would hold up in a real product, and read any written answer for product sense"),
    ("pass an Open Government Products (Singapore) Codility Python test soon.", "pass a GovTech (Singapore) Giant Robots Labs Product Engineer interview soon: a 60-minute Python live-coding round, a project deep dive, and a system design round on AI products."),
    ("testday: 'Test-day rules + essay'", "testday: 'Interview day: the 3 rounds'"),
]:
    html = once(html, old, new)
html = html.replace("Weighted by how often each pattern appears in OGP-style tests", "Weighted by how often each pattern appears in coding tests")
html = html.replace("Estimated share of OGP-style tasks, from candidate reports (not official data)", "Estimated share of coding tasks, from candidate reports (not official data)")
# interview day page replaces the old Codility test-day page
td_start = html.index("function viewTestDay(page) {")
td_end = html.index("  nextBar(page, 'testday');", td_start)
html = html[:td_start] + open(P('interview_day.js'), encoding='utf-8').read() + html[td_end:]

html = once(html, "  add(xp, why) {\n    if (!xp) return;\n", "  add(xp, why) {\n    if (!xp) return;\n    { const d = store.get('xpDay', {}), k = todayKey(); d[k] = (d[k] || 0) + xp; store.set('xpDay', d); setTimeout(() => { if (typeof refreshMe === 'function') refreshMe(); }, 0); }\n")
html = once(html, "\nwindow.addEventListener('hashchange', route);\n", "\n" + open(P('sync.js'), encoding='utf-8').read() + "\n" + open(P('player.js'), encoding='utf-8').read() + "\n" + open(P('profile.js'), encoding='utf-8').read() + "\n" + open(P('gen.js'), encoding='utf-8').read() + "\n" + open(P('back.js'), encoding='utf-8').read() + "\n" + open(P('ide.js'), encoding='utf-8').read() + "\n" + open(P('vendor/voiceglow.js'), encoding='utf-8').read() + "\n" + (open(P('public/lc.js'), encoding='utf-8').read() + "\n" + open(P('public/companies.js'), encoding='utf-8').read() + "\n" if PUBLIC else '') + open(P('interview.js'), encoding='utf-8').read() + "\nwindow.addEventListener('hashchange', route);\n")

# Live coding cheatsheet: SG Theory Prep card grid
html = once(html, "function viewCheat(page) {\n  page.classList.add('wide');\n  const C = D.cheat;", """function viewCheat(page) {
  if (!window.SHEET) return viewCheat0(page);
  page.classList.add('sheetpage');
  const C = D.cheat || {}, H = SHEET.H, cards = [];
  if (window.GT_DATA && GT_DATA.tips) cards.push({ title: 'Live round habits', html: H.list(GT_DATA.tips) });
  if (window.PATTERN_MAP) PATTERN_MAP.cards().filter(c => c.title !== 'Spot the pattern').forEach(c => cards.push(c));
  else (C.patterns || []).forEach(p => cards.push({ title: pname(p.id), html: (SHEET.PICS[p.id] ? SHEET.PICS[p.id]() : '') + H.facts([['When', esc(p.when)], ['Move', esc(p.move)], ['Big-O', esc(p.big_o)], ['Trap', esc(p.trap)]]) + '<pre class="static-code" style="margin:6px 20px 0">' + esc(p.core) + '</pre>' }));
  if ((C.python || []).length) cards.push({ title: 'Python you need', html: '<div class="pats">' + C.python.map(x => '<div class="pat"><div class="ph">' + esc(x.need) + '</div><div class="ex"><pre class="static-code">' + esc(x.code) + '</pre></div></div>').join('') + '</div>' });
  if ((C.complexity || []).length) cards.push({ title: 'Input size → speed', html: SHEET.speedChart() + H.facts(C.complexity.map(r => ['<span class="n">' + esc(r.n) + '</span>', esc(r.need)]).map(r => [r[0].replace('<span class="n">', '').replace('</span>', ''), r[1]])) });
  if (window.CHEATS && CHEATS.bigO) cards.unshift(CHEATS.bigO());
  if (window.PFLOW) cards.unshift(PFLOW.card());
  SHEET.mount(page, 'lc', cards);
  if (window.PFLOW) PFLOW.bind(page);
  if (window.linkExplained) linkExplained(page);
}
function viewCheat0(page) {
  page.classList.add('wide');
  const C = D.cheat;""")

# AppLovin realm: keep its problems out of the generic list; back link from its problem pages
html = once(html, "const list = PROBLEMS.filter(p => (pat === 'all'", "const list = PROBLEMS.filter(p => !p.al && !p.govtech && (pat === 'all'")
html = once(html, "  highlightStatic(page);\n  if (window.GT) GT.mountAll(page, probById);", "  if (isAL && h.startsWith('p-')) { const bk = $('.prob-head a[href=\"#problems\"]', page); if (bk) { bk.setAttribute('href', '#al-practice'); bk.textContent = '← Practice'; } }\n  highlightStatic(page);\n  if (window.GT) GT.mountAll(page, probById);")

exec(open(P('drill_patch.py'), encoding='utf-8').read())
