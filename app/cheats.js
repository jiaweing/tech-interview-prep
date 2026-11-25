/* Cheatsheets for the Deep dive and AppLovin realms, on the shared SHEET card grid. */
(function () {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const code = s => '<pre class="static-code" style="margin:6px 20px 0">' + esc(s) + '</pre>';
const svg = (h, inner) => '<svg class="pv" viewBox="0 0 320 ' + h + '" role="img" aria-hidden="true">' + inner + '</svg>';
const T = (x, y, s, cls, a) => '<text x="' + x + '" y="' + y + '" class="' + (cls || 'pv-t') + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>';
const box = (x, y, w, h, cls, label) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" class="' + (cls || 'pv-cell') + '"/>' + (label != null ? T(x + w / 2, y + h / 2 + 5, label) : '');
const line = (x1, y1, x2, y2) => '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" class="pv-ln"/>';

/* ---------- pictures for the AppLovin patterns ---------- */
const PIC = {
  bfs() {
    // distance rings spreading from the start cell
    const D = [[0, 1, 2, 3, 4], [1, 2, null, 4, 5], [2, 3, null, 5, 6]];
    let s = '';
    D.forEach((r, j) => r.forEach((d, i) => { s += box(10 + i * 34, 6 + j * 30, 30, 26, d === null ? 'pv-dim' : d === 0 || d === 6 ? 'pv-hi' : 'pv-cell', d === null ? '' : d); }));
    return svg(100, s + T(310, 30, 'queue grows one ring', 'pv-s', 'end') + T(310, 48, 'at a time', 'pv-s', 'end') + T(310, 80, 'first visit = shortest', 'pv-s', 'end'));
  },
  tree() {
    // [5, 3, 8, 1, 4] as a list and as a tree
    let s = '';
    [5, 3, 8, 1, 4].forEach((v, i) => { s += box(8 + i * 26, 8, 22, 22, i ? 'pv-cell' : 'pv-hi', v); });
    s += T(8, 52, 'children of i: 2i+1, 2i+2', 'pv-s', 'start') + T(8, 70, 'None = no node', 'pv-s', 'start');
    const N = [[240, 18, 5], [205, 54, 3], [275, 54, 8], [185, 90, 1], [225, 90, 4]];
    s += line(240, 18, 205, 54) + line(240, 18, 275, 54) + line(205, 54, 185, 90) + line(205, 54, 225, 90);
    N.forEach(([x, y, v], i) => { s += '<circle cx="' + x + '" cy="' + y + '" r="12" class="' + (i ? 'pv-cell' : 'pv-hi') + '"/>' + T(x, y + 5, v); });
    return svg(108, s);
  },
  heap() {
    // keep a min-heap of size k; the root is the k-th largest so far
    let s = '';
    [9, 4, 7, 1, 8, 3].forEach((v, i) => { s += box(8 + i * 26, 30, 22, 26, [0, 2, 4].includes(i) ? 'pv-hi' : 'pv-dim', v); });
    s += T(8, 18, 'stream', 'pv-s', 'start');
    const N = [[250, 20, 7], [222, 62, 9], [278, 62, 8]];
    s += line(250, 20, 222, 62) + line(250, 20, 278, 62);
    N.forEach(([x, y, v], i) => { s += '<circle cx="' + x + '" cy="' + y + '" r="13" class="' + (i ? 'pv-cell' : 'pv-hi') + '"/>' + T(x, y + 5, v); });
    return svg(96, s + T(250, 92, 'min-heap of size k = 3', 'pv-s'));
  },
  cycle() {
    // a tail into a loop, slow and fast pointers
    const P = [[20, 50], [62, 50], [104, 50], [146, 50], [188, 22], [230, 50], [188, 78]];
    let s = '';
    for (let i = 0; i < 6; i++) s += line(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]);
    s += line(188, 78, 146, 50);
    P.forEach(([x, y], i) => { s += '<circle cx="' + x + '" cy="' + y + '" r="11" class="' + (i === 3 ? 'pv-hi' : 'pv-cell') + '"/>' + T(x, y + 5, i); });
    s += T(62, 82, 'slow +1', 'pv-p') + T(230, 86, 'fast +2', 'pv-p2');
    return svg(100, s + T(316, 30, 'they meet in the loop,', 'pv-s', 'end') + T(316, 46, 'then reset one to 0:', 'pv-s', 'end') + T(316, 62, 'meet again at 3', 'pv-s', 'end'));
  }
};

/* ---------- AppLovin short code ---------- */
function al(page) {
  const H = SHEET.H, P = SHEET.PICS, cards = [];
  cards.push({ title: '45 minutes', html: SHEET.timeline([{ title: 'Clarify: inputs, output, edge cases', minutes: '3 min' }, { title: 'Brute force and its Big-O', minutes: '5 min' }, { title: 'Code the better idea', minutes: '20 min' }, { title: 'Run examples and edge cases', minutes: '7 min' }, { title: 'Follow-ups', minutes: '10 min' }]) });
  cards.push({ title: 'Say while coding', html: H.list(['"Let me restate it: given … return …"', '"Brute force is O(N²): check every pair. Fine for 1,000, too slow for 100,000."', '"A dict gives O(1) lookups, so one pass is enough."', '"I\'ll name this <code>seen</code> because …"', '"Let me trace example 1 by hand before running."', '"Edge cases: empty input, one item, duplicates, all the same."', '"If this were a service, I would …"']) });
  if (window.PATTERN_MAP) PATTERN_MAP.cards().filter(x => x.title !== 'Spot the pattern').forEach(x => cards.push(x));
  cards.push({ title: 'Trees as lists', html: PIC.tree() + H.facts([['When', 'Validate BST, depth, level order'], ['Move', 'Iterative stack or deque; no deep recursion'], ['BST rule', 'Pass (low, high) down; strict inequalities']]) + code('stack = [(0, None, None)]\nwhile stack:\n    i, lo, hi = stack.pop()\n    if i >= len(tree) or tree[i] is None:\n        continue\n    v = tree[i]\n    if (lo is not None and v <= lo) or (hi is not None and v >= hi):\n        return False\n    stack.append((2 * i + 1, lo, v))\n    stack.append((2 * i + 2, v, hi))') });
  cards.push({ title: 'Python you need', html: '<div class="pats">' + [
    ['Count things', 'from collections import Counter\nCounter(words).most_common(3)'],
    ['Group things', 'from collections import defaultdict\ng = defaultdict(list)\ng["".join(sorted(w))].append(w)'],
    ['LRU in two lines', 'from collections import OrderedDict\nd.move_to_end(k)\nd.popitem(last=False)'],
    ['Sort with tie-breaks', 'rows.sort(key=lambda r: (-r[1], r[0]))'],
    ['Binary search', 'import bisect\ni = bisect.bisect_left(a, x)'],
    ['Exact ratios', 'a1 * b2 > a2 * b1  # no floats']
  ].map(r => '<div class="pat"><div class="ph">' + esc(r[0]) + '</div><div class="ex"><pre class="static-code">' + esc(r[1]) + '</pre></div></div>').join('') + '</div>' });
  cards.push({ title: 'Input size → speed', html: SHEET.speedChart() + H.facts([['≤ 1,000', 'O(N²) is fine'], ['≤ 100,000', 'O(N log N) or O(N)'], ['≥ 1,000,000', 'O(N), no sorting inside loops']]) });
  cards.push({ title: 'Edge cases to say out loud', html: H.list(['Empty input', 'One item', 'All the same value', 'Duplicates and ties: which one wins?', 'Negative numbers and zero', 'Already sorted, reverse sorted', 'No answer: return what?']) });
  cards.unshift(bigO());
  if (window.PFLOW) cards.unshift(PFLOW.card());
  SHEET.mount(page, 'al', cards);
  if (window.PFLOW) PFLOW.bind(page);
  if (window.linkExplained) linkExplained(page);
}

/* ---------- Deep dive ---------- */
function firstLines(s, n) {
  return String(s || '').split('\n').map(x => x.trim()).filter(x => x && !/\[add:/.test(x)).slice(0, n);
}
function firstSentence(s) {
  const t = String(s || '').replace(/\[add:[^\]]*\]/g, '').trim();
  const m = t.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : t).trim();
}
function dd(page) {
  const H = SHEET.H, D = window.DD_DATA || {}, M = D.mine || {}, cards = [];
  if ((D.plan || []).length) cards.push({ title: '60 minutes', html: SHEET.timeline(D.plan) });
  cards.push({ title: 'Answer shape: CARL', html: SHEET.timeline([{ title: 'Context', minutes: '15 s' }, { title: 'Your actions (say "I")', minutes: '70 s' }, { title: 'Result with a number', minutes: '20 s' }, { title: 'Learning', minutes: '15 s' }]) });
  (M.projects || []).forEach(p => {
    const f = p.fill || {};
    const name = p.name.replace(/\s*\(.*\)$/, '');
    cards.push({ title: name + ' in 30 seconds', html: H.facts([['Pitch', esc(firstSentence(f.pitch))], ['Users', esc(firstSentence(f.users))], ['You', esc(firstSentence(f.role))]].concat(firstLines(f.impact, 2).map((x, i) => [i ? '' : 'Impact', esc(x)]))) });
    const dec = firstLines(f.decisions, 4).map(x => x.replace(/^\d+\.\s*/, ''));
    if (dec.length) cards.push({ title: name + ': decisions', html: H.list(dec.map(esc)) });
  });
  const S = M.stories || {};
  if (Object.keys(S).length) cards.push({ title: 'Theme → your story', html: H.pairs(Object.keys(S).map(k => [esc(k), (S[k] || [])[0] || '', (S[k] || [])[1] || ''])) });
  cards.push({ title: 'Say a decision like this', html: H.list(['"We had two options: X and Y."', '"I picked X because of [constraint], measured by [number]."', '"The cost was [what we gave up]."', '"It held up: [result]. If I did it again, I would [change]."']) });
  cards.push({ title: 'When they push', html: H.pairs([['"Why not Y?"', 'Name what Y is better at, then the constraint that ruled it out.'], ['"What went wrong?"', 'Own one real failure, the fix, and what you changed after.'], ['"I don\'t know"', 'Say how you would find out, then give your best guess.'], ['"Who disagreed?"', 'Their view, the data you used, how it ended.']]) });
  if ((D.ask_them || []).length) cards.push({ title: 'Ask them', html: H.list(D.ask_them.slice(0, 5).map(esc)) });
  cards.push({ title: 'Avoid', html: H.list(['"We" with no "I"', 'Tech stack before the problem', 'No numbers', 'Blaming people', 'Answers longer than 2 minutes']) });
  SHEET.mount(page, 'dd', cards);
}

