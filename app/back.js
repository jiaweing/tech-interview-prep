/* One back button rule for every page: go to the page you came from in this realm, else the page's parent. Runs inside the main IIFE. */
const BACK = (() => {
  const ROOTS = new Set(['home', 'problems', 'cheatsheet', 'drill', 'rush', 'cards', 'mock', 'sd', 'sd-practice', 'sd-cheat', 'sd-drill', 'sd-board', 'dd', 'dd-questions', 'dd-mock', 'al', 'al-practice', 'dd-cheat', 'al-cheat', 'me', 'trophies', 'me-rounds', 'me-trophies', 'ex-py', 'ex-ds', 'ex-algo', 'ex-sd', 'ex-which']);
  const NAMES = { home: 'Learn', problems: 'Practice', cheatsheet: 'Cheatsheet', mock: 'Mock test', drill: 'Pattern drill', rush: '60s rush', cards: 'Flashcards', testday: 'Interview day', trophies: 'Trophies', sd: 'System design', 'sd-practice': 'Practice', 'sd-designs': 'Designs', 'sd-cheat': 'Cheatsheet', 'sd-drill': 'Quick drill', 'sd-board': 'Whiteboard', dd: 'Prep', 'dd-questions': 'Questions', 'dd-mock': 'Mock', al: 'Prep', 'al-practice': 'Practice', 'dd-cheat': 'Cheatsheet', 'al-cheat': 'Cheatsheet', 'ex-py': 'Python', 'ex-ds': 'Data structures', 'ex-algo': 'Algorithms', 'ex-sd': 'System design', 'ex-which': 'Which one?' };
  let stack = [], stackRealm = '';
  const find = (arr, id) => (arr || []).find(x => x.id === id) || {};
  function name(h) {
    if (NAMES[h]) return NAMES[h];
    const S = window.SD_DATA || {};
    if (h.startsWith('p-')) return (probById[h.slice(2)] || {}).title || 'Problem';
    if (h.startsWith('pattern-')) return (patById[h.slice(8)] || {}).name || 'Pattern';
    if (h.startsWith('lesson-')) return (lessonById[h.slice(7)] || {}).title || 'Lesson';
    if (h.startsWith('sd-d-')) return find(S.designs, h.slice(5)).title || 'Design';
    if (h.startsWith('sd-c-')) return find(S.concepts, h.slice(5)).title || 'Concept';
    if (h.startsWith('sd-q-')) return find(S.practice, h.slice(5)).title || 'Practice';
    if (h.startsWith('x-') && window.EXPLAIN && EXPLAIN.byId(h.slice(2))) return EXPLAIN.byId(h.slice(2)).title;
    return 'Back';
  }
  function parent(realm, h) {
    if (realm === 'sd') return h.startsWith('sd-q-') ? 'sd-practice' : 'sd';
    if (realm === 'dd') return 'dd';
    if (realm === 'ex') return h.startsWith('x-') && window.EXPLAIN && EXPLAIN.byId(h.slice(2)) ? 'ex-' + EXPLAIN.byId(h.slice(2)).track : 'ex-ds';
    if (realm === 'al') return 'al-practice';
    return /^(p-|picker|mixed)/.test(h) ? 'problems' : 'home';
  }
  // called at the start of every route(): keeps a per-realm trail of pages
  function visit(realm, h) {
    if (realm !== stackRealm) { stack = []; stackRealm = realm; }
    if (stack[stack.length - 1] === h) return;
    if (stack[stack.length - 2] === h) { stack.pop(); return; }
    const at = stack.indexOf(h);
    if (at >= 0) stack = stack.slice(0, at + 1); else stack.push(h);
    if (ROOTS.has(h)) stack = [h];
  }
  // called after a page renders: fixes the page's own back button, or adds one
  function mount(page, realm, h) {
    if (ROOTS.has(h) || page.classList.contains('exam')) return;
    const to = stack.length > 1 ? stack[stack.length - 2] : parent(realm, h);
    const label = '← ' + name(to);
    let a = page.querySelector('.prob-head > a.btn.ghost, .sd-head .row > a.btn.ghost:first-child, a.backlink');
    if (!a) {
      const row = document.createElement('div'); row.className = 'back-row';
      a = document.createElement('a'); a.className = 'btn small ghost backlink';
      row.appendChild(a); page.prepend(row);
    }
    a.setAttribute('href', '#' + to); a.textContent = label;
  }
  return { visit, mount, name, parent };
})();
/* pattern label on every problem row in any list */
function labelRows(page) {
  page.querySelectorAll('a.prow[href^="#p-"]').forEach(a => {
    if (a.querySelector('.plab')) return;
    const P = probById[a.getAttribute('href').slice(3)]; if (!P || !P.pattern) return;
    const s = document.createElement('span'); s.className = 'plab lname'; s.innerHTML = fineBadge(P);
    const lv = a.querySelector('.lvl, .pill'); if (lv) a.insertBefore(s, lv); else a.appendChild(s);
    // NeetCode video button: opens YouTube in a new tab, badge says if it is the same problem or a similar idea
    const V = ((window.VIDEO_DATA || {})[P.id] || [])[0];
    if (V && /^[A-Za-z0-9_-]{11}$/.test(V[0]) && !a.querySelector('.yt-btn')) {
      const yb = document.createElement('a'); yb.className = 'yt-btn' + (V[3] ? ' same' : ''); yb.href = 'https://www.youtube.com/watch?v=' + V[0]; yb.target = '_blank'; yb.rel = 'noopener noreferrer';
      yb.dataset.yt = V[0]; yb.title = 'NeetCode: LC ' + V[1] + ' ' + V[2] + ' (opens YouTube)';
      yb.setAttribute('aria-label', 'Watch NeetCode video, ' + (V[3] ? 'same problem' : 'similar idea') + ': LC ' + V[1] + ' ' + V[2]);
      yb.innerHTML = YT_ICON + '<span>' + (V[3] ? 'Same' : 'Similar') + '</span>';
      a.insertBefore(yb, s);
    }
  });
}
const YT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff0033" d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path fill="#fff" d="m10 15 5-3-5-3z"/></svg>';
// the button is a real link inside the row link: the browser opens the video (click, middle-click, Ctrl/Cmd-click); keep row code out of it
document.addEventListener('click', e => { if (e.target.closest('.yt-btn')) e.stopPropagation(); }, true);
/* "Open all" at the right of each list header: every video in that list in its own new tab, plus a one-tab playlist */
function listVideoTools(page) {
  page.querySelectorAll('.plist').forEach(list => {
    const ids = [...new Set(Array.from(list.querySelectorAll('.yt-btn')).map(a => (a.href.match(/v=([A-Za-z0-9_-]{11})/) || [])[1]).filter(Boolean))];
    const head = list.previousElementSibling;
    if (!ids.length || !head || head.querySelector('.yt-all') || (head.parentElement && head.parentElement.classList.contains('plist-head') && head.parentElement.querySelector('.yt-all'))) return;
    const tools = document.createElement('span'); tools.className = 'yt-tools';
    tools.innerHTML = '<button type="button" class="yt-all" title="Open every video in this list in its own tab">' + YT_ICON + '<span>Open all ' + ids.length + '</span></button>' +
      '<a class="yt-pl" href="https://www.youtube.com/watch_videos?video_ids=' + ids.slice(0, 50).join(',') + '" target="_blank" rel="noopener noreferrer" title="All ' + ids.length + ' videos as one playlist, in one tab">Playlist</a>';
    tools.querySelector('.yt-all').onclick = () => {
      let opened = 0;
      ids.forEach(v => { const w = window.open('https://www.youtube.com/watch?v=' + v, '_blank'); if (w) { opened++; try { w.opener = null; } catch (er) { /* cross-origin */ } } });
      if (opened < ids.length) toast('Your browser opened ' + opened + ' of ' + ids.length + ' tabs. Allow pop-ups for this page to open them all, or use Playlist.', 'big');
    };
    if (head.classList.contains('day-h')) head.appendChild(tools);
    else { const wrap = document.createElement('div'); wrap.className = 'plist-head'; head.before(wrap); wrap.appendChild(head); wrap.appendChild(tools); }
  });
}
function patLabel(P) { return ((window.PAT_FINE || {})[P.id]) || pname(P.pattern); }
/* badge for the cheatsheet pattern names: [short code, colour family] */
const FINE_BADGE = {
  'Hash map and counting': ['H', 'hashing'], 'Two pointers': ['W', 'two-pointers'], 'Sliding window': ['SW', 'two-pointers'], 'Prefix sums': ['Σ', 'prefix-sums'],
  'Binary search': ['B', 'binary-search'], 'Binary search on the answer': ['BA', 'binary-search'], 'Sorting and greedy': ['S', 'sorting'], 'Intervals': ['I', 'sorting'],
  'Stack': ['St', 'stack'], 'Monotonic stack': ['MS', 'stack'], 'Heap: top k and k-way merge': ['Hp', 'kadane'], 'Two heaps': ['H2', 'kadane'],
  'Linked list: dummy, reverse, fast/slow': ['LL', 'two-pointers'], 'Tree DFS': ['T', 'dp'], 'Tree BFS (level order)': ['TB', 'dp'], 'BST': ['BT', 'binary-search'],
  'Graph BFS/DFS': ['G', 'greedy-sim'], 'Topological sort': ['TS', 'greedy-sim'], 'Union-find': ['UF', 'greedy-sim'], 'Dijkstra': ['D', 'greedy-sim'],
  'Backtracking': ['BK', 'dp'], 'DP 1D': ['DP', 'dp'], 'DP 2D': ['2D', 'dp'], 'Trie': ['Tr', 'strings'], 'Bit tricks': ['01', 'math'], 'Math': ['M', 'math'],
  'Matrix traversal': ['Mx', 'greedy-sim'], 'Simulation and parsing': ['Aa', 'strings'], 'Design: combine structures': ['Ds', 'hashing']
};
function fineBadge(P) {
  const name = patLabel(P), f = FINE_BADGE[name];
  if (!f) return badge(P.pattern) + esc(name);
  return '<span class="badge" style="--c:' + lc(f[1]) + '" aria-hidden="true">' + esc(f[0]) + '</span>' + esc(name);
}
/* cheatsheet pattern name -> "Explained" topic id */
const EX_FOR_PATTERN = {
  'Hash map and counting': 'hash-map', 'Two pointers': 'two-pointers', 'Sliding window': 'sliding-window', 'Prefix sums': 'prefix-sums',
  'Binary search': 'binary-search', 'Sorting and greedy': 'greedy', 'Intervals': 'merge-intervals',
  'Stack': 'stack', 'Monotonic stack': 'monotonic-stack', 'Heap: top k and k-way merge': 'top-k-heap', 'Two heaps': 'heap',
  'Linked list: dummy, reverse, fast/slow': 'fast-slow-pointers', 'Tree DFS': 'dfs', 'BST': 'bst',
  'Graph BFS/DFS': 'bfs', 'Topological sort': 'topological-sort', 'Union-find': 'union-find', 'Dijkstra': 'dijkstra',
  'Backtracking': 'backtracking', 'DP 1D': 'dp-1d', 'DP 2D': 'dp-2d', 'Trie': 'trie', 'Bit tricks': 'bit-manipulation',
  'Matrix traversal': 'grid', 'Design: combine structures': 'lru-cache', 'Simulation and parsing': 'string'
};
function exFor(name) { const id = EX_FOR_PATTERN[name]; return id && window.EXPLAIN && EXPLAIN.byId(id) ? id : ''; }
/* which data structures each pattern runs on */
const USES = {
  'Hash map and counting': 'dict, Counter, set',
  'Two pointers': 'list + two indexes (L, R)',
  'Sliding window': 'list + two indexes; dict or Counter for what is inside the window (deque for window max)',
  'Prefix sums': 'list of running totals; dict of sums seen so far (subarray sum = k)',
  'Binary search': 'sorted list; bisect',
  'Binary search on the answer': 'a range of numbers (lo, hi) + a check function',
  'Sorting and greedy': 'sorted list; heapq when the best choice keeps changing',
  'Intervals': 'list of [start, end] sorted by start; heapq of end times (meeting rooms)',
  'Stack': 'list used as a stack: append / pop / stack[-1]',
  'Monotonic stack': 'list as a stack of indexes kept in order',
  'Heap: top k and k-way merge': 'heapq (a min-heap in a list); tuples (value, index)',
  'Two heaps': 'two heapq lists: a max-heap (store -x) and a min-heap',
  'Linked list: dummy, reverse, fast/slow': 'ListNode objects + a dummy head; two pointers (slow, fast)',
  'Tree DFS': 'TreeNode; recursion (the call stack) or a list as a stack',
  'Tree BFS (level order)': 'TreeNode; collections.deque as the queue',
  'BST': 'TreeNode with left < node < right; in-order gives sorted order',
  'Graph BFS/DFS': 'adjacency dict of lists; set of visited; deque (BFS) or stack / recursion (DFS)',
  'Topological sort': 'adjacency dict; in-degree dict; deque of nodes with in-degree 0',
  'Union-find': 'parent list (+ size or rank list)',
  'Dijkstra': 'adjacency dict; heapq of (distance, node); dist dict',
  'Backtracking': 'path list (append, recurse, pop); recursion',
  'DP 1D': 'list dp of size n + 1, or two variables',
  'DP 2D': '2D list table [[0] * (m + 1) for _ in range(n + 1)], or @cache',
  'Trie': 'TrieNode with a children dict and an end flag (or nested dicts)',
  'Bit tricks': 'an int as a row of 0/1 bits: & | ^ << >>',
  'Math': 'ints with //, %, divmod; float("inf")',
  'Matrix traversal': '2D list grid + a list of directions [(0, 1), (1, 0), (0, -1), (-1, 0)]',
  'Simulation and parsing': 'dicts for state, lists, str.split(); a direction table',
  'Design: combine structures': 'dict + doubly linked list or OrderedDict (LRU); deque of timestamps (rate limiter)'
};
window.linkExplained = function (host) {
  host.querySelectorAll('.sec').forEach(sec => {
    const h = sec.querySelector('.sec-title h2'), id = h && exFor(h.textContent.trim());
    if (!id || sec.querySelector('.ex-from-sheet')) return;
    const b = sec.querySelector('.sec-b'); if (!b) return;
    // the step-through animation takes the place of the static picture
    const mini = document.createElement('div'); mini.innerHTML = EXPLAIN.miniHTML(id);
    const pic = b.querySelector(':scope > svg.pv');
    if (mini.firstChild) { if (pic) pic.replaceWith(mini.firstChild); else b.prepend(mini.firstChild); }
  });
  host.querySelectorAll('.sec .fact').forEach(f => { const n = f.querySelector('.n'); if (n && n.textContent.trim() === 'Classic') f.remove(); });
  host.querySelectorAll('.sec').forEach(sec => {
    const h = sec.querySelector('.sec-title h2'), u = h && USES[h.textContent.trim()], facts = sec.querySelector('.facts');
    if (!u || !facts || facts.querySelector('.fact-uses')) return;
    const row = document.createElement('div'); row.className = 'fact fact-uses'; row.innerHTML = '<div class="n">Uses</div><div class="t"></div>'; row.querySelector('.t').textContent = u;
    facts.prepend(row);
  });
  if (window.EXPLAIN && EXPLAIN.fitMinis) EXPLAIN.fitMinis(host);
};
