# Problem format

Each coding problem is one JSON file, `app/content/problems/<id>.json`. Read `app/content/problems/mars-rover.json` and `app/content/problems/valid-bst.json` first: they are good examples. Check a file with:

```sh
python3 tools/verify_problem.py app/content/problems/<id>.json
```

It runs the reference solution on every test, times the speed test, and cross-checks the brute-force solution. Fix the file until it prints OK with no ERROR.

## Voice

Plain, direct English. Short sentences. Second person. No marketing words and no emoji. Concrete numbers over adjectives. Explain why, not just what. HTML strings may use only `<p> <b> <i> <code> <ul> <ol> <li> <br> <a href="#...">`, with balanced tags; write `<` as `&lt;` inside text. Write problems in your own words: a classic problem may keep its core idea, but never copy a statement from LeetCode or another site.

## Fields

- `id` (kebab-case, same as the file name), `title`, `pattern` (one of: hashing, prefix-sums, sorting, two-pointers, stack, kadane, binary-search, math, greedy-sim, dp, strings, linked-list, trees, heap, trie, graphs, backtracking, intervals, bits, greedy), `level` (easy, medium or hard).
- `fine`: the finer pattern label used by the course and the cheatsheet, for example `Tree DFS`, `Graph BFS/DFS`, `Topological sort`, `Union-find`, `Shortest path`, `Trie`, `Backtracking`, `Intervals`, `Bit tricks`, `Sorting and greedy`, `Heap: top k and k-way merge`, `Linked list: dummy, reverse, fast/slow`.
- `statement` (HTML): it must say `Write <code>def solution(...)</code>` and define the return value exactly.
- `examples`: a list of `{input: "a = [..], k = 2", output: "<python literal>", why: "<html>"}`; each output must evaluate to the matching test's `expected`.
- `constraints`: a list of HTML strings with ranges (use `&le;`).
- `starter`: `def solution(...):\n    # write your code here\n    pass\n`
- `think`: exactly 6 steps named Understand, Small example by hand, Naive idea, Which pattern?, Plan in plain steps, Edge cases to test. Each is `{step, q, a}` (HTML).
- `hints`: 3 hints, each giving a little more away (HTML).
- `solution`: clean, idiomatic, commented Python 3, standard library only (`collections`, `heapq`, `bisect`, `re`, `itertools` and `math` are fine).
- `brute`: a simpler, slower, correct solution with the same signature.
- `explain` (an HTML walkthrough on an example) and `complexity` (one line).
- `tests`: 9-14 tests `{args: [...], expected: ..., label, cat, why}`. The first tests are the examples, in order, with `cat: "example"` and a label containing "example". Other values of `cat`: empty, single, small, zero, boundary, dupes, medium, edge, negative, large. Generate `expected` by running your solution and cross-check with the brute force. Arguments and expected values must be JSON (lists, not tuples or sets).
- `perf`: `{label: "performance: ...", gen: "<python expression producing the args list>", expected}`. It must be deterministic (no random; use arithmetic such as `(i * 7919) % 1000`), and the reference solution must run in under 0.06 s in CPython, while an O(N²) brute force would be clearly slower.

## Data shapes

- Linked lists are a Python list of values, `[]` for an empty list. The statement says so; solutions may build nodes if they like.
- Trees use LeetCode's level-order list: `tree[0]` is the root, then the children of each node left before right, `None` for a missing child; `[]` is the empty tree.
- Graphs are an edge list or an adjacency list, stated exactly. Grids are lists of strings.

## The browser runs Python with Brython

It is about 20 times slower than CPython, so:

- In `perf.gen`, never name comprehension variables `t, r, f, e, o, args, res, out, st`; use `a, b, q, i, j, k, x, y`.
- No recursion deeper than about 400 in the reference solution: use an explicit stack or a deque for deep inputs.
- No regex with optional groups or `(?:^|\s)`. Call `.strip()` before `.split()`.
- No `match`, no walrus operator, no type-hint generics.