/* ---------- Big-O of everyday Python operations ---------- */
const BIGO = [
  ['list', [
    ['a[i]  read or write', 'O(1)'], ['a.append(x)', 'O(1)'], ['a.pop()  from the end', 'O(1)'], ['len(a)', 'O(1)'],
    ['a.pop(0)  /  a.insert(0, x)', 'O(n)'], ['a.insert(i, x)  /  del a[i]', 'O(n)'], ['x in a  /  a.index(x)  /  a.remove(x)', 'O(n)'],
    ['a[i:j]  slice', 'O(k)'], ['a.extend(b)  /  a + b', 'O(k)'], ['a.copy()  /  a[:]  /  list(a)', 'O(n)'], ['a.reverse()  /  a[::-1]', 'O(n)'],
    ['min(a)  /  max(a)  /  sum(a)', 'O(n)'], ['a.sort()  /  sorted(a)', 'O(n log n)']]],
  ['make a list', [
    ['[0] * n', 'O(n)'], ['[x for x in it]', 'O(n)'], ['[[0] * c for _ in range(r)]', 'O(r · c)'], ['list(range(n))', 'O(n)']]],
  ['dict', [
    ['d[k]  /  d[k] = v  /  d.get(k)', 'O(1)'], ['k in d', 'O(1)'], ['del d[k]  /  d.pop(k)', 'O(1)'], ['len(d)', 'O(1)'],
    ['for k, v in d.items()', 'O(n)'], ['dict(pairs)  /  d.copy()', 'O(n)'], ['value in d.values()', 'O(n)']]],
  ['set', [
    ['s.add(x)  /  s.remove(x)  /  s.discard(x)', 'O(1)'], ['x in s', 'O(1)'], ['set(a)', 'O(n)'],
    ['s | t  union', 'O(len s + len t)'], ['s & t  intersection', 'O(min(len s, len t))'], ['s - t  difference', 'O(len s)']]],
  ['str  (can\'t change in place)', [
    ['s[i]  /  len(s)', 'O(1)'], ['s[i:j]  slice', 'O(k)'], ['s + t', 'O(n + m)'], ['s += c  in a loop', 'O(n²) total'], ['"".join(parts)', 'O(total length)'],
    ['s.split()  /  s.strip()  /  s.lower()', 'O(n)'], ['sub in s  /  s.find(sub)', 'O(n · m) worst'], ['s[::-1]  /  sorted(s)', 'O(n)  /  O(n log n)']]],
  ['collections.deque', [
    ['append  /  appendleft', 'O(1)'], ['pop  /  popleft', 'O(1)'], ['d[0]  /  d[-1]', 'O(1)'], ['d[i]  in the middle', 'O(n)'], ['x in d', 'O(n)']]],
  ['heapq  (min-heap)', [
    ['h[0]  smallest', 'O(1)'], ['heappush  /  heappop', 'O(log n)'], ['heapify(a)', 'O(n)'], ['nlargest(k, a)  /  nsmallest', 'O(n log k)'], ['x in h', 'O(n)']]],
  ['Counter and defaultdict', [
    ['Counter(a)', 'O(n)'], ['c[x] += 1  /  dd[k].append(v)', 'O(1)'], ['c.most_common(k)', 'O(n log k)'], ['c.most_common()  all', 'O(n log n)']]],
  ['search and sort', [
    ['bisect.bisect_left(a, x)', 'O(log n)'], ['bisect.insort(a, x)', 'O(n)'], ['sorted(a, key=...)', 'O(n log n)'], ['binary search by hand', 'O(log n)'],
    ['BFS / DFS on a graph', 'O(V + E)'], ['Dijkstra with heapq', 'O(E log V)']]]
];
const bigoClass = c => /n²|n\^2|n · m/.test(c) ? 'bo-slow' : /[A-Za-z)] log/.test(c) ? 'bo-nlog' : /log/.test(c) ? 'bo-log' : /^O\(1\)/.test(c) ? 'bo-1' : 'bo-n';
function bigO() {
  const html = '<div class="bo-legend"><span class="bo-1">O(1)</span><span class="bo-log">O(log n)</span><span class="bo-n">O(n) / O(k)</span><span class="bo-nlog">O(n log n)</span><span class="bo-slow">O(n²)</span><span class="bo-note">n = size, k = items touched</span></div>' +
    '<div class="bo-grid">' + BIGO.map(([name, rows]) => '<div class="bo-group"><h3>' + esc(name) + '</h3>' + rows.map(([op, c]) => '<div class="bo-row"><code>' + esc(op) + '</code><b class="n ' + bigoClass(c) + '">' + esc(c) + '</b></div>').join('') + '</div>').join('') + '</div>';
  return { title: 'Big-O: what each operation costs', html, wide: true };
}
window.CHEATS = { al, dd, bigO };
})();
