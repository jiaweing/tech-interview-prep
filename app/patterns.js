/* Pattern map: spot the pattern from the question, then one card per coding pattern, on the shared SHEET card grid. */
(function () {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const code = s => '<pre class="static-code" style="margin:6px 20px 0">' + esc(s) + '</pre>';
const svg = (h, inner) => '<svg class="pv" viewBox="0 0 320 ' + h + '" role="img" aria-hidden="true">' + inner + '</svg>';
const T = (x, y, s, cls, a) => '<text x="' + x + '" y="' + y + '" class="' + (cls || 'pv-t') + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>';
const onHi = cls => (cls === 'pv-hi' ? 'pv-th' : 'pv-t');
const box = (x, y, w, h, cls, label) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" class="' + (cls || 'pv-cell') + '"/>' + (label != null ? T(x + w / 2, y + h / 2 + 4, label, onHi(cls)) : '');
const dot = (x, y, r, cls, label) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + (cls || 'pv-cell') + '"/>' + (label != null ? T(x, y + 4, label, onHi(cls)) : '');
const line = (x1, y1, x2, y2) => '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" class="pv-ln"/>';
const r1 = n => Math.round(n * 10) / 10;
function arrow(x1, y1, x2, y2, cut) {
  // line with a head at (x2, y2); cut trims both ends (e.g. a circle radius)
  const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len, c = cut || 0;
  const ax = x1 + ux * c, ay = y1 + uy * c, bx = x2 - ux * c, by = y2 - uy * c, px = -uy * 4, py = ux * 4, hx = bx - ux * 7, hy = by - uy * 7;
  return '<path d="M' + r1(ax) + ' ' + r1(ay) + ' L' + r1(hx) + ' ' + r1(hy) + '" class="pv-ln"/><path d="M' + r1(bx) + ' ' + r1(by) + ' L' + r1(hx + px) + ' ' + r1(hy + py) + ' L' + r1(hx - px) + ' ' + r1(hy - py) + 'Z" class="pv-a"/>';
}
function row(vals, x0, y, o) {
  o = o || {}; const w = o.w || 30, h = o.h || 30; let s = '';
  vals.forEach((v, i) => { const cls = (o.hi || []).includes(i) ? 'pv-hi' : (o.band || []).includes(i) ? 'pv-band' : (o.dim || []).includes(i) ? 'pv-dim' : 'pv-cell'; s += box(x0 + i * (w + 4), y, w, h, cls, v); });
  return s;
}
const ptr = (x0, i, y, lab, cls, w) => { const x = x0 + i * ((w || 30) + 4) + (w || 30) / 2; return T(x, y, lab, cls || 'pv-p') + '<path d="M' + (x - 4) + ' ' + (y + 3) + ' L' + (x + 4) + ' ' + (y + 3) + ' L' + x + ' ' + (y + 9) + 'Z" class="' + (cls === 'pv-p2' ? 'pv-a2' : 'pv-a') + '"/>'; };
function tree(nodes, edges, r) {
  // nodes: [x, y, label, cls]; edges: [i, j]
  return edges.map(([i, j]) => line(nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1])).join('') + nodes.map(n => dot(n[0], n[1], r, n[3], n[2])).join('');
}
const pic = id => (window.SHEET && SHEET.PICS && SHEET.PICS[id] ? SHEET.PICS[id]() : '');

/* ---------- pictures ---------- */
const PIC = {
  twoPointers: () => svg(102, row([1, 2, 4, 6, 8, 11, 15], 10, 30, { hi: [0, 6] }) + ptr(10, 0, 18, 'L') + ptr(10, 6, 18, 'R', 'pv-p2') +
    T(10, 82, 'sum &lt; target: move L right', 'pv-s', 'start') + T(10, 97, 'sum &gt; target: move R left', 'pv-s', 'start') + T(310, 82, '1 + 15 = 16', 'pv-t', 'end') + T(310, 97, 'target 13', 'pv-s', 'end')),
  answer() {
    let s = row([1, 2, 3, 4, 5, 6, 7, 8], 10, 30, { hi: [4, 5, 6, 7] }) + ptr(10, 4, 18, 'answer', 'pv-p2');
    for (let i = 0; i < 8; i++) s += T(25 + i * 34, 76, i < 4 ? 'no' : 'ok', 'pv-s');
    return svg(106, s + T(10, 98, 'ok(speed) flips once: find the first ok', 'pv-s', 'start'));
  },
  intervals() {
    const X = t => 16 + 22 * t, bar = (a, b, y, cls) => box(X(a), y, X(b) - X(a), 16, cls, a + '–' + b);
    let s = bar(1, 3, 8) + bar(8, 10, 8) + bar(2, 6, 28) + bar(9, 12, 28);
    s += arrow(170, 47, 170, 63) + T(180, 59, 'sort, merge', 'pv-s', 'start');
    s += bar(1, 6, 68, 'pv-hi') + bar(8, 12, 68, 'pv-hi');
    return svg(106, s + T(10, 102, 'overlap when start ≤ last end: extend it', 'pv-s', 'start'));
  },
  mono() {
    const v = [73, 74, 75, 71, 69, 72, 76], cls = ['pv-dim', 'pv-dim', 'pv-cell', 'pv-band', 'pv-band', 'pv-hi', 'pv-dim'];
    let s = '';
    v.forEach((x, i) => { const h = (x - 65) * 5, bx = 10 + i * 26; s += '<rect x="' + bx + '" y="' + (70 - h) + '" width="20" height="' + h + '" rx="5" class="' + cls[i] + '"/>' + T(bx + 10, 84, x, 'pv-s'); if (i === 3 || i === 4) s += T(bx + 10, 64 - h, 'pop', 'pv-p'); });
    s += T(196, 24, 'stack: 75, 71, 69', 'pv-s', 'start') + T(196, 42, '72 pops 69 and 71:', 'pv-s', 'start') + T(196, 58, 'their next greater', 'pv-s', 'start') + T(196, 74, 'value is 72', 'pv-s', 'start');
    return svg(104, s + T(10, 100, 'each index is pushed once and popped once', 'pv-s', 'start'));
  },
  heap() {
    let s = T(8, 20, 'stream', 'pv-s', 'start');
    [9, 4, 7, 1, 8, 3].forEach((v, i) => { s += box(8 + i * 26, 30, 22, 26, [0, 2, 4].includes(i) ? 'pv-hi' : 'pv-dim', v); });
    s += arrow(168, 43, 202, 43);
    s += tree([[250, 22, 7, 'pv-hi'], [222, 62, 9], [278, 62, 8]], [[0, 1], [0, 2]], 13);
    return svg(100, s + T(160, 94, 'min-heap of size k = 3: root = 3rd largest', 'pv-s'));
  },
  twoHeaps: () => svg(96, T(10, 20, 'low: max-heap', 'pv-s', 'start') + T(310, 20, 'high: min-heap', 'pv-s', 'end') +
    row([1, 3, 5], 10, 30, { hi: [2] }) + row([7, 9, 12], 212, 30, { hi: [0] }) +
    T(160, 40, 'median', 'pv-s') + T(160, 58, '(5+7)/2 = 6', 'pv-t') + T(160, 88, 'sizes equal, or low has one more', 'pv-s')),
  linked() {
    let s = T(8, 44, 'None', 'pv-s', 'start') + arrow(49, 40, 36, 40) + arrow(99, 40, 75, 40) + arrow(205, 40, 229, 40) + arrow(255, 40, 282, 40) + T(310, 44, 'None', 'pv-s', 'end');
    s += dot(62, 40, 13, 'pv-cell', 1) + dot(112, 40, 13, 'pv-hi', 2) + dot(192, 40, 13, 'pv-cell', 3) + dot(242, 40, 13, 'pv-cell', 4);
    s += T(112, 70, 'prev', 'pv-p') + T(192, 70, 'head', 'pv-p2') + T(10, 14, 'reversed part', 'pv-s', 'start') + T(310, 14, 'still to do', 'pv-s', 'end');
    return svg(100, s + T(10, 94, 'save next, point head back at prev, step both', 'pv-s', 'start'));
  },
  treeDfs: () => svg(124, tree([[160, 22, 3, 'pv-hi'], [100, 56, 2], [220, 56, 2], [70, 90, 1], [130, 90, 1], [250, 90, 1]], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], 12) +
    T(10, 26, 'post-order', 'pv-s', 'start') + T(310, 26, 'number = height', 'pv-s', 'end') + T(160, 118, 'node returns 1 + max(left, right)', 'pv-s')),
  treeBfs() {
    let s = '';
    [0, 1, 2].forEach(i => { s += '<rect x="10" y="' + (8 + i * 34) + '" width="300" height="26" rx="8" class="pv-band"/>' + T(18, 25 + i * 34, 'level ' + i, 'pv-s', 'start'); });
    s += tree([[180, 21, 3], [130, 55, 9], [230, 55, 20], [200, 89, 15], [260, 89, 7]], [[0, 1], [0, 2], [2, 3], [2, 4]], 11);
    return svg(128, s + T(160, 122, '[[3], [9, 20], [15, 7]]', 'pv-t'));
  },
  bst: () => svg(136, tree([[160, 18, 5, 'pv-hi'], [110, 50, 3], [210, 50, 8], [85, 82, 1], [135, 82, 4], [235, 82, 9]], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], 12) +
    T(310, 22, 'left &lt; node &lt; right', 'pv-s', 'end') + T(10, 122, 'in-order', 'pv-s', 'start') + row([1, 3, 4, 5, 8, 9], 70, 104, { h: 26 })),
  graph: () => svg(120, tree([[30, 50, 0, 'pv-hi'], [100, 20, 1], [100, 80, 1], [170, 20, 2], [170, 80, 2], [240, 50, 3]], [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]], 13) +
    T(10, 114, 'number = steps from the start; first visit wins', 'pv-s', 'start')),
  topo() {
    let s = arrow(50, 60, 90, 38) + arrow(50, 68, 90, 90) + arrow(130, 38, 170, 60) + arrow(130, 90, 170, 68);
    s += box(10, 52, 40, 24, 'pv-hi', 'a') + box(90, 22, 40, 24, 'pv-cell', 'b') + box(90, 82, 40, 24, 'pv-cell', 'c') + box(170, 52, 40, 24, 'pv-cell', 'd');
    s += T(30, 92, 'in 0', 'pv-s') + T(110, 16, 'in 1', 'pv-s') + T(110, 120, 'in 1', 'pv-s') + T(190, 92, 'in 2', 'pv-s');
    s += T(228, 48, 'order', 'pv-s', 'start') + T(228, 66, 'a, b, c, d', 'pv-t', 'start') + T(228, 92, 'a cycle never', 'pv-s', 'start') + T(228, 106, 'reaches 0', 'pv-s', 'start');
    return svg(126, s);
  },
  unionFind() {
    let s = arrow(30, 72, 60, 22, 13) + arrow(90, 72, 60, 22, 13) + arrow(170, 72, 170, 22, 13) + arrow(170, 22, 60, 22, 13);
    s += dot(60, 22, 13, 'pv-hi', 1) + dot(30, 72, 13, 'pv-cell', 2) + dot(90, 72, 13, 'pv-cell', 3) + dot(170, 22, 13, 'pv-cell', 4) + dot(170, 72, 13, 'pv-cell', 5);
    s += T(115, 14, 'union', 'pv-p') + T(200, 46, 'find: walk parents', 'pv-s', 'start') + T(200, 62, 'up to the root', 'pv-s', 'start') + T(200, 84, 'union: root → root', 'pv-s', 'start');
    return svg(108, s + T(10, 104, 'each arrow points to the parent', 'pv-s', 'start'));
  },
  dijkstra() {
    const C = { S: [30, 55], A: [125, 20], B: [125, 90], T: [215, 55] };
    let s = [['S', 'A'], ['S', 'B'], ['A', 'B'], ['A', 'T'], ['B', 'T']].map(([a, b]) => line(C[a][0], C[a][1], C[b][0], C[b][1])).join('');
    s += T(70, 30, '4', 'pv-s') + T(70, 88, '1', 'pv-s') + T(136, 59, '2', 'pv-s') + T(178, 30, '1', 'pv-s') + T(178, 88, '5', 'pv-s');
    s += box(10, 43, 40, 24, 'pv-cell', 'S 0') + box(105, 8, 40, 24, 'pv-cell', 'A 3') + box(105, 78, 40, 24, 'pv-cell', 'B 1') + box(195, 43, 40, 24, 'pv-hi', 'T 4');
    s += T(248, 46, 'pop order', 'pv-s', 'start') + T(248, 62, 'S, B, A, T', 'pv-s', 'start');
    return svg(128, s + T(10, 122, 'pop the closest; A drops from 4 to 3 via B', 'pv-s', 'start'));
  },
  backtrack() {
    const N = [[160, 16, '[ ]'], [60, 50, '1'], [160, 50, '2'], [260, 50, '3'], [35, 84, '1 2'], [95, 84, '1 3'], [160, 84, '2 3'], [35, 118, '1 2 3']];
    const E = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [4, 7]], on = [0, 1, 4, 7];
    let s = E.map(([i, j]) => line(N[i][0], N[i][1] + 11, N[j][0], N[j][1] - 11)).join('');
    N.forEach((n, i) => { s += box(n[0] - 22, n[1] - 11, 44, 22, on.includes(i) ? 'pv-hi' : 'pv-cell', n[2]); });
    return svg(134, s + T(200, 104, 'choose, explore,', 'pv-s', 'start') + T(200, 120, 'undo (pop)', 'pv-s', 'start'));
  },
  dp2() {
    const a = 'ace', b = 'abcde', D = [[0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1], [0, 1, 1, 2, 2, 2], [0, 1, 1, 2, 2, 3]];
    let s = '';
    for (let j = 1; j <= 5; j++) s += T(43 + j * 28, 16, b[j - 1], 'pv-s');
    D.forEach((r, i) => {
      if (i) s += T(18, 36 + i * 22, a[i - 1], 'pv-s');
      r.forEach((v, j) => { const hi = i === 3 && j === 5, band = i === 2 && j === 4; s += '<rect x="' + (30 + j * 28) + '" y="' + (22 + i * 22) + '" width="26" height="20" rx="5" class="' + (hi ? 'pv-hi' : band ? 'pv-band' : 'pv-cell') + '"/>' + T(43 + j * 28, 36 + i * 22, v, hi ? 'pv-th' : 'pv-t'); });
    });
    return svg(112, s + T(212, 40, 'match: diag + 1', 'pv-s', 'start') + T(212, 58, 'else: max of', 'pv-s', 'start') + T(212, 74, 'up and left', 'pv-s', 'start') + T(212, 98, 'LCS = 3', 'pv-t', 'start'));
  },
  trie: () => svg(120, tree([[150, 14, null, 'pv-dim'], [100, 44, 'c'], [210, 44, 'd'], [100, 74, 'a'], [210, 74, 'o', 'pv-hi'], [75, 104, 'r', 'pv-hi'], [125, 104, 't', 'pv-hi']], [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [3, 6]], 11) +
    T(316, 20, 'car, cat, do', 'pv-t', 'end') + T(316, 108, 'r, t, o end a word', 'pv-s', 'end')),
  bits() {
    const R = [['x = 12', '1100'], ['x − 1 = 11', '1011'], ['x &amp; (x − 1) = 8', '1000']];
    let s = '';
    R.forEach(([lab, bits], i) => { const y = 8 + i * 30; s += T(10, y + 16, lab, 'pv-t', 'start'); bits.split('').forEach((b, j) => { s += box(150 + j * 28, y, 24, 24, b === '1' ? 'pv-hi' : 'pv-cell', b); }); });
    return svg(114, s + T(10, 108, 'drops the lowest 1 bit; 0 means a power of two', 'pv-s', 'start'));
  },
  matrix() {
    const G = ['11000', '11010', '00010', '00001'];
    let s = '';
    G.forEach((r, i) => r.split('').forEach((c, j) => { s += '<rect x="' + (10 + j * 25) + '" y="' + (8 + i * 25) + '" width="22" height="22" rx="4" class="' + (c === '1' ? 'pv-hi' : 'pv-cell') + '"/>'; }));
    s += T(150, 22, '3 islands', 'pv-t', 'start') + T(150, 46, 'new land cell:', 'pv-s', 'start') + T(150, 62, 'count += 1, then', 'pv-s', 'start') + T(150, 78, 'flood it with a stack', 'pv-s', 'start') + T(150, 98, 'neighbours: 4 moves', 'pv-s', 'start');
    return svg(112, s);
  },
  lru: () => svg(128, T(10, 14, 'before', 'pv-s', 'start') + row(['a', 'b', 'c', 'd'], 10, 20, { h: 26 }) + T(10, 66, 'after get(b)', 'pv-s', 'start') + row(['a', 'c', 'd', 'b'], 10, 72, { h: 26, hi: [3] }) +
    T(160, 34, 'dict: key → node', 'pv-s', 'start') + T(160, 50, 'list keeps the order', 'pv-s', 'start') + T(160, 66, 'both are O(1)', 'pv-s', 'start') + T(10, 120, 'put when full: evict the front (oldest)', 'pv-s', 'start'))
};

