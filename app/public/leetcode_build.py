#!/usr/bin/env python3
"""Build public/leetcode.json: the LeetCode problem index (titles, links, difficulty, topic tags only,
never problem statements) plus a curated core list grouped by pattern.

Input: a metadata dump from LeetCode's public GraphQL problem list (see tools/fetch_leetcode.py),
saved as a JSON array of {frontendQuestionId, title, titleSlug, difficulty, isPaidOnly, topicTags, acRate}."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'leetcode-raw.json')

# The core list: classic problems for each pattern, easiest first within a group.
# `ex` is the Explained topic that teaches the pattern.
CORE = [
    ('Arrays and hashing', 'hash-map', ['two-sum', 'contains-duplicate', 'valid-anagram', 'group-anagrams', 'top-k-frequent-elements', 'product-of-array-except-self', 'valid-sudoku', 'longest-consecutive-sequence', 'encode-and-decode-strings', 'subarray-sum-equals-k']),
    ('Two pointers', 'two-pointers', ['valid-palindrome', 'two-sum-ii-input-array-is-sorted', '3sum', 'container-with-most-water', 'trapping-rain-water', 'move-zeroes', 'sort-colors']),
    ('Sliding window', 'sliding-window', ['best-time-to-buy-and-sell-stock', 'longest-substring-without-repeating-characters', 'longest-repeating-character-replacement', 'permutation-in-string', 'minimum-window-substring', 'sliding-window-maximum', 'minimum-size-subarray-sum']),
    ('Stack', 'stack', ['valid-parentheses', 'min-stack', 'evaluate-reverse-polish-notation', 'generate-parentheses', 'daily-temperatures', 'car-fleet', 'largest-rectangle-in-histogram', 'decode-string']),
    ('Binary search', 'binary-search', ['binary-search', 'search-a-2d-matrix', 'koko-eating-bananas', 'find-minimum-in-rotated-sorted-array', 'search-in-rotated-sorted-array', 'time-based-key-value-store', 'median-of-two-sorted-arrays']),
    ('Linked list', 'linked-list', ['reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle', 'reorder-list', 'remove-nth-node-from-end-of-list', 'copy-list-with-random-pointer', 'add-two-numbers', 'find-the-duplicate-number', 'lru-cache', 'merge-k-sorted-lists', 'reverse-nodes-in-k-group']),
    ('Trees', 'binary-tree', ['invert-binary-tree', 'maximum-depth-of-binary-tree', 'diameter-of-binary-tree', 'balanced-binary-tree', 'same-tree', 'subtree-of-another-tree', 'lowest-common-ancestor-of-a-binary-search-tree', 'binary-tree-level-order-traversal', 'binary-tree-right-side-view', 'count-good-nodes-in-binary-tree', 'validate-binary-search-tree', 'kth-smallest-element-in-a-bst', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'binary-tree-maximum-path-sum', 'serialize-and-deserialize-binary-tree']),
    ('Tries', 'trie', ['implement-trie-prefix-tree', 'design-add-and-search-words-data-structure', 'word-search-ii']),
    ('Heap / priority queue', 'top-k-heap', ['kth-largest-element-in-a-stream', 'last-stone-weight', 'k-closest-points-to-origin', 'kth-largest-element-in-an-array', 'task-scheduler', 'design-twitter', 'find-median-from-data-stream']),
    ('Backtracking', 'backtracking', ['subsets', 'combination-sum', 'permutations', 'subsets-ii', 'combination-sum-ii', 'word-search', 'palindrome-partitioning', 'letter-combinations-of-a-phone-number', 'n-queens']),
    ('Graphs', 'graph', ['number-of-islands', 'max-area-of-island', 'clone-graph', 'walls-and-gates', 'rotting-oranges', 'pacific-atlantic-water-flow', 'surrounded-regions', 'course-schedule', 'course-schedule-ii', 'graph-valid-tree', 'number-of-connected-components-in-an-undirected-graph', 'redundant-connection', 'word-ladder']),
    ('Advanced graphs', 'dijkstra', ['reconstruct-itinerary', 'min-cost-to-connect-all-points', 'network-delay-time', 'swim-in-rising-water', 'alien-dictionary', 'cheapest-flights-within-k-stops']),
    ('1-D dynamic programming', 'dp-1d', ['climbing-stairs', 'min-cost-climbing-stairs', 'house-robber', 'house-robber-ii', 'longest-palindromic-substring', 'palindromic-substrings', 'decode-ways', 'coin-change', 'maximum-product-subarray', 'word-break', 'longest-increasing-subsequence', 'partition-equal-subset-sum']),
    ('2-D dynamic programming', 'dp-2d', ['unique-paths', 'longest-common-subsequence', 'best-time-to-buy-and-sell-stock-with-cooldown', 'coin-change-ii', 'target-sum', 'interleaving-string', 'longest-increasing-path-in-a-matrix', 'distinct-subsequences', 'edit-distance', 'burst-balloons', 'regular-expression-matching']),
    ('Greedy', 'greedy', ['maximum-subarray', 'jump-game', 'jump-game-ii', 'gas-station', 'hand-of-straights', 'merge-triplets-to-form-target-triplet', 'partition-labels', 'valid-parenthesis-string']),
    ('Intervals', 'merge-intervals', ['insert-interval', 'merge-intervals', 'non-overlapping-intervals', 'meeting-rooms', 'meeting-rooms-ii', 'minimum-interval-to-include-each-query']),
    ('Math and geometry', 'big-o', ['rotate-image', 'spiral-matrix', 'set-matrix-zeroes', 'happy-number', 'plus-one', 'powx-n', 'multiply-strings', 'detect-squares']),
    ('Bit manipulation', 'bit-manipulation', ['single-number', 'number-of-1-bits', 'counting-bits', 'reverse-bits', 'missing-number', 'sum-of-two-integers', 'reverse-integer']),
]

# filter chips: label -> LeetCode topic tags that count, and the Explained topic to link
PATTERNS = [
    ('Hashing', ['hash-table', 'counting'], 'hash-map'),
    ('Two pointers', ['two-pointers'], 'two-pointers'),
    ('Sliding window', ['sliding-window'], 'sliding-window'),
    ('Prefix sum', ['prefix-sum'], 'prefix-sums'),
    ('Stack', ['stack', 'monotonic-stack'], 'stack'),
    ('Binary search', ['binary-search'], 'binary-search'),
    ('Linked list', ['linked-list', 'doubly-linked-list'], 'linked-list'),
    ('Trees', ['tree', 'binary-tree', 'binary-search-tree'], 'binary-tree'),
    ('Trie', ['trie'], 'trie'),
    ('Heap', ['heap-priority-queue'], 'top-k-heap'),
    ('Backtracking', ['backtracking'], 'backtracking'),
    ('Graphs', ['graph', 'depth-first-search', 'breadth-first-search', 'union-find', 'topological-sort', 'shortest-path'], 'graph'),
    ('Dynamic programming', ['dynamic-programming', 'memoization'], 'dynamic-programming'),
    ('Greedy', ['greedy'], 'greedy'),
    ('Sorting', ['sorting'], 'sorting-overview'),
    ('Math', ['math', 'number-theory', 'geometry', 'combinatorics'], 'big-o'),
    ('Bits', ['bit-manipulation', 'bitmask'], 'bit-manipulation'),
    ('Design', ['design'], 'lru-cache'),
    ('SQL', ['database'], None),
]

raw = json.load(open(SRC, encoding='utf-8'))
tags = sorted({t['slug'] for q in raw for t in q['topicTags']})
tix = {t: i for i, t in enumerate(tags)}
D = {'Easy': 0, 'Medium': 1, 'Hard': 2}

def key(q):
    i = q['frontendQuestionId']
    return (0, int(i)) if i.isdigit() else (1, i)

rows = []
for q in sorted(raw, key=key):
    rows.append([q['frontendQuestionId'], q['title'], q['titleSlug'], D[q['difficulty']], 1 if q['isPaidOnly'] else 0,
                 [tix[t['slug']] for t in q['topicTags']], round(q['acRate'] or 0)])
slugs = {r[2] for r in rows}
missing = [s for _, _, L in CORE for s in L if s not in slugs]
assert not missing, 'core slugs not in the index: %s' % missing
dup = [s for s in {s for _, _, L in CORE for s in L} if sum(L.count(s) for _, _, L in CORE) > 1]
assert not dup, 'core slugs listed twice: %s' % dup
out = {
    'source': 'LeetCode public problem list (titles, links, difficulty, topic tags, acceptance). Statements are not copied.',
    'count': len(rows), 'tags': tags, 'rows': rows,
    'core': [{'name': n, 'ex': ex, 'slugs': L} for n, ex, L in CORE],
    'patterns': [{'name': n, 'tags': [tix[t] for t in T if t in tix], 'ex': ex} for n, T, ex in PATTERNS],
}
json.dump(out, open(os.path.join(HERE, 'leetcode.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('leetcode.json:', len(rows), 'problems,', sum(len(L) for _, _, L in CORE), 'in the core list,', len(tags), 'tags')
