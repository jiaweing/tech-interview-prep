# Public edition: run by build.py --public after shell_patch.py, on the assembled page in `html`.
# Shares build.py's globals (once, P, tab, ICO, CHECK). Every anchor must match exactly once.
import re as _re

ICO['list'] = '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>'
ICO['building'] = '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'

def _sub1(pat, new, s, flags=0):
    out, n = _re.subn(pat, lambda m: new, s, count=1, flags=flags)
    assert n == 1, 'pattern not found: ' + pat[:80]
    return out

# ---------- title, self-hosted AI, styles ----------
SH = ('<script>' + open(P('public/vendor/anthropic-sdk.js'), encoding='utf-8').read().replace('</script', '<\\/script') + '</script>\n'
      '<script>' + open(P('public/selfhost.js'), encoding='utf-8').read() + '</script>\n'
      '<style>' + open(P('public/public.css'), encoding='utf-8').read() + '</style>')
html = once(html, '<a class="brand" href="#home"><span class="brand-mark">$</span><b>$10k</b></a>', '<a class="brand" href="#home"><span class="brand-mark">&gt;_</span><b>Interview Prep</b></a>')
html = html.replace('<b>$10k</b><small>', '<b>Interview Prep</b><small>').replace('<span class="brand-mark">$</span>', '<span class="brand-mark">&gt;_</span>')
html = once(html, '<title>$10k</title>\n', '<title>Tech Interview Prep</title>\n' + SH + '\n')
html = html.replace('<title>$10k cheat sheet</title>', '<title>Tech Interview Prep cheat sheet</title>')

# ---------- round picker: generic rounds, Learn, Companies ----------
OPT = lambda k, n, r: '<button class="realm-opt" type="button" role="option" data-realm="' + k + '" aria-selected="false"><span><b>' + n + '</b> <span class="muted">' + r + '</span></span>' + CHECK + '</button>'
MENU = ('<div class="realm-menu" id="realmMenu" role="listbox" aria-label="Interview round" hidden>'
        '<div class="dd-label">Rounds</div>' + OPT('lc', 'Coding', 'Live coding') + OPT('sd', 'System design', '') + OPT('dd', 'Behavioural', 'Deep dive') +
        '<div class="dd-label">Learn the basics</div>' + OPT('ex', 'Explained', 'From zero') +
        '<div class="dd-label">Companies</div>' + OPT('co', 'Company packs', 'Rounds and reported tasks') + '</div></div>')
html = _sub1(r'<div class="realm-menu" id="realmMenu".*?</div></div>', MENU, html, _re.S)
html = _sub1(r'<nav class="tnav" data-realm="lc" aria-label="Live coding">.*?</nav>',
             '<nav class="tnav" data-realm="lc" aria-label="Coding">' + tab('home', 'learn', 'Learn', 'learn') + tab('problems', 'practice', 'Practice', 'practice') + tab('leetcode', 'leetcode', 'LeetCode', 'list') + tab('cheatsheet', 'cheat', 'Cheatsheet', 'cheat') + '</nav>', html, _re.S)
html = _sub1(r'<nav class="tnav" data-realm="al" aria-label="AppLovin" hidden>.*?</nav>',
             '<nav class="tnav" data-realm="co" aria-label="Companies" hidden>' + tab('co', 'co', 'Companies', 'building') + '</nav>', html, _re.S)

# ---------- route: Companies realm, LeetCode tab; no AppLovin realm ----------
html = once(html, "({ sd: 'sd', dd: 'dd', al: 'al' }[store.get('realm', 'lc')] || 'home')", "({ sd: 'sd', dd: 'dd', co: 'co' }[store.get('realm', 'lc')] || 'home')")
html = once(html, "isAL = !!window.AL && (", "isAL = false && (")
html = once(html, "  const isME = /^me(-|$)/.test(h) || h === 'trophies',", "  const isCO = !!window.CO && /^co(-|$)/.test(h);\n  const isME = /^me(-|$)/.test(h) || h === 'trophies',")
html = once(html, "const realm = isEX ? 'ex' : isME ? 'me' : isSD", "const realm = isEX ? 'ex' : isME ? 'me' : isCO ? 'co' : isSD")
html = once(html, "al: ['Short code', 'AppLovin'], me: ['Profile', '']", "co: ['Companies', ''], me: ['Profile', '']")
html = once(html, "lc: ['Live coding', 'Round 2'], sd: ['System design', 'Round 3'], dd: ['Deep dive', 'Round 1']", "lc: ['Coding', 'Live coding'], sd: ['System design', ''], dd: ['Behavioural', 'Deep dive']")
html = once(html, ": 'me-trophies') : isSD ? SD.tabFor(h)", ": 'me-trophies') : isCO ? 'co' : h === 'leetcode' ? 'leetcode' : isSD ? SD.tabFor(h)")
html = once(html, "  else if (isME) viewProfile(page, h);\n", "  else if (isME) viewProfile(page, h);\n  else if (isCO) CO.render(page, h);\n  else if (h === 'leetcode') LCI.render(page);\n")
html = once(html, "const home = { sd: 'sd', dd: 'dd', al: 'al', ex: 'ex-py' }[r] || 'home';", "const home = { sd: 'sd', dd: 'dd', co: 'co', ex: 'ex-py' }[r] || 'home';")
html = once(html, "[['problems', 'GovTech problems', 'Code real tasks against hidden tests']", "[['problems', 'Problems', 'Code real tasks against hidden tests']")

