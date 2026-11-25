/* The course (home page, public edition): every pattern from zero, in order. Each unit has three parts:
   learn it (Explained lessons), practise it here (problems with hidden tests, by their pattern label),
   and the LeetCode classics for it (the core list). Progress comes from what you already do: lessons you
   opened, problems you solved here, LeetCode problems you ticked. Runs inside the main IIFE
   (uses esc, store, prog, PROBLEMS). */
const COURSE = (() => {
  const UNITS = [
    ['Python for interviews', 'Only the Python you need, and how to tell if code is fast enough', ['py-basics', 'py-lists', 'py-strings', 'py-dicts-sets', 'py-tuples', 'py-loops', 'py-comprehensions', 'py-functions', 'py-sorting', 'py-collections', 'py-math', 'py-gotchas', 'big-o'], [], []],
    ['Arrays, strings and hashing', 'Count, look up and group in one pass', ['array', 'string', 'hash-map', 'hash-set'], ['Hash map and counting'], ['Arrays and hashing']],
    ['Two pointers', 'Walk inward from both ends, or read and write in place', ['two-pointers'], ['Two pointers'], ['Two pointers']],
    ['Sliding window', 'The best stretch of a list or string, without rescanning', ['sliding-window'], ['Sliding window'], ['Sliding window']],
    ['Prefix sums and Kadane', 'Range sums in O(1); the best subarray in one pass', ['prefix-sums', 'kadane'], ['Prefix sums'], []],
    ['Simulation and parsing', 'Practical tasks: follow the rules exactly, keep them as data', ['grid'], ['Simulation and parsing', 'Matrix traversal'], ['Math and geometry']],
    ['Sorting and intervals', 'Sort first, then one scan; merge overlapping ranges', ['sorting-overview', 'insertion-sort', 'merge-sort', 'quick-sort', 'counting-sort', 'merge-intervals'], ['Intervals'], ['Intervals']],
    ['Stacks and queues', 'Matching brackets, next greater element, first in first out', ['stack', 'queue', 'deque', 'monotonic-stack'], ['Stack'], ['Stack']],
    ['Binary search', 'Halve a sorted range, or binary search the answer', ['binary-search'], ['Binary search', 'Binary search on the answer'], ['Binary search']],
    ['Linked lists', 'Dummy heads, reversing, fast and slow pointers', ['linked-list', 'fast-slow-pointers', 'lru-cache'], ['Linked list: dummy, reverse, fast/slow', 'Design: combine structures'], ['Linked list']],
    ['Trees', 'Recursion on the left and right child; level by level', ['recursion', 'binary-tree', 'bst', 'dfs', 'bfs'], ['Tree DFS', 'Tree BFS (level order)', 'BST'], ['Trees']],
    ['Heaps', 'The top k, the next smallest, merging sorted lists', ['heap', 'top-k-heap', 'py-heapq'], ['Heap: top k and k-way merge'], ['Heap / priority queue']],
    ['Tries', 'Prefix search over many words', ['trie'], [], ['Tries']],
    ['Graphs', 'Islands, shortest paths, dependencies, connected groups', ['graph', 'union-find', 'topological-sort', 'dijkstra'], ['Graph BFS/DFS'], ['Graphs', 'Advanced graphs']],
    ['Backtracking', 'Try a choice, recurse, undo: subsets, permutations, boards', ['backtracking'], [], ['Backtracking']],
    ['Dynamic programming', 'Reuse answers to smaller problems, in 1D and 2D tables', ['dynamic-programming', 'dp-1d', 'dp-2d'], ['DP 1D'], ['1-D dynamic programming', '2-D dynamic programming']],
    ['Greedy, math and bits', 'Take the locally best choice when it is provably safe; number tricks', ['greedy', 'bit-manipulation', 'py-math'], ['Sorting and greedy', 'Math', 'Bit tricks'], ['Greedy', 'Bit manipulation']],
    ['Interview ready', 'Timed mocks, system design, the behavioural round and the day itself', [], [], [], [['mock', 'Timed mock test'], ['testday', 'Interview day checklist'], ['sd', 'System design track'], ['dd', 'Behavioural round'], ['co', 'Your company\'s rounds']]],
  ];
  const LC = window.LC_DATA || { rows: [], core: [] };
  const lcRow = {}; LC.rows.forEach(r => { lcRow[r[2]] = r; });
  const coreBy = {}; (LC.core || []).forEach(g => { coreBy[g.name] = g.slugs; });
  const fine = id => ((window.PAT_FINE || {})[id] || '');
  const exTitle = id => { const t = window.EXPLAIN && EXPLAIN.byId ? EXPLAIN.byId(id) : null; return (t && t.title) || id; };
  const DIFF = ['Easy', 'Medium', 'Hard'];
  const seen = () => store.get('exSeen', {}), visited = () => store.get('crsVisit', {});
  // opening a lesson or a final-unit page counts as done
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (h.startsWith('x-')) { const s = seen(); if (!s[h.slice(2)]) { s[h.slice(2)] = Date.now(); store.set('exSeen', s); } }
    if (['testday', 'sd', 'dd', 'co'].includes(h)) { const v = visited(); if (!v[h]) { v[h] = Date.now(); store.set('crsVisit', v); } }
  });

  function units() {
    const S = seen(), solved = prog.solved(), L = store.get('lcDone', {}), V = visited();
    return UNITS.map(([title, why, ex, labels, groups, extra], i) => {
      const probs = PROBLEMS.filter(p => labels.includes(fine(p.id))).sort((a, b) => (a.level === 'easy' ? 0 : a.level === 'medium' ? 1 : 2) - (b.level === 'easy' ? 0 : b.level === 'medium' ? 1 : 2));
      const slugs = [].concat(...groups.map(g => coreBy[g] || [])).filter(s => lcRow[s]);
      const items = ex.map(id => ({ k: 'x-' + id, done: !!S[id] }))
        .concat(probs.map(p => ({ k: 'p-' + p.id, done: !!solved[p.id] })))
        .concat(slugs.map(s => ({ k: 'lc:' + s, done: !!L[s] })))
        .concat((extra || []).map(([h]) => ({ k: h, done: h === 'mock' ? !!store.get('mockDone', 0) : !!V[h] })));
      return { i, title, why, ex, probs, slugs, extra: extra || [], items, done: items.filter(x => x.done).length };
    });
  }
  function nextItem(U) {
    for (const u of U) { const it = u.items.find(x => !x.done); if (it) return { u, it }; }
    return null;
  }
  function label(k) {
    if (k.startsWith('x-')) return 'Learn: ' + exTitle(k.slice(2));
    if (k.startsWith('p-')) return 'Solve: ' + ((probById[k.slice(2)] || {}).title || k);
    if (k.startsWith('lc:')) { const r = lcRow[k.slice(3)]; return 'LeetCode ' + r[0] + ': ' + r[1]; }
    const e = UNITS[UNITS.length - 1][5].find(x => x[0] === k); return e ? e[1] : k;
  }
  const href = k => k.startsWith('lc:') ? 'https://leetcode.com/problems/' + k.slice(3) + '/' : '#' + k;
  const ext = k => k.startsWith('lc:') ? ' target="_blank" rel="noopener noreferrer"' : '';
  const tick = done => '<span class="sdot ' + (done ? 'solved' : '') + '">' + (done ? '✓' : '') + '</span>';

  function unitHTML(u, open) {
    const S = seen(), solved = prog.solved(), L = store.get('lcDone', {}), V = visited();
    return '<details class="crs-u' + (u.done === u.items.length ? ' all' : '') + '"' + (open ? ' open' : '') + '><summary><span class="crs-n">' + (u.i + 1) + '</span><span class="crs-t"><b>' + esc(u.title) + '</b><span class="muted">' + esc(u.why) + '</span></span><span class="crs-c">' + u.done + '/' + u.items.length + '</span></summary><div class="crs-b">' +
      (u.ex.length ? '<h4>Learn</h4><div class="crs-chips">' + u.ex.map(id => '<a class="chip' + (S[id] ? ' crs-ok' : '') + '" href="#x-' + esc(id) + '">' + (S[id] ? '✓ ' : '') + esc(exTitle(id)) + '</a>').join('') + '</div>' : '') +
      (u.probs.length ? '<h4>Practise here <span class="muted">hidden tests, in the editor</span></h4><div class="plist">' + u.probs.map(p => '<a class="prow" href="#p-' + esc(p.id) + '">' + tick(!!solved[p.id]) + '<span class="ttl">' + esc(p.title) + '</span><span class="lvl ' + esc(p.level) + '">' + esc(p.level) + '</span></a>').join('') + '</div>' : '') +
      (u.slugs.length ? '<h4>LeetCode classics <span class="muted">tick them when you solve them</span></h4><div class="plist">' + u.slugs.map(s => { const r = lcRow[s]; return '<div class="prow crs-lc"><button type="button" class="sdot lc-tick' + (L[s] ? ' solved' : '') + '" data-slug="' + esc(s) + '" aria-pressed="' + !!L[s] + '" aria-label="Mark ' + esc(r[1]) + ' done">' + (L[s] ? '✓' : '') + '</button><a class="ttl" href="https://leetcode.com/problems/' + esc(s) + '/" target="_blank" rel="noopener noreferrer">' + esc(r[0]) + '. ' + esc(r[1]) + '</a><span class="lvl ' + DIFF[r[3]].toLowerCase() + '">' + DIFF[r[3]] + '</span></div>'; }).join('') + '</div>' : '') +
      (u.extra.length ? '<div class="plist">' + u.extra.map(([h, t]) => '<a class="prow" href="#' + esc(h) + '">' + tick(h === 'mock' ? !!store.get('mockDone', 0) : !!V[h]) + '<span class="ttl">' + esc(t) + '</span><span></span></a>').join('') + '</div>' : '') +
      '</div></details>';
  }

  function render(page) {
    const host = document.createElement('section'); host.className = 'crs';
    const paint = () => {
      const U = units(), all = U.reduce((a, u) => a + u.items.length, 0), dn = U.reduce((a, u) => a + u.done, 0), nx = nextItem(U);
      host.innerHTML = '<div class="day-h"><h2>The course</h2><span class="muted">' + U.length + ' units from zero to interview-ready · ' + dn + ' of ' + all + ' done</span></div>' +
        '<div class="lc-bar crs-bar"><i style="width:' + (all ? (100 * dn / all).toFixed(1) : 0) + '%"></i></div>' +
        (nx ? '<a class="nextup" href="' + esc(href(nx.it.k)) + '"' + ext(nx.it.k) + '><span class="muted">Up next · unit ' + (nx.u.i + 1) + ', ' + esc(nx.u.title) + '</span><span class="nu-t">' + esc(label(nx.it.k)) + '</span><span class="btn primary">Start →</span></a>' : '') +
        '<div class="crs-list">' + U.map(u => unitHTML(u, nx && nx.u.i === u.i)).join('') + '</div>';
    };
    host.addEventListener('click', e => {
      const t = e.target.closest('.lc-tick'); if (!t) return;
      e.preventDefault();
      const d = store.get('lcDone', {}), s = t.dataset.slug;
      if (d[s]) delete d[s]; else { d[s] = Date.now(); try { APP10K.xp(5, 'LeetCode problem'); } catch (er) { /* no xp */ } }
      store.set('lcDone', d);
      const openUnits = Array.from(host.querySelectorAll('details[open] .crs-n')).map(x => x.textContent);
      paint();
      host.querySelectorAll('details').forEach(dt => { dt.open = openUnits.includes(dt.querySelector('.crs-n').textContent); });
    });
    paint(); page.appendChild(host);
  }
  return { render, units: () => units().map(u => ({ title: u.title, done: u.done, total: u.items.length })) };
})();
window.COURSE = COURSE;
