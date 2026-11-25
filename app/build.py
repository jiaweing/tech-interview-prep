#!/usr/bin/env python3
"""Build Tech Interview Prep: ../index.html (a full page you can open or host) and dist/artifact.html
(the same page without the document skeleton, for publishing as a claude.ai artifact).
Inputs: orig.html (base app), content/ (problems, designs, concepts), *.js modules, public/ (packs, LeetCode list,
self-hosted AI), ../ex/ (the Explained lessons). Run: python3 build.py"""
import json, glob, os, sys
B = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(B, *a)
# --public builds the generic edition (no personal notes, company packs, LeetCode list, self-hosted AI)
PUBLIC = True
if PUBLIC:
    sys.path.insert(0, P('public'))
    import content as PUB
lines = open(P('orig.html'), encoding='utf-8').read().split('\n')
assert lines[2269] == '<script>' and lines[2270].startswith('window.DATA = ') and lines[2271] == '</script>', 'DATA anchor moved'

import glob as _g
_ex = [json.load(open(f, encoding='utf-8')) for f in sorted(_g.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ex', 'topics', '*', '*.json')))]
_ex.sort(key=lambda t: (['py', 'ds', 'algo', 'sd'].index(t['track']), t.get('order', 99)))
EX_TOPICS = json.dumps(_ex, ensure_ascii=False).replace('</', '<\\/')

def once(s, old, new):
    n = s.count(old)
    assert n == 1, 'anchor found %d times: %r' % (n, old[:90])
    return s.replace(old, new)

# ---------- data ----------
src = lines[2270]
DATA = json.loads(src[len('window.DATA = '):].rstrip(';'))
probs = []
for f in sorted(glob.glob(P('content/problems/*.json'))):
    p = json.load(open(f, encoding='utf-8'))
    probs.append(p)
ORDER = ['transcript-merge', 'chunk-text', 'action-items', 'token-budget', 'retrieve-topk', 'retrieval-eval', 'llm-fallback', 'sse-parse', 'mars-rover', 'mars-rover-obstacles', 'mars-rover-wrap', 'otp-service', 'trapping-rain-water', 'common-elements-min-count', 'sum-bigger-pairs', 'moving-average', 'connect-ropes', 'nric-validate', 'rate-limiter-log', 'teacher-notifications', 'common-students', 'gift-redemption', 'football-rankings', 'base62-shortener', 'salary-csv-upload', 'users-query', 'scheme-eligibility', 'todo-scanner', 'tic-tac-toe-winner']
probs.sort(key=lambda p: ORDER.index(p['id']) if p['id'] in ORDER else 99)
VIZ = {'trapping-rain-water': {'kind': 'water', 'heights': [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]}, 'rate-limiter-log': {'kind': 'window', 'requests': [['a', 1], ['a', 2], ['b', 2], ['a', 3], ['a', 4], ['b', 5], ['a', 5], ['b', 6], ['a', 8]], 'limit': 2, 'window': 3}}
for i, p in enumerate(probs):
    if 'govtech' in p: p['govtech']['order'] = i
    if p['id'] in VIZ and 'govtech' in p and not p['govtech'].get('viz'): p['govtech']['viz'] = VIZ[p['id']]
existing = {p['id'] for p in DATA['problems']}
for p in probs:
    assert p['id'] not in existing, 'duplicate problem id ' + p['id']
    p.pop('brute_differs', None)
DATA['problems'].extend(probs)
pats = {p['id']: p for p in DATA['patterns']}
for p in probs:
    if p['pattern'] in pats and p['id'] not in pats[p['pattern']].setdefault('problems', []): pats[p['pattern']]['problems'].append(p['id'])
# tag existing problems that match reported OGP/GovTech questions
for p in DATA['problems']:
    if p['id'] == 'template-fill':
        p['govtech'] = {'round': 'oa', 'tag': 'reported', 'source': 'OGP: Codility OA and Senior SWE live coding', 'evidence': 'OGP candidates report a Codility task "doing replace templating on a string, which receives a dictionary of keywords and values", and the same task in a Senior SWE live-coding round (Glassdoor, 2022 and 2025).', 'order': -2,
            'extensions': ['Support an escape: <code>{{</code> prints a literal <code>{</code>.', 'Missing keys should raise a clear error listing every missing key, not just the first.', 'Values may contain placeholders that should be filled too, but detect cycles (<code>a -&gt; {b}</code>, <code>b -&gt; {a}</code>).', 'The template is 100 MB and streamed: process it chunk by chunk.']}
    if p['id'] == 'fibonacci-mod':
        p['govtech'] = {'round': 'oa', 'tag': 'inspired', 'source': 'OGP: "design an algorithm to calculate the Fibonacci sequence and explain its merits"', 'evidence': 'A Glassdoor review attributed to an OGP Software Engineer interview asks for a Fibonacci algorithm and the merits of the chosen approach (recursion, memoisation, iteration, matrix power).', 'order': -1,
            'extensions': ['Compare plain recursion, memoised recursion and iteration: time and space for each.', 'Return F(n) for n up to 10^18 modulo 10^9+7 (matrix exponentiation or fast doubling, O(log n)).', 'Why does naive recursion hit Python\'s recursion limit, and what would you change?']}
if PUBLIC:
    # problems written from one candidate's resume stay out of the public edition
    _personal = {p['id'] for p in DATA['problems'] if (p.get('al') or {}).get('kind') == 'resume'}
    DATA['problems'] = [p for p in DATA['problems'] if p['id'] not in _personal]
    for _pt in DATA['patterns']: _pt['problems'] = [i for i in _pt.get('problems', []) if i not in _personal]
lines[2270] = 'window.DATA = ' + json.dumps(DATA, ensure_ascii=False) + ';'

SD = {'concepts': [], 'designs': [], 'practice': [], 'drill': [], 'cheat': {}, 'round': {}}
C_ORDER = ['load-balancing', 'caching', 'cdn-edge', 'consistent-hashing', 'sharding', 'replication', 'sql-vs-nosql', 'blob-storage', 'search-index', 'geo-indexing', 'message-queues', 'realtime-websockets', 'rate-limiting', 'idempotency', 'consistency-cap', 'consensus-raft', 'observability', 'auth-oidc']
D_ORDER = ['agent-memory', 'meeting-ai', 'genmedia', 'consensus-chain', 'csv-ingest', 'url-shortener', 'rate-limiter', 'form-builder', 'llm-guardrails', 'vaccination-booking', 'voucher-redemption', 'otp-login', 'bulk-messaging', 'uber', 'netflix', 'news-feed', 'chat', 'file-sync', 'payments', 'kv-store', 'web-crawler', 'typeahead']
for f in glob.glob(P('content/concepts/*.json')): SD['concepts'].append(json.load(open(f, encoding='utf-8')))
for f in glob.glob(P('content/designs/*.json')): SD['designs'].append(json.load(open(f, encoding='utf-8')))
import hashlib, random as _rnd
def _shuffle_quiz(qs):
    for q in qs:
        seed = int(hashlib.sha1(q['q'].encode('utf-8')).hexdigest(), 16)
        order = list(range(len(q['options']))); _rnd.Random(seed).shuffle(order)
        right = q['options'][q['answer']]
        q['options'] = [q['options'][i] for i in order]
        q['answer'] = q['options'].index(right)
for d in SD['designs']:
    _shuffle_quiz(d.get('quiz', []))
SD['concepts'].sort(key=lambda c: C_ORDER.index(c['id']) if c['id'] in C_ORDER else 99)
SD['designs'].sort(key=lambda d: D_ORDER.index(d['id']) if d['id'] in D_ORDER else 99)
GROUP_ORDER = ['Scale out', 'Data', 'Async & realtime', 'Reliability & correctness', 'Security & identity']
SD['concepts'].sort(key=lambda c: (GROUP_ORDER.index(c['group']) if c['group'] in GROUP_ORDER else 9))
if os.path.exists(P('content/extra/practice.json')): SD['practice'] = json.load(open(P('content/extra/practice.json'), encoding='utf-8'))
for _f in sorted(glob.glob(P('content/extra/practice-grl-*.json'))):
    _ids = {q['id'] for q in SD['practice']}
    SD['practice'] = [q for q in json.load(open(_f, encoding='utf-8')) if q['id'] not in _ids] + SD['practice']
if os.path.exists(P('content/extra/practice-extra.json')):
    ex = json.load(open(P('content/extra/practice-extra.json'), encoding='utf-8'))
    ids = {q['id'] for q in SD['practice']}
    for q in ex:
        if q['id'] not in ids: SD['practice'].insert(2 if q.get('source') == 'govtech' else len(SD['practice']), q)
if os.path.exists(P('content/extra/drill.json')): SD['drill'] = json.load(open(P('content/extra/drill.json'), encoding='utf-8'))
if os.path.exists(P('content/extra/cheat.json')):
    cj = json.load(open(P('content/extra/cheat.json'), encoding='utf-8')); SD['cheat'] = cj.get('cheat', {}); SD['round'] = cj.get('round', {})
SD['round']['grl_cards'] = json.load(open(P('grl-cards.json'), encoding='utf-8'))
_ex = lambda n: json.load(open(P('content/extra/' + n), encoding='utf-8')) if os.path.exists(P('content/extra/' + n)) else None
_dg = _ex('drill-grl.json')
if _dg: SD['drill'] = [dict(q, topic=q.get('topic', 'AI products')) for q in _dg] + SD['drill']
_ang = _ex('grl-angles.json') or {}
for d in SD['designs']:
    for f in _ang.get(d['id'], []):
        d.setdefault('followups', []).insert(0, {'q': '<b>AI product angle:</b> ' + f['q'], 'a': f['a']})
_cg = _ex('cheat-grl.json')
if _cg:
    for k in ('pick', 'phrases', 'mistakes'): SD['cheat'][k] = _cg.get(k, []) + SD['cheat'].get(k, [])
    SD['cheat']['latency'] = sorted(SD['cheat'].get('latency', []) + _cg.get('latency', []), key=lambda r: r['ns'])
for q in SD['practice']:
    if q.get('source') == 'ogp': q['source'] = 'govtech'
dids = {d['id'] for d in SD['designs']}
SD['practice'] = [q for q in SD['practice'] if True]
for q in SD['practice']:
    if q.get('design') and q['design'] not in dids: q['design'] = None
GT = json.load(open(P('gt-data.json'), encoding='utf-8'))
if PUBLIC: GT = PUB.gt_data(GT)
def js_json(o): return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
inject = ['<script>', 'window.SD_DATA = ' + js_json(SD) + ';', 'window.GT_DATA = ' + js_json(GT) + ';', '</script>',
          '<script>', open(P('sd.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('gt.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('sheet.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('al.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('cheats.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('patterns.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('flow.js'), encoding='utf-8').read(), '</script>', '<script>window.EXPLAIN_TOPICS = ', EX_TOPICS, '; window.EXPLAIN_REL = ', open(P('../ex/relations.json'), encoding='utf-8').read(), ';</script>', '<script>', open(P('../ex/explain.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('../ex/which.js'), encoding='utf-8').read(), '</script>', '<script>window.PAT_FINE = ', open(P('content/extra/pattern_fine.json'), encoding='utf-8').read(), ';</script>', '<script>window.VIDEO_DATA = ', open(P('content/extra/videos.json'), encoding='utf-8').read(), ';</script>', '<script>', open(P('videos.js'), encoding='utf-8').read(), '</script>', '<script>', open(P('icons.js'), encoding='utf-8').read(), '</script>', '<script>', 'window.DD_DATA = ' + js_json(dict(PUB.deepdive(json.load(open(P('content/extra/deepdive.json'), encoding='utf-8'))), mine={'projects': [], 'stories': {}})) + ';', open(P('dd.js'), encoding='utf-8').read(), '</script>']
if PUBLIC: inject += ['<script>', 'window.LC_DATA = ' + open(P('public/leetcode.json'), encoding='utf-8').read().replace('</', '<\\/') + ';', 'window.PACKS = ' + js_json(PUB.packs(DATA['problems'])) + ';', '</script>']
lines[2271:2272] = ['</script>', '<!--SDINJECT-->']

# ---------- css ----------
assert lines[1448] == '</style>'
lines[1448:1449] = ['</style>', '<style>', '/*SDCSS*/', '.lvl.hard { color: var(--bad) !important; }', '.lvl.hard::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--bad); margin-right: 6px; vertical-align: 1px; }', '</style>']
html = '\n'.join(lines)

exec(open(P('shell_patch.py'), encoding='utf-8').read())

# ---------- app bridge + realm menu ----------
html = once(html, "\nroute();\nbootPython();\n})();", "\nwindow.APP10K = { xp: (n, why) => GAME.add(n, why), toast: (m, k) => toast(m, k), ai: () => AI.sample, aiErr: c => (AI_ERR || {})[c] };\n" + open(P('realm.js'), encoding='utf-8').read() + "\nroute();\nbootPython();\n})();")

html = once(html, '<!--SDINJECT-->', '\n'.join(inject))
html = once(html, 'family=Caveat:wght@500;700&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap', 'family=Geist:wght@400;500;600&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap')
html = once(html, '/*SDCSS*/', open(P('sd.css'), encoding='utf-8').read() + '\n' + open(P('../ex/explain.css'), encoding='utf-8').read() + '\n.ex-page .ex-blk, .ex-page .ex-card, .ex-page .ex-fam, .ex-page .wh-col { box-shadow: none; }\n.ex-from-sheet { display: inline-flex !important; width: fit-content; margin: 0 20px 10px; }\n.sec-b > .ex-mini { margin: 0 20px 12px; }\n.ex-page .ex-wide { width: auto; left: 0; transform: none; }\n.ex-page .ex-index { max-width: none; }\n')
if PUBLIC: exec(open(P('public/patch.py'), encoding='utf-8').read())
OUT_FULL, OUT_PAGE = '../index.html', 'dist/artifact.html'
os.makedirs(P('dist'), exist_ok=True)
open(P(OUT_FULL), 'w', encoding='utf-8').write(html)
print('wrote index.html', len(html.encode('utf-8')), 'bytes;', len(DATA['problems']), 'problems;', len(SD['designs']), 'designs;', len(SD['concepts']), 'concepts;', len(SD['practice']), 'practice;', len(SD['drill']), 'drill')

# page file to publish: drop the skeleton the artifact service adds around every page
body = html[html.index('<body>\n') + len('<body>\n'):]
body = body[:body.rindex('</body></html>')].rstrip() + '\n'
assert body.startswith('<title>' + ('Tech Interview Prep' if PUBLIC else '$10k') + '</title>')
open(P(OUT_PAGE), 'w', encoding='utf-8').write(body)
print('wrote', OUT_PAGE, len(body.encode('utf-8')), 'bytes')
