#!/usr/bin/env python3
"""Verify a live-coding problem JSON (app/content/problems/<id>.json).
Usage: python3 verify_problem.py FILE [FILE...]
Checks schema, runs the reference solution on every test (and the perf test, timed),
cross-checks the brute solution on non-perf tests, checks example tests match the examples list."""
import json, sys, time, copy, signal
PATTERNS = ['hashing','prefix-sums','sorting','two-pointers','stack','kadane','binary-search','math','greedy-sim','dp','strings',
            'linked-list','trees','heap','trie','graphs','backtracking','intervals','bits','greedy']
CATS = ['example','empty','single','small','zero','boundary','dupes','medium','edge','negative','large']
def norm(x):
    if isinstance(x, tuple): x = list(x)
    if isinstance(x, list): return [norm(i) for i in x]
    return x
class TO(Exception): pass
def alarm(*a): raise TO()
def load(src, name='solution'):
    ns = {'__name__': '__main__'}; exec(src, ns); return ns[name]
def check(path):
    P = json.load(open(path)); E = []; W = []; tag = path + ' [' + str(P.get('id')) + ']'
    for k in ('id','title','pattern','level','statement','examples','constraints','starter','think','hints','solution','brute','explain','complexity','tests','perf'):
        if k not in P: E.append('missing field ' + k)
    if P.get('pattern') not in PATTERNS: E.append('pattern must be one of %s' % PATTERNS)
    if P.get('level') not in ('easy','medium','hard'): E.append('level must be easy|medium|hard')
    if 'def solution(' not in P.get('starter',''): E.append('starter must define solution(')
    if 'def solution(' not in P.get('statement',''): W.append('statement should mention def solution(...)')
    if 'al' in P:
        a = P['al']
        if a.get('kind') not in ('resume', 'fundamentals'): E.append('al.kind must be resume|fundamentals')
        if not a.get('from'): E.append('al.from missing')
        if len(a.get('extensions', [])) < 3: E.append('al.extensions needs 3-5 items')
        if len(a.get('talk', [])) < 3: E.append('al.talk needs 3-5 code-level talking points')
    elif 'govtech' in P:   # optional: a problem reported at GovTech
        g = P.get('govtech') or {}
        for k in ('round','source','evidence','tag','extensions'):
            if k not in g: E.append('govtech.%s missing' % k)
        if g.get('tag') not in ('reported','inspired','domain'): E.append('govtech.tag must be reported|inspired|domain')
        if g.get('round') not in ('oa','live','take-home'): E.append('govtech.round must be oa|live|take-home')
    for s in P.get('think', []):
        if not all(k in s for k in ('step','q','a')): E.append('think step needs step/q/a')
    if len(P.get('tests', [])) < 8: W.append('fewer than 8 tests')
    for t in P.get('tests', []):
        if t.get('cat') not in CATS: E.append('test %r cat %r not in %s' % (t.get('label'), t.get('cat'), CATS))
        for k in ('args','expected','label','why'):
            if k not in t: E.append('test %r missing %s' % (t.get('label'), k))
    try:
        sol = load(P['solution']); brute = load(P['brute']); load(P['starter'])
    except Exception as ex:
        E.append('solution/brute/starter failed to exec: %r' % ex); sol = brute = None
    if sol:
        signal.signal(signal.SIGALRM, alarm)
        for t in P['tests']:
            try:
                signal.alarm(5); got = sol(*copy.deepcopy(t['args'])); signal.alarm(0)
            except Exception as ex:
                signal.alarm(0); E.append('solution raised on %r: %r' % (t.get('label'), ex)); continue
            if norm(got) != norm(t['expected']): E.append('solution gives %r on %r, test expects %r' % (got, t.get('label'), t['expected']))
            try:
                signal.alarm(10); gb = brute(*copy.deepcopy(t['args'])); signal.alarm(0)
                if norm(gb) != norm(t['expected']) and not P.get('brute_differs'): E.append('brute gives %r on %r, expected %r (set "brute_differs": true only if the brute is deliberately buggy and explain why in its comment)' % (gb, t.get('label'), t['expected']))
            except TO: W.append('brute timed out on %r' % t.get('label'))
            except Exception as ex: signal.alarm(0); W.append('brute raised on %r: %r' % (t.get('label'), ex))
        pf = P.get('perf')
        if pf:
            try:
                args = eval(pf['gen']); t0 = time.perf_counter(); signal.alarm(10); got = sol(*args); signal.alarm(0); dt = time.perf_counter() - t0
                if norm(got) != norm(pf['expected']): E.append('perf expected mismatch: solution gives %r' % (str(got)[:120],))
                if dt > 0.12: E.append('perf test takes %.3fs in CPython; Brython is ~20x slower and the limit is 5s: shrink the input to keep it under 0.12s' % dt)
                # brute should be too slow on perf to show the speed gap (warn only)
                try:
                    signal.alarm(3); t0 = time.perf_counter(); brute(*eval(pf['gen'])); signal.alarm(0)
                    if time.perf_counter() - t0 < 0.05: W.append('brute is fast on the perf input too; the perf test does not separate O(N^2) from O(N)')
                except TO: pass
                except Exception: signal.alarm(0)
            except Exception as ex: signal.alarm(0); E.append('perf gen/eval failed: %r' % ex)
    exs = [t for t in P.get('tests', []) if t.get('cat') == 'example']
    if len(exs) != len(P.get('examples', [])): E.append('number of tests with cat "example" (%d) must equal number of examples (%d), same order' % (len(exs), len(P.get('examples', []))))
    for t, ex in zip(exs, P.get('examples', [])):
        if 'example' not in t.get('label','').lower(): E.append('example test label must contain "example": %r' % t.get('label'))
        try:
            if json.loads(json.dumps(eval(ex['output']))) != t['expected']: W.append('example output %r does not eval to test expected %r' % (ex['output'], t['expected']))
        except Exception: W.append('example output %r is not a python literal' % ex.get('output'))
    for m in E: print(tag, 'ERROR', m)
    for m in W: print(tag, 'WARN', m)
    if not E: print(tag, 'OK', '(%d warnings)' % len(W) if W else '')
    return not E
ok = all([check(p) for p in sys.argv[1:]])
sys.exit(0 if ok else 1)
