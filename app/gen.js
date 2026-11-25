/* Fresh question: Claude writes a new problem, the browser verifies its solution against its tests before you see it. Runs inside the main IIFE. */
const GEN_PATTERNS = ['hashing', 'prefix-sums', 'sorting', 'two-pointers', 'stack', 'kadane', 'binary-search', 'math', 'greedy-sim', 'dp', 'strings'];
function genLoad() {
  (store.get('genProbs', []) || []).forEach(P => { if (P && P.id && !probById[P.id]) { PROBLEMS.push(P); probById[P.id] = P; } });
}
function genResumeText() {
  const M = (window.DD_DATA || {}).mine || {};
  return (M.projects || []).map(p => p.name + ': ' + Object.values(p.fill || {}).join(' ').replace(/\[add:[^\]]*\]/g, '').slice(0, 1400)).join('\n\n');
}
function genPrompt(kind, topic, prevErr) {
  const base = kind === 'resume'
    ? 'Base the problem on ONE concrete piece of the candidate\'s own work below (pick a different piece each time; vary it), turned into an algorithmic coding task an interviewer could hand them:\n' + genResumeText()
    : 'Make it a classic fundamentals question' + (topic ? ' on ' + topic : ' (arrays, hashmaps, strings, two pointers, sliding window, stacks, heaps, intervals, binary search, trees as level-order lists with null, BFS/DFS on a grid or graph)') + ', framed in a backend/social-feed product scenario.';
  return 'You are an interviewer at AppLovin running a 45-minute backend "short code" round: LeetCode-style, easy to medium. Write ONE new problem.\n' + base +
    '\n\nRules: Python 3 standard library only. The candidate writes def solution(...). Arguments and return values must be JSON values (lists, dicts with string keys, strings, numbers, booleans, null). Deterministic. No recursion deeper than 400. Do not use regular expressions. Call .strip() before .split() on text. Precisely define every rule and tie-break in the statement.' +
    '\nTests: 9 to 12, starting with the examples in the same order; cover empty input, single item, duplicates, boundaries and one medium-size case. Expected values must be exactly what your solution returns.' +
    (prevErr ? '\nYour previous attempt failed verification: ' + prevErr + '. Fix it.' : '') +
    '\n\nReply with ONLY JSON: {"title":"...","pattern":"one of ' + GEN_PATTERNS.join('|') + '","level":"easy|medium","statement":"HTML using only <p> <b> <code> <ul> <li>","examples":[{"input":"a = [1, 2], k = 3","output":"python literal","why":"short"}],"constraints":["..."],"starter":"def solution(...):\\n    # write your code here\\n    pass\\n","hints":["3 progressive hints"],"solution":"full python source defining solution","complexity":"O(...) time, O(...) space","tests":[{"args":[...],"expected":...,"label":"example 1","cat":"example"}],"from":"' + (kind === 'resume' ? 'which resume item it came from, short' : 'the LeetCode problem it mirrors, e.g. LC 49 Group Anagrams') + '","talk":["3 things to say while coding"],"extensions":["3 follow-ups an interviewer adds"]}';
}
function genSafe(h) {
  // keep only a few formatting tags, with no attributes; everything else becomes text
  const d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h);
  const ok = { P: 1, B: 1, I: 1, CODE: 1, UL: 1, OL: 1, LI: 1, BR: 1, STRONG: 1, EM: 1 };
  const walk = n => Array.from(n.childNodes).forEach(c => {
    if (c.nodeType === 1) { if (!ok[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; } Array.from(c.attributes).forEach(a => c.removeAttribute(a.name)); walk(c); }
    else if (c.nodeType !== 3) c.remove();
  });
  walk(d); return d.innerHTML;
}
function genValid(G) {
  if (!G || typeof G !== 'object') return 'not a JSON object';
  for (const k of ['title', 'statement', 'starter', 'solution', 'tests']) if (!G[k]) return 'missing ' + k;
  if (!Array.isArray(G.tests) || G.tests.length < 5) return 'need at least 5 tests';
  if (!/def solution\(/.test(G.solution)) return 'solution must define solution(...)';
  if (G.tests.some(t => !Array.isArray(t.args) || !('expected' in t))) return 'each test needs args (list) and expected';
  return '';
}
async function genQuestion(kind, topic, status) {
  if (!AI.sample) { status('Claude is not available on this page right now.'); return; }
  let err = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    status(attempt ? 'First draft failed its own tests. Asking for a fix…' : 'Writing a fresh question…');
    let G;
    try { G = await AI.sample.json(genPrompt(kind, topic, err), { cache: false }); } catch (e) { status((AI_ERR || {})[e && e.code] || 'Could not reach Claude. Try again.'); return; }
    err = genValid(G); if (err) continue;
    status('Checking the answer key in Python…');
    const tests = G.tests.map((t, i) => ({ args: t.args, expected: t.expected, label: t.label || 'test ' + (i + 1), cat: t.cat || (i < (G.examples || []).length ? 'example' : 'medium'), why: t.why || '' }));
    const res = await runTests(G.solution, tests);
    const bad = (res.results || []).filter(r => r.status !== 'pass');
    if (res.compile) { err = 'solution did not run: ' + String(res.compile).slice(0, 300); continue; }
    if (bad.length) { err = bad.length + ' tests failed, e.g. ' + bad[0].label + ' got ' + bad[0].got + ' expected ' + bad[0].expected; continue; }
    const n = (store.get('genCount', 0) || 0) + 1; store.set('genCount', n);
    const P = { id: 'gen-' + n + '-' + (G.title || 'q').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30), title: G.title, pattern: GEN_PATTERNS.includes(G.pattern) ? G.pattern : 'hashing', level: G.level === 'medium' ? 'medium' : 'easy',
      statement: genSafe(G.statement), examples: (G.examples || []).slice(0, 3).map(x => ({ input: String(x.input || ''), output: String(x.output || ''), why: genSafe(x.why) })), constraints: (G.constraints || []).map(genSafe), starter: String(G.starter), think: [], hints: (G.hints || []).map(genSafe), solution: G.solution, explain: '', complexity: G.complexity || '', tests,
      al: { kind: 'generated', sub: kind, from: String(G.from || '').slice(0, 60) || (kind === 'resume' ? 'your resume' : 'fundamentals'), talk: (G.talk || []).map(genSafe), extensions: (G.extensions || []).map(genSafe) } };
    const all = store.get('genProbs', []) || []; all.push(P); store.set('genProbs', all.slice(-40));
    PROBLEMS.push(P); probById[P.id] = P;
    status(''); location.hash = 'p-' + P.id; return;
  }
  status('Could not get a question that passes its own tests (' + err + '). Try again.');
}
function genBar(page) {
  const bar = document.createElement('section'); bar.className = 'gen-bar';
  bar.innerHTML = '<h3 class="gt-h">Fresh question</h3><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn primary small" data-g="resume">From my resume</button><button class="btn small" data-g="fundamentals">Fundamentals</button>' +
    ['Trees', 'Graphs / BFS', 'Heaps', 'Intervals', 'Sliding window', 'Strings'].map(t => '<button class="btn small ghost" data-g="fundamentals" data-t="' + t + '">' + t + '</button>').join('') + '</div><div class="gen-status muted" aria-live="polite"></div>';
  const st = $('.gen-status', bar);
  bar.onclick = e => { const b = e.target.closest('[data-g]'); if (!b || bar.dataset.busy) return; bar.dataset.busy = '1'; $$('button', bar).forEach(x => { x.disabled = true; }); genQuestion(b.dataset.g, b.dataset.t || '', m => { st.textContent = m; }).finally(() => { delete bar.dataset.busy; $$('button', bar).forEach(x => { x.disabled = false; }); }); };
  page.prepend(bar);
}
genLoad();