# ---------- practice and home: one list for every problem; a generic loop ----------
html = once(html, "function viewProblems(page) {\n  viewProblems0(page);\n  if (!window.GT) return;", "function viewProblems(page) {\n  viewProblems0(page);\n  return;")
html = once(html, "const list = PROBLEMS.filter(p => !p.al && !p.govtech && (pat === 'all'", "const list = PROBLEMS.filter(p => (pat === 'all'")

# ---------- mock test formats ----------
html = once(html, "return [r[0], f[0]].filter(Boolean).map(p => p.id); }", "return [f[0], f[1]].filter(Boolean).map(p => p.id); }")
html = once(html, "'<button class=\"mopt on\" data-f=\"grl\"><b>Live coding round</b><span>60 min · 1 AI-product task + 1 GovTech kata</span></button>' +\n      '<button class=\"mopt\" data-f=\"al\"><b>AppLovin short code</b><span>45 min · 1 from your resume + 1 fundamentals</span></button>' +\n      '<button class=\"mopt\" data-f=\"govtech\"><b>GovTech HackerRank</b><span>70 min · 3 tasks, easy to hard</span></button></div>'",
               "'<button class=\"mopt on\" data-f=\"grl\"><b>Live coding round</b><span>60 min · 1 AI-product task + 1 kata</span></button>' +\n      '<button class=\"mopt\" data-f=\"al\"><b>Short code</b><span>45 min · 2 LeetCode-style tasks</span></button>' +\n      '<button class=\"mopt\" data-f=\"govtech\"><b>Online assessment</b><span>70 min · 3 tasks, easy to hard</span></button></div>'")

# ---------- Claude's instructions: no single company ----------
for a, b in [("'Review my code like a GovTech interviewer'", "'Review my code like an interviewer'")]:
    html = once(html, a, b)
html = _sub1(r"pass a GovTech \(Singapore\) Giant Robots Labs Product Engineer interview soon[^'\"]*", "pass a software engineering interview soon: live coding in Python, a project deep dive and a system design round.", html)
html = _sub1(r"You review live-coding results for a G[^'\"]*?\.(?= )", "You review live-coding results for a software engineering interview.", html)

# ---------- errors from the self-hosted path ----------
html = once(html, "const AI_ERR = { ", "const AI_ERR = { needs_key: 'Add your Anthropic API key to use Claude here.', offline: 'Could not reach the Anthropic API. Check your connection.', bad_json: 'Claude did not return the expected format. Try again.', error: 'Something went wrong. Try again.', ")

# ---------- Profile: the API key when self-hosted ----------
html = once(html, "function viewProfile(page, h) {", "function viewProfile(page, h) {\n  viewProfile0(page, h);\n  if (window.SELFHOST && h === 'me') { const s = document.createElement('section'); s.className = 'sd-sec sh-sec'; s.innerHTML = '<div class=\"day-h\"><h2>Claude</h2></div><p class=\"muted\">' + (SELFHOST.hasKey() ? 'Using your Anthropic API key, kept in this browser.' : 'Add an Anthropic API key to turn on the mock interviewer, grading and chat.') + '</p><button type=\"button\" class=\"btn small\">' + (SELFHOST.hasKey() ? 'Change key' : 'Add key') + '</button>'; s.querySelector('button').onclick = () => SELFHOST.keyDialog(''); page.appendChild(s); }\n}\nfunction viewProfile0(page, h) {")
