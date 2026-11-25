#!/usr/bin/env python3
"""Check company packs: python3 tools/check_packs.py [files...] (default: app/public/packs/*.json)."""
import json, glob, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LC = {r[2] for r in json.load(open(os.path.join(ROOT, 'app/public/leetcode.json')))['rows']}
IDS = set(json.load(open(os.path.join(ROOT, 'app/public/problem-ids.json'))))
files = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, 'app/public/packs/*.json')))
KINDS = {'coding', 'design', 'behavioural'}
bad = 0
def err(f, m):
    global bad; bad += 1; print('ERROR', os.path.basename(f) + ':', m)
for f in files:
    try: P = json.load(open(f, encoding='utf-8'))
    except Exception as e: err(f, 'not valid JSON: %s' % e); continue
    for k in ('id', 'name', 'role', 'summary', 'rounds', 'sources'):
        if not P.get(k): err(f, 'missing ' + k)
    if P.get('id') and (not re.fullmatch(r'[a-z0-9-]+', P['id']) or os.path.basename(f) != P['id'] + '.json'): err(f, 'id must be lowercase-hyphen and match the file name')
    srcs = P.get('sources') or []
    for i, s in enumerate(srcs):
        if not s.get('label') or not str(s.get('url', '')).startswith('https://'): err(f, 'source %d needs a label and an https url' % i)
    urls = {s.get('url') for s in srcs}
    for i, r in enumerate(P.get('rounds') or []):
        if r.get('kind') not in KINDS: err(f, 'round %d kind must be one of %s' % (i, sorted(KINDS)))
        if not r.get('name') or not r.get('what'): err(f, 'round %d needs name and what' % i)
        if r.get('minutes') is not None and not isinstance(r['minutes'], int): err(f, 'round %d minutes must be an integer' % i)
        if r.get('source') and r['source'] not in urls: err(f, 'round %d source must be one of the pack sources' % i)
    for i, q in enumerate(P.get('reported') or []):
        if bool(q.get('lc')) == bool(q.get('problem')) and not q.get('title'): err(f, 'reported %d needs exactly one of lc / problem, or a title for a question with no LeetCode match' % i)
        if q.get('lc') and q['lc'] not in LC: err(f, 'reported %d: unknown LeetCode slug %r' % (i, q['lc']))
        if q.get('problem') and q['problem'] not in IDS: err(f, 'reported %d: unknown problem id %r' % (i, q['problem']))
        if not P.get('legacy') and q.get('tag') not in ('reported', 'listed'): err(f, 'reported %d: tag must be reported or listed' % i)
        if not P.get('legacy') and q.get('source') not in urls: err(f, 'reported %d: source must be one of the pack sources' % i)
    print('ok' if not bad else '', os.path.basename(f), len(P.get('rounds') or []), 'rounds,', len(P.get('reported') or []), 'questions')
sys.exit(1 if bad else 0)