/* ---------- pattern cards ---------- */
const P = [
  { title: 'Hash map and counting', pic: () => pic('hashing'),
    when: 'Seen before, count, duplicates, anagrams, pair sum in an unsorted array',
    move: 'One pass; check the dict before you add the current item',
    big: 'O(n) time, O(n) space',
    trap: 'Adding before checking pairs an item with itself. Lists cannot be keys: use <code>tuple(...)</code>',
    code: `from collections import defaultdict

def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())`,
    classic: 'LC 1 Two Sum, LC 49 Group Anagrams, LC 242 Valid Anagram, LC 128 Longest Consecutive Sequence' },
  { title: 'Two pointers', pic: PIC.twoPointers,
    when: 'Sorted array, pair or triplet with a sum, palindrome, reverse in place',
    move: 'L at the start, R at the end; move the side that fixes the sum. 3Sum: fix i, run this on the rest',
    big: 'O(n) after an O(n log n) sort; O(1) space',
    trap: 'Needs sorted input. In 3Sum, skip equal neighbours or you return duplicate triplets',
    code: `def pair_with_sum(nums, target):  # nums is sorted
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1
        else:
            right -= 1
    return []`,
    classic: 'LC 167 Two Sum II, LC 15 3Sum, LC 125 Valid Palindrome, LC 11 Container With Most Water' },
  { title: 'Sliding window', pic: () => pic('two-pointers'),
    when: 'Longest or shortest substring or subarray with a rule: no repeats, at most k distinct, sum at least x',
    move: 'Grow right; while the rule breaks, shrink left; record the best',
    big: 'O(n): each index enters and leaves once',
    trap: 'Negative numbers break shrink-left windows (use prefix sums). For the shortest window, record inside the while loop',
    code: `from collections import Counter

def longest_without_repeat(s):
    count = Counter()
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] += 1
        while count[ch] > 1:  # rule broken
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
    classic: 'LC 3 Longest Substring Without Repeating Characters, LC 76 Minimum Window Substring, LC 424 Longest Repeating Character Replacement, LC 209 Minimum Size Subarray Sum' },
  { title: 'Prefix sums', pic: () => pic('prefix-sums'),
    when: 'Subarray sum equals k, range sums asked many times, sums divisible by k',
    move: 'sum(i..j) = P[j + 1] − P[i]. To count subarrays, look up running − k in a dict',
    big: 'O(n) time and space',
    trap: 'Forgetting <code>{0: 1}</code> misses subarrays that start at index 0',
    code: `def subarray_sum(nums, k):
    count = {0: 1}  # running sum -> times seen
    running = answer = 0
    for x in nums:
        running += x
        answer += count.get(running - k, 0)
        count[running] = count.get(running, 0) + 1
    return answer`,
    classic: 'LC 560 Subarray Sum Equals K, LC 303 Range Sum Query, LC 238 Product of Array Except Self' },
  { title: 'Binary search', pic: () => pic('binary-search'),
    when: 'Sorted array, find a target or insert position, rotated sorted array, O(log n) asked',
    move: 'Compare mid; drop the half that cannot hold the answer. <code>bisect</code> does it for you',
    big: 'O(log n)',
    trap: '<code>lo = mid</code> with <code>lo &lt; hi</code> loops forever. Pick one form and keep it',
    code: `def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo  # first i with nums[i] >= target

# same as bisect.bisect_left(nums, target)`,
    classic: 'LC 704 Binary Search, LC 35 Search Insert Position, LC 33 Search in Rotated Sorted Array, LC 153 Find Minimum in Rotated Sorted Array' },
  { title: 'Binary search on the answer', pic: PIC.answer,
    when: 'Minimum speed, capacity or days; minimize the largest part; answer is a number in a range',
    move: 'Write ok(x); search for the smallest x where ok(x) is true',
    big: 'O(n log M), M = size of the answer range',
    trap: 'ok() must flip once (no, no, ok, ok). Start hi at a value that surely works',
    code: `def min_speed(piles, hours):
    def ok(speed):
        return sum((p + speed - 1) // speed for p in piles) <= hours

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    classic: 'LC 875 Koko Eating Bananas, LC 1011 Capacity To Ship Packages Within D Days, LC 410 Split Array Largest Sum' },
  { title: 'Sorting and greedy', pic: () => pic('sorting'),
    when: 'Most items within a limit, earliest deadline, can you reach the end, largest number',
    move: 'Sort by the key that makes the local best choice safe, then take items in order',
    big: 'O(n log n), the sort dominates',
    trap: 'Greedy needs a reason it is safe. Try a small counterexample; if one breaks it, use DP',
    code: `def content_children(greed, cookies):
    greed.sort()
    cookies.sort()
    child = 0
    for size in cookies:
        if child < len(greed) and size >= greed[child]:
            child += 1
    return child

# tie-breaks: rows.sort(key=lambda r: (-r[1], r[0]))`,
    classic: 'LC 455 Assign Cookies, LC 55 Jump Game, LC 134 Gas Station, LC 179 Largest Number' },
  { title: 'Intervals', pic: PIC.intervals,
    when: 'Overlapping ranges, meeting rooms, insert or merge intervals, remove the fewest',
    move: 'Sort by start; extend the last merged interval or start a new one. Rooms: heap of end times',
    big: 'O(n log n)',
    trap: 'Not sorting first. Decide if touching ends ([1, 2], [2, 3]) overlap: ≤ or &lt;',
    code: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    classic: 'LC 56 Merge Intervals, LC 57 Insert Interval, LC 435 Non-overlapping Intervals, LC 253 Meeting Rooms II' },
  { title: 'Stack', pic: () => pic('stack'),
    when: 'Matching brackets, undo, backspace, nested decoding, evaluate an expression',
    move: 'Push openers; on a closer, pop and check it matches',
    big: 'O(n)',
    trap: 'Popping an empty stack. A non-empty stack at the end means unmatched openers',
    code: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
    classic: 'LC 20 Valid Parentheses, LC 155 Min Stack, LC 150 Evaluate Reverse Polish Notation, LC 394 Decode String' },
  { title: 'Monotonic stack', pic: PIC.mono,
    when: 'Next greater, previous smaller, days until warmer, largest rectangle',
    move: 'Stack of indices with falling values; a bigger value pops them and is their answer',
    big: 'O(n): each index is pushed and popped once',
    trap: 'Store indices when you need distances. Strict &lt; or ≤ matters with duplicates',
    code: `def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []  # indices, values falling
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x
        stack.append(i)
    return answer`,
    classic: 'LC 739 Daily Temperatures, LC 496 Next Greater Element I, LC 84 Largest Rectangle in Histogram' },
  { title: 'Heap: top k and k-way merge', pic: PIC.heap,
    when: 'K-th largest, top k frequent, k closest, merge k sorted lists',
    move: 'Min-heap of size k: push, pop when over k. Merge: heap of (value, list, index)',
    big: 'O(n log k)',
    trap: '<code>heapq</code> is a min-heap only: push -x for max. Equal values compare the next tuple field, so add an index',
    code: `import heapq

def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

def merge_sorted(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    merged = []
    while heap:
        value, i, j = heapq.heappop(heap)
        merged.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return merged`,
    classic: 'LC 215 Kth Largest Element in an Array, LC 347 Top K Frequent Elements, LC 973 K Closest Points to Origin, LC 23 Merge k Sorted Lists' },
  { title: 'Two heaps', pic: PIC.twoHeaps,
    when: 'Running median, balance the low and high halves of a stream',
    move: 'Max-heap for the low half, min-heap for the high half; sizes differ by at most one',
    big: 'O(log n) per add, O(1) median',
    trap: 'Forgetting the minus sign when reading <code>low[0]</code>. Rebalance after every add',
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []   # max-heap, stored as negatives
        self.high = []  # min-heap
    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))
    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
    classic: 'LC 295 Find Median from Data Stream, LC 480 Sliding Window Median' },
  { title: 'Linked list: dummy, reverse, fast/slow', pic: PIC.linked,
    when: 'Reverse, merge, remove the nth from the end, cycle, middle of a linked list',
    move: 'Reverse: save next, point back, step. Middle and cycle: slow +1, fast +2. Dummy head when the first node can change',
    big: 'O(n) time, O(1) space',
    trap: 'Losing the rest of the list: save <code>head.next</code> before you change it',
    code: `def reverse(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow  # fast is slow again: a cycle

# dummy = ListNode(0, head); edit; return dummy.next`,
    classic: 'LC 206 Reverse Linked List, LC 21 Merge Two Sorted Lists, LC 141 Linked List Cycle, LC 876 Middle of the Linked List' },
  { title: 'Tree DFS', pic: PIC.treeDfs,
    when: 'Depth, path sum, diameter, balanced, lowest common ancestor',
    move: 'Top-down: push (node, state) on a stack. Bottom-up: children first, then combine at the parent',
    big: 'O(n) time, O(height) space',
    trap: 'Recursion limit is 1000; a skewed tree of 10^4 nodes crashes. Use a stack, or <code>sys.setrecursionlimit(10**5)</code>',
    code: `def diameter(root):
    height = {None: 0}
    best = 0
    stack = [(root, False)]
    while stack:
        node, children_done = stack.pop()
        if node is None:
            continue
        if children_done:
            left, right = height[node.left], height[node.right]
            best = max(best, left + right)
            height[node] = 1 + max(left, right)
        else:
            stack.append((node, True))
            stack += [(node.left, False), (node.right, False)]
    return best`,
    classic: 'LC 104 Maximum Depth of Binary Tree, LC 543 Diameter of Binary Tree, LC 112 Path Sum, LC 236 Lowest Common Ancestor of a Binary Tree' },
  { title: 'Tree BFS (level order)', pic: PIC.treeBfs,
    when: 'Level by level, right side view, zigzag, minimum depth',
    move: 'deque; process exactly len(queue) nodes per level',
    big: 'O(n) time, O(width) space',
    trap: 'Read <code>len(queue)</code> before the inner loop; it grows as you add children',
    code: `from collections import deque

def level_order(root):
    levels = []
    queue = deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            for child in (node.left, node.right):
                if child:
                    queue.append(child)
        levels.append(level)
    return levels`,
    classic: 'LC 102 Binary Tree Level Order Traversal, LC 199 Binary Tree Right Side View, LC 111 Minimum Depth of Binary Tree' },
  { title: 'BST', pic: PIC.bst,
    when: 'Binary search tree: validate, k-th smallest, search, insert, range',
    move: 'In-order walk is sorted. Go left if target &lt; node, else right',
    big: 'O(height): log n if balanced, n if skewed',
    trap: 'Checking a node only against its children. Each node must fit the (low, high) bounds of all ancestors',
    code: `def kth_smallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right`,
    classic: 'LC 98 Validate Binary Search Tree, LC 230 Kth Smallest Element in a BST, LC 235 Lowest Common Ancestor of a BST, LC 700 Search in a BST' },
  { title: 'Graph BFS/DFS', pic: PIC.graph,
    when: 'Fewest steps with equal edge cost, reachable, connected components, word ladder',
    move: 'Adjacency list; BFS with a deque for fewest steps, DFS with a stack for reachability',
    big: 'O(V + E)',
    trap: 'Mark seen when you push, not when you pop, or nodes enter the queue many times',
    code: `from collections import defaultdict, deque

def fewest_steps(edges, start, goal):
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == goal:
            return dist[node]
        for nxt in graph[node]:
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return -1`,
    classic: 'LC 1971 Find if Path Exists in Graph, LC 133 Clone Graph, LC 127 Word Ladder, LC 841 Keys and Rooms' },
  { title: 'Topological sort', pic: PIC.topo,
    when: 'Order with dependencies, prerequisites, build order, can all courses finish',
    move: 'Queue every node with in-degree 0; pop it, output it, lower the in-degree of its children',
    big: 'O(V + E)',
    trap: 'Edge direction: prerequisite → course. Fewer than n nodes out means a cycle',
    code: `from collections import deque

def course_order(n, prereqs):  # pairs (course, needs)
    children = [[] for _ in range(n)]
    indegree = [0] * n
    for course, need in prereqs:
        children[need].append(course)
        indegree[course] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in children[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []  # [] = cycle`,
    classic: 'LC 207 Course Schedule, LC 210 Course Schedule II, LC 269 Alien Dictionary' },
  { title: 'Union-find', pic: PIC.unionFind,
    when: 'Connected groups, merging sets or accounts, redundant edge, number of provinces',
    move: 'parent array; find walks up to the root, union links two roots',
    big: 'Nearly O(1) per call with path halving',
    trap: 'Linking the nodes instead of their roots. Union of two nodes already joined means a cycle',
    code: `def count_groups(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path halving
            x = parent[x]
        return x

    groups = n
    for a, b in edges:
        root_a, root_b = find(a), find(b)
        if root_a != root_b:
            parent[root_a] = root_b
            groups -= 1
    return groups`,
    classic: 'LC 547 Number of Provinces, LC 684 Redundant Connection, LC 721 Accounts Merge' },
  { title: 'Dijkstra', pic: PIC.dijkstra,
    when: 'Weighted shortest path, cheapest route, network delay, least effort path',
    move: 'Heap of (distance, node); pop the closest, relax its edges',
    big: 'O(E log V)',
    trap: 'Negative weights break it. Skip popped entries whose distance is stale',
    code: `import heapq

def dijkstra(graph, start):  # graph[u] = [(v, weight), ...]
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue  # stale entry
        for nxt, weight in graph.get(node, []):
            new_d = d + weight
            if new_d < dist.get(nxt, float("inf")):
                dist[nxt] = new_d
                heapq.heappush(heap, (new_d, nxt))
    return dist`,
    classic: 'LC 743 Network Delay Time, LC 1631 Path With Minimum Effort, LC 1514 Path with Maximum Probability' },
  { title: 'Backtracking', pic: PIC.backtrack,
    when: 'All combinations, permutations, subsets, n ≤ 20, place queens, word search',
    move: 'Choose, explore, undo. Start index for combinations; a used set for permutations',
    big: 'O(2^n) subsets, O(n!) permutations',
    trap: 'Saving <code>path</code> instead of <code>path[:]</code> stores one list many times. Undo every choice',
    code: `def subsets(nums):
    result, path = [], []
    def backtrack(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])  # choose
            backtrack(i + 1)      # explore
            path.pop()            # undo

    backtrack(0)
    return result`,
    classic: 'LC 78 Subsets, LC 46 Permutations, LC 39 Combination Sum, LC 79 Word Search' },
  { title: 'DP 1D', pic: () => pic('dp'),
    when: 'Count ways, min cost, max value with a choice at each step along a line',
    move: 'Say dp[i] in words, write the recurrence, fill left to right. Two variables if you only look back two',
    big: 'O(n × choices)',
    trap: 'Wrong base case. Write the state first: dp[a] = fewest coins that make a',
    code: `def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount  # dp[a] = fewest coins for a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] < INF else -1

def rob(houses):
    take = skip = 0
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)`,
    classic: 'LC 70 Climbing Stairs, LC 198 House Robber, LC 322 Coin Change, LC 300 Longest Increasing Subsequence' },
  { title: 'DP 2D', pic: PIC.dp2,
    when: 'Two strings or a grid: edit distance, LCS, unique paths, knapsack',
    move: 'dp[i][j] from up, left and diagonal; add a padding row and column of 0',
    big: 'O(n × m) time; one row of memory if needed',
    trap: '<code>[[0] * m] * n</code> shares one row n times. dp[i] matches a[i − 1]',
    code: `def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]`,
    classic: 'LC 1143 Longest Common Subsequence, LC 72 Edit Distance, LC 62 Unique Paths, LC 416 Partition Equal Subset Sum' },
  { title: 'Trie', pic: PIC.trie,
    when: 'Prefix of words, autocomplete, starts with, search many words at once',
    move: 'Nested dicts, one level per character; mark where a word ends',
    big: 'O(L) per word, L = word length',
    trap: 'A prefix is not a word: check the end marker',
    code: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True  # end of word
    def search(self, word, prefix=False):
        node = self.root
        for ch in word:
            if ch not in node:
                return False
            node = node[ch]
        return prefix or "$" in node`,
    classic: 'LC 208 Implement Trie, LC 211 Design Add and Search Words, LC 212 Word Search II' },
  { title: 'Bit tricks', pic: PIC.bits,
    when: 'Single number among pairs, power of two, count bits, subsets as masks',
    move: 'x ^ x = 0; x &amp; (x − 1) drops the lowest 1; 1 &lt;&lt; i is bit i',
    big: 'O(1) per operation; O(2^n × n) over all masks',
    trap: 'Python ints never overflow and ~x is negative: mask with <code>&amp; 0xFFFFFFFF</code> for 32-bit questions',
    code: `def single_number(nums):
    result = 0
    for x in nums:
        result ^= x  # pairs cancel out
    return result

def is_power_of_two(x):
    return x > 0 and (x & (x - 1)) == 0

def all_subsets(items):
    n = len(items)
    return [[items[i] for i in range(n) if mask >> i & 1]
            for mask in range(1 << n)]

# bin(x).count("1") counts 1 bits; x & -x is the lowest 1 bit`,
    classic: 'LC 136 Single Number, LC 191 Number of 1 Bits, LC 231 Power of Two, LC 268 Missing Number' },
  { title: 'Math', pic: () => pic('math'),
    when: 'GCD, primes, modulo 10^9 + 7, digits of a number, reverse an integer',
    move: 'Use the formula or the library: <code>math.gcd</code>, <code>pow(b, e, mod)</code>, <code>divmod</code> for digits',
    big: 'Sieve O(n log log n); gcd O(log n)',
    trap: '-7 // 2 is -4 (floors); use <code>int(a / b)</code> to round toward 0. Take % MOD at each step',
    code: `import math

def primes_up_to(n):
    is_prime = [False, False] + [True] * (n - 1)
    for i in range(2, math.isqrt(n) + 1):
        if is_prime[i]:
            for multiple in range(i * i, n + 1, i):
                is_prime[multiple] = False
    return [i for i in range(n + 1) if is_prime[i]]

MOD = 10**9 + 7
# lcm = a * b // math.gcd(a, b)
# pow(base, exp, MOD) is fast modular power
# digits: while x: x, d = divmod(x, 10)`,
    classic: 'LC 204 Count Primes, LC 50 Pow(x, n), LC 9 Palindrome Number, LC 7 Reverse Integer' },
  { title: 'Matrix traversal', pic: PIC.matrix,
    when: 'Grid of cells: islands, flood fill, spiral order, rotate image',
    move: 'Four direction pairs, bounds check, a seen set. Rotate: <code>zip(*grid[::-1])</code>',
    big: 'O(rows × cols)',
    trap: 'grid[r][c] is row first. Mark seen when you push. Ask before changing the input grid',
    code: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen, islands = set(), 0
    def land(i, j):
        return 0 <= i < rows and 0 <= j < cols and grid[i][j] == "1"
    for r in range(rows):
        for c in range(cols):
            if not land(r, c) or (r, c) in seen:
                continue
            islands += 1
            seen.add((r, c))
            stack = [(r, c)]
            while stack:
                i, j = stack.pop()
                for ni, nj in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
                    if land(ni, nj) and (ni, nj) not in seen:
                        seen.add((ni, nj))
                        stack.append((ni, nj))
    return islands`,
    classic: 'LC 200 Number of Islands, LC 733 Flood Fill, LC 54 Spiral Matrix, LC 48 Rotate Image' },
  { title: 'Simulation and parsing', pic: () => pic('greedy-sim'),
    when: 'Parse commands, move a robot, follow rules step by step, simplify a path',
    move: 'State in variables, rules as data (dicts, direction lists), one step per command',
    big: 'O(number of commands)',
    trap: 'Not stripping input before split. Unknown commands silently ignored. (d − 1) % 4 stays in 0..3',
    code: `def run(program):
    moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # N, E, S, W
    x = y = d = 0
    for token in program.strip().split():
        op, arg = token[0], token[1:]
        if op == "L":
            d = (d - 1) % 4
        elif op == "R":
            d = (d + 1) % 4
        elif op == "F":
            x += moves[d][0] * int(arg)
            y += moves[d][1] * int(arg)
        else:
            raise ValueError("bad command: " + token)
    return x, y`,
    classic: 'LC 874 Walking Robot Simulation, LC 1041 Robot Bounded In Circle, LC 71 Simplify Path, LC 8 String to Integer (atoi)' },
  { title: 'Design: combine structures', pic: PIC.lru,
    when: 'get/put in O(1) with eviction, rate limit, hit counter, design a class',
    move: 'One structure per need: dict for lookup, OrderedDict or deque for order',
    big: 'O(1) per get/put; amortized O(1) per hit',
    trap: 'A put on an existing key must also move it to the end. Evict after inserting, only when over capacity',
    code: `from collections import OrderedDict, deque

class LRUCache:
    def __init__(self, capacity):
        self.capacity, self.data = capacity, OrderedDict()
    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]
    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)

