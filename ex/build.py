#!/usr/bin/env python3
"""Build the single-file site: index.html = shell + styles + engine + every topic."""
import json, os, glob, sys
D = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(D, *a)
topics = []
for f in sorted(glob.glob(P('topics', '*', '*.json'))):
    topics.append(json.load(open(f, encoding='utf-8')))
topics.sort(key=lambda t: (['py', 'ds', 'algo', 'sd'].index(t['track']), t.get('order', 99)))
html = open(P('shell.html'), encoding='utf-8').read()
for a, b in [('/*EXPLAIN_CSS*/', open(P('explain.css'), encoding='utf-8').read()),
             ('/*TOPICS*/[]', json.dumps(topics, ensure_ascii=False).replace('</', '<\\/')),
             ('/*REL*/{}', open(P('relations.json'), encoding='utf-8').read()),
             ('/*EXPLAIN_JS*/', open(P('explain.js'), encoding='utf-8').read()),
             ('/*WHICH_JS*/', open(P('which.js'), encoding='utf-8').read())]:
    assert html.count(a) == 1, a
    html = html.replace(a, b)
out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else P('index.html')
open(out, 'w', encoding='utf-8').write(html)
print('index.html written:', len(topics), 'topics,', len(html) // 1024, 'KB')
