/* "Which pattern?" flowchart above the coding cheatsheets. Click a pattern to jump to its card. */
(function () {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// [branch, [[question, [pattern titles]] ...]], checked top to bottom inside each branch
const FLOW = [
  ['Array or string', [
    ['Longest or shortest substring or subarray with a rule', ['Sliding window']],
    ['Subarray sum equals k, or many range sums', ['Prefix sums']],
    ['Sorted, or a pair or triplet that hits a target', ['Two pointers', 'Binary search']],
    ['Seen before, count, duplicates, anagrams', ['Hash map and counting']],
    ['Top k, k-th largest, merge sorted lists', ['Heap: top k and k-way merge']],
    ['Median of a stream', ['Two heaps']],
    ['Overlapping ranges, meeting rooms', ['Intervals']],
    ['Next greater, brackets, undo', ['Monotonic stack', 'Stack']],
    ['"Smallest speed, capacity or days so that it works"', ['Binary search on the answer']],
    ['Best order, most items within a limit', ['Sorting and greedy']],
    ['2D matrix: spiral, rotate, walk', ['Matrix traversal']]
  ]],
  ['Tree', [
    ['Level by level, closest to the root', ['Tree BFS (level order)']],
    ['Sorted order, a range, valid BST', ['BST']],
    ['Depth, paths, an answer from each subtree', ['Tree DFS']]
  ]],
  ['Graph or grid', [
    ['Fewest steps, every move costs the same', ['Graph BFS/DFS']],
    ['Moves have different costs', ['Dijkstra']],
    ['Tasks with prerequisites, build order', ['Topological sort']],
    ['Groups that join as you go', ['Union-find']],
    ['Count islands, flood fill', ['Graph BFS/DFS']]
  ]],
  ['Linked list', [
    ['Cycle, middle, k-th from the end', ['Linked list: dummy, reverse, fast/slow']],
    ['Reverse, merge, remove nodes', ['Linked list: dummy, reverse, fast/slow']]
  ]],
  ['Choices and counting', [
    ['List every combination, permutation or subset', ['Backtracking']],
    ['Count ways, min cost or max value; choices repeat', ['DP 1D']],
    ['Two strings, or a grid of states', ['DP 2D']]
  ]],
  ['Words, rules, systems', [
    ['Prefix lookups, autocomplete', ['Trie']],
    ['Follow commands, move a robot, parse text', ['Simulation and parsing']],
    ['get and put in O(1), eviction, rate limits', ['Design: combine structures']],
    ['Powers of two, single number, flags', ['Bit tricks']],
    ['Primes, gcd, digits, modulo', ['Math']]
  ]]
];
function html() {
  return '<section class="pflow" aria-label="Which pattern flowchart"><h2>Which pattern?</h2>' +
    '<div class="pf-root">Read the question. What is the input?</div><div class="pf-bus" aria-hidden="true"></div>' +
    '<div class="pf-cols">' + FLOW.map(([b, qs]) => '<div class="pf-col"><div class="pf-head">' + esc(b) + '</div><ol class="pf-qs">' +
      qs.map(([q, ps]) => '<li class="pf-q"><span class="pf-ask">' + esc(q) + '</span><span class="pf-to">' + ps.map(p => '<button type="button" class="pf-leaf" data-card="' + esc(p) + '">' + esc(p) + '</button>').join('') + '</span></li>').join('') +
      '</ol></div>').join('') + '</div>' +
    '<div class="pf-foot"><b>Still unsure?</b> Let the input size decide: n ≤ 20 → Backtracking · n ≤ 1,000 → O(n²) is fine · n ≤ 100,000 → O(n log n) or O(n)</div></section>';
}
function mount(host) {
  const box = host.querySelector('.sheet-test'); if (!box) return;
  const wrap = document.createElement('div'); wrap.innerHTML = html();
  const el = wrap.firstChild; box.parentNode.insertBefore(el, box);
  el.addEventListener('click', e => {
    const b = e.target.closest('.pf-leaf'); if (!b) return;
    const t = b.dataset.card;
    const sec = Array.from(box.querySelectorAll('.sec')).find(s => { const h = s.querySelector('.sec-title h2'); return h && h.textContent.trim() === t; });
    if (!sec) return;
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sec.classList.remove('pf-flash'); void sec.offsetWidth; sec.classList.add('pf-flash');
  });
}
function card() {
  const h = html().replace('<section class="pflow" aria-label="Which pattern flowchart"><h2>Which pattern?</h2>', '<section class="pflow pflow-card" aria-label="Which pattern flowchart">');
  return { title: 'Which pattern?', html: h, wide: true };
}
function bind(host) {
  host.addEventListener('click', e => {
    const b = e.target.closest('.pf-leaf'); if (!b) return;
    if (window.SHEET && SHEET.focus) SHEET.focus(host, b.dataset.card);
  });
}
window.PFLOW = { mount, card, bind };
})();
