# Pattern drill rewrite; Flashcards and 60s rush removed; realm-aware "next" after solving
import re as _re
_s = html.index('function viewDrill(page) {')
_e = html.index('\nfunction ', _s + 10)
html = html[:_s] + open(P('drill.js'), encoding='utf-8').read().rstrip() + html[_e:]
html = once(html, "  else if (h === 'cards') viewCards(page);", "  else if (h === 'cards' || h === 'rush') { location.replace('#drill'); return; }")
html = once(html, "  else if (h === 'rush') viewRush(page);\n", "")
html = _re.sub(r"\n  \{ id: 'cards10'[^\n]*", "", html, count=1)
html = _re.sub(r"\n  \{ id: 'rush10'[^\n]*", "", html, count=1)
html = _re.sub(r"\n  \['rush15'[^\n]*", "", html, count=1)
html = _re.sub(r"\n  \['cards50'[^\n]*", "", html, count=1)
html = once(html, "const reviewRow = (dueN || newN) ?", "const reviewRow = false ?")
_i = html.index('const STEPS = ['); _j = html.index('];', _i)
html = html[:_i] + html[_i:_j].replace(", 'cards'", "").replace("'cards', ", "") + html[_j:]
# after solving: stay in the round you are in
html = once(html, "        const nxP = PROBLEMS.find(p => p.pattern === P.pattern && !solved[p.id]);",
  "        const rlm = document.body.dataset.realm, inAL = rlm === 'al' && window.AL;\n        const nxP = inAL ? AL.orderFrom(PROBLEMS).find(p => p.id !== P.id && !solved[p.id]) : PROBLEMS.find(p => p.pattern === P.pattern && !p.al && !solved[p.id]);")
html = once(html, "        const stepKey = 'pattern-' + P.pattern, inPlan = STEP_LIST.includes(stepKey) && !prog.done()[stepKey];",
  "        const stepKey = 'pattern-' + P.pattern, inPlan = !inAL && STEP_LIST.includes(stepKey) && !prog.done()[stepKey];")
html = once(html, "          : (nxP ? '<a class=\"btn small primary\" href=\"#p-' + nxP.id + '\">Next: ' + esc(nxP.title) + ' →</a>' : '<a class=\"btn small primary\" href=\"#home\">Back to plan →</a>') + '<a class=\"btn small\" href=\"#mixed\">Mixed problem</a>') + '</div>';",
  "          : (nxP ? '<a class=\"btn small primary\" href=\"#p-' + nxP.id + '\">Next: ' + esc(nxP.title) + ' →</a>' : '<a class=\"btn small primary\" href=\"#' + (inAL ? 'al-practice' : 'home') + '\">' + (inAL ? 'All done →' : 'Back to plan →') + '</a>') + (inAL ? '<a class=\"btn small\" href=\"#al-practice\">Practice list</a>' : '<a class=\"btn small\" href=\"#mixed\">Mixed problem</a>')) + '</div>';")
html = once(html, "was found. Codility calls def ' + fn_name + '(...), so keep that exact name.'", "was found. The tests call def ' + fn_name + '(...), so keep that exact name.'")
html = html.replace("'Codility only checks the return value'", "'the tests only check the return value'")
# pattern shown on the problem page, not hidden behind "Reveal pattern"
html = once(html, "(fromPat ? lname(P.pattern) : '<button class=\"chip\" id=\"revpat\">Reveal pattern</button>')", "'<span class=\"lname\">' + fineBadge(P) + '</span>' + (exFor(patLabel(P)) ? '<a class=\"chip\" href=\"#x-' + exFor(patLabel(P)) + '\">Explained</a>' : '')")