class RateLimiter:  # at most limit hits per window seconds
    def __init__(self, limit, window):
        self.limit, self.window, self.hits = limit, window, deque()
    def allow(self, now):
        while self.hits and self.hits[0] <= now - self.window:
            self.hits.popleft()
        if len(self.hits) < self.limit:
            self.hits.append(now)
            return True
        return False`,
    classic: 'LC 146 LRU Cache, LC 359 Logger Rate Limiter, LC 362 Design Hit Counter, LC 380 Insert Delete GetRandom O(1)' }
];

/* ---------- signal -> pattern ---------- */
const SPOT = [
  ['Seen before, count, duplicates, anagrams', 'Hash map and counting'],
  ['Pair that sums to x, unsorted input', 'Hash map and counting'],
  ['Sorted input + pair or triplet; palindrome', 'Two pointers'],
  ['Longest or shortest substring or subarray with a rule', 'Sliding window'],
  ['Subarray sum equals k; many range sums', 'Prefix sums'],
  ['Sorted array, find a value or position; O(log n)', 'Binary search'],
  ['Minimum feasible speed, capacity or days; minimize the max', 'Binary search on the answer'],
  ['Best order or most items within a limit', 'Sorting and greedy'],
  ['Overlapping intervals, meeting rooms, merge ranges', 'Intervals'],
  ['Brackets, undo, backspace, nested strings like 3[a2[c]]', 'Stack'],
  ['Next greater, previous smaller, days until warmer', 'Monotonic stack'],
  ['K-th, top k, smallest k, merge k sorted', 'Heap: top k and k-way merge'],
  ['Running median of a stream', 'Two heaps'],
  ['Cycle or middle of a linked list; reverse a list', 'Linked list: dummy, reverse, fast/slow'],
  ['Tree depth, path sum, diameter, ancestor', 'Tree DFS'],
  ['Level by level, right side view, min depth', 'Tree BFS (level order)'],
  ['Binary search tree: validate, k-th smallest', 'BST'],
  ['Fewest steps on a grid or graph, equal edge cost', 'Graph BFS/DFS'],
  ['Order with dependencies, prerequisites', 'Topological sort'],
  ['Connected groups, merging sets, redundant edge', 'Union-find'],
  ['Weighted shortest path, cheapest route', 'Dijkstra'],
  ['All combinations, permutations, subsets', 'Backtracking'],
  ['n ≤ 20', 'Backtracking or bitmask'],
  ['Count ways, min cost, max value with choices', 'DP 1D'],
  ['Two strings or a grid: edit distance, LCS, paths', 'DP 2D'],
  ['Prefix of words, autocomplete', 'Trie'],
  ['Single number among pairs, power of two, count bits', 'Bit tricks'],
  ['GCD, primes, answer modulo 10^9 + 7, digits', 'Math'],
  ['Islands, flood fill, spiral, rotate a grid', 'Matrix traversal'],
  ['Parse commands, move a robot', 'Simulation and parsing'],
  ['get/put in O(1) with eviction, rate limiter', 'Design: combine structures']
];

function spotCard() {
  return { title: 'Spot the pattern', html: SHEET.H.pairs(SPOT) };
}
function card(p) {
  const H = SHEET.H;
  return { title: p.title, html: p.pic() + H.facts([['When', p.when], ['Move', p.move], ['Big-O', p.big], ['Trap', p.trap]]) + code(p.code) + H.facts([['Classic', p.classic]]) };
}
function cards() { return [spotCard()].concat(P.map(card)); }
const order = ['Spot the pattern'].concat(P.map(p => p.title));
window.PATTERN_MAP = { cards, spotCard, order };
})();
