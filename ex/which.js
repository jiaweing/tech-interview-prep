/* "Which one?" flowchart: from what the question says to the topic to read. window.WHICH = { html() } */
(function (root) {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FLOW = [
  ['A list or a string', [
    ['Longest or shortest substring or subarray with a rule', ['sliding-window']],
    ['Subarray sum equals k, or many range sums', ['prefix-sums']],
    ['Sorted, or a pair that hits a target', ['two-pointers', 'binary-search']],
    ['Seen before, count, duplicates, anagrams', ['hash-map', 'hash-set']],
    ['Top k, k-th largest, merge sorted lists', ['top-k-heap']],
    ['Overlapping ranges, meeting rooms', ['merge-intervals']],
    ['Next greater, brackets, undo', ['monotonic-stack', 'stack']],
    ['Best order, most items within a limit', ['greedy']],
    ['Largest sum of a run of numbers', ['kadane']]
  ]],
  ['A tree', [
    ['Level by level, closest to the root', ['bfs']],
    ['Sorted order, a range, valid BST', ['bst']],
    ['Depth, paths, an answer from each subtree', ['dfs', 'recursion']]
  ]],
  ['A graph or a grid', [
    ['Fewest steps, every move costs the same', ['bfs']],
    ['Moves have different costs', ['dijkstra']],
    ['Tasks with prerequisites, build order', ['topological-sort']],
    ['Groups that join as you go', ['union-find']],
    ['Count islands, flood fill', ['dfs', 'grid']]
  ]],
  ['A linked list', [
    ['Cycle, middle, k-th from the end', ['fast-slow-pointers']],
    ['Reverse, merge, remove nodes', ['linked-list']]
  ]],
  ['Choices and counting', [
    ['List every combination, permutation or subset', ['backtracking']],
    ['Count ways, min cost or max value; choices repeat', ['dp-1d', 'dynamic-programming']],
    ['Two strings, or a grid of states', ['dp-2d']]
  ]],
  ['Words and systems', [
    ['Prefix lookups, autocomplete', ['trie']],
    ['get and put in O(1), evict the oldest', ['lru-cache']],
    ['Powers of two, single number, flags', ['bit-manipulation']],
    ['Design a system that scales', ['load-balancer', 'caching', 'sharding']]
  ]]
];
function html() {
  const E = root.EXPLAIN, href = id => (root.EXPLAIN_HREF || (x => '#x-' + x))(id), name = id => (E && E.byId(id) || {}).title || id;
  return '<div class="ex-index"><div class="ex-hero"><h1>Which one?</h1></div><p class="ex-muted" style="margin:-8px 0 16px">Read the question, find what the input is, then the first line that sounds like it. Click a topic to learn it.</p>' +
    '<div class="wh-cols">' + FLOW.map(([b, qs]) => '<section class="wh-col"><h2>' + esc(b) + '</h2><ol class="wh-qs">' + qs.map(([q, ids]) => '<li><span>' + esc(q) + '</span><span class="wh-to">' + ids.map(id => '<a class="wh-leaf" href="' + href(id) + '">' + esc(name(id)) + '</a>').join('') + '</span></li>').join('') + '</ol></section>').join('') + '</div>' +
    '<p class="wh-foot"><b>Still unsure?</b> Let the input size decide: n up to 20, try every choice (backtracking). Up to 1,000, O(n²) is fine. Up to 100,000, you need O(n log n) or O(n).</p></div>';
}
root.WHICH = { html, FLOW };
})(typeof window !== 'undefined' ? window : globalThis);
