/* Deep dive realm: project deep dive & behavioural round prep. */
(function () {
'use strict';
const D = window.DD_DATA || {};
const QS = D.questions || [];
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const store = {
  get(k, d) { try { const v = localStorage.getItem('pg:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pg:' + k, JSON.stringify(v)); } catch (e) {} }
};
const app = () => window.APP10K || { xp() {}, toast() {} };
const THEMES = [...new Set(QS.map(q => q.theme))];
const rated = () => store.get('ddRate', {});
const MINE = D.mine || { projects: [], stories: {} };
const pre = (i, k) => ((MINE.projects[i] || {}).fill || {})[k] || '';
const val = (i, k) => { const v = store.get('ddw:' + i + ':' + k, null); return v == null ? pre(i, k) : v; };
const storiesHTML = th => (MINE.stories[th] || []).length ? '<div class="dd-mine"><h4>Your stories</h4><ul>' + MINE.stories[th].map(s => '<li>' + s + '</li>').join('') + '</ul></div>' : '';

function tabFor(h) { return h === 'dd-cheat' ? 'dd-cheat' : h === 'dd-questions' || h === 'dd-mock' ? 'dd-practice' : 'dd-prep'; }

function viewPrep(page) {
  const projects = store.get('ddProj', null) || [0, 1].map(i => ({ name: (MINE.projects[i] || {}).name || 'Project ' + (i + 1) }));
  let cur = Math.min(store.get('ddProjCur', 0), projects.length - 1);
  const filled = i => (D.worksheet || []).filter(s => (val(i, s.key) || '').trim() && !/\[add:/.test(val(i, s.key))).length;
  const r = rated(), ready = QS.filter(q => r[q.id] === 'strong').length;
  page.innerHTML = '<div class="sd-hero"><h1>Project deep dive</h1><p>Usually 45-60 min. Walk through 1–2 projects you owned, then they dig.</p></div>' +
    '<div class="sd-kpis"><a class="sd-kpi" href="#dd-questions"><span>Questions you can answer well</span><b>' + ready + '<small style="font-size:13px;color:var(--muted)"> / ' + QS.length + '</small></b><div class="bar"><i style="width:' + (QS.length ? Math.round(ready / QS.length * 100) : 0) + '%"></i></div></a>' +
    projects.map((p, i) => '<div class="sd-kpi"><span>' + esc(p.name) + ' worksheet</span><b>' + filled(i) + '<small style="font-size:13px;color:var(--muted)"> / ' + (D.worksheet || []).length + '</small></b><div class="bar"><i style="width:' + Math.round(filled(i) / Math.max(1, (D.worksheet || []).length) * 100) + '%"></i></div></div>').join('') + '</div>' +
    '<section class="sd-sec"><div class="day-h"><h2>What they score</h2><span class="muted">what most rubrics look for</span></div><div class="sd-chips">' + ['Project ownership', 'Technical decisions', 'Problem solving', 'Setbacks', 'Stakeholders', 'User feedback', 'Adapting', 'Lessons learnt', 'What you’d do differently'].map(t => '<span class="sd-chip static">' + t + '</span>').join('') + '</div></section>' +
    ((D.plan || []).length ? '<section class="sd-sec"><div class="day-h"><h2>The 60 minutes</h2><span class="muted">hover for what to do</span></div><div class="sd-steps">' + D.plan.map((s, i) => '<div class="sd-step" title="' + esc(s.do) + '"><i>' + esc(s.minutes) + '</i><b>' + (i + 1) + '. ' + esc(s.title) + '</b></div>').join('') + '</div></section>' : '') +
    '<section class="sd-sec"><div class="day-h"><h2>Your project worksheet</h2><span class="muted">for your own projects · saved in this browser · the mock interviewer reads it</span></div><div class="sd-filter" id="ptabs"></div><div id="ws" class="ws-list"></div></section>' +
    ((D.ask_them || []).length ? '<details class="sd-more"><summary>Questions to ask them at the end</summary><div class="sd-more-b"><ul class="sd-list ok">' + D.ask_them.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div></details>' : '') +
    (D.star ? '<details class="sd-more"><summary>How to tell a 2-minute story (STAR)</summary><div class="sd-more-b sd-prose">' + D.star + '</div></details>' : '');
  const drawTabs = () => { $('#ptabs', page).innerHTML = projects.map((p, i) => '<button class="chip' + (i === cur ? ' on' : '') + '" data-p="' + i + '">' + esc(p.name) + '</button>').join(''); };
  const drawWS = () => {
    $('#ws', page).innerHTML = '<input class="ws-name" data-name value="' + esc(projects[cur].name) + '" aria-label="Project name">' + (D.worksheet || []).map(s => '<div class="ws-item"><div class="ws-h"><b>' + esc(s.title) + '</b><button class="btn small ghost" data-ex="' + esc(s.key) + '">Example</button></div><div class="ws-p">' + esc(s.prompt) + '</div><div class="ws-ex" hidden>' + esc(s.example || '') + '</div><textarea data-k="' + esc(s.key) + '" rows="' + Math.min(9, Math.max(3, val(cur, s.key).split('\n').length + Math.ceil(val(cur, s.key).length / 90))) + '" placeholder="Bullet points are fine">' + esc(val(cur, s.key)) + '</textarea>' + (/\[add:/.test(val(cur, s.key)) ? '<div class="ws-todo">Fill in the [add: …] part</div>' : '') + '</div>').join('');
  };
  page.addEventListener('click', e => {
    const t = e.target.closest('[data-p]'); if (t) { cur = +t.dataset.p; store.set('ddProjCur', cur); drawTabs(); drawWS(); }
    const x = e.target.closest('[data-ex]'); if (x) { const ex = x.closest('.ws-item').querySelector('.ws-ex'); ex.hidden = !ex.hidden; }
  });
  page.addEventListener('input', e => {
    const k = e.target.dataset.k; if (k) store.set('ddw:' + cur + ':' + k, e.target.value);
    if (e.target.hasAttribute('data-name')) { projects[cur].name = e.target.value || 'Project ' + (cur + 1); store.set('ddProj', projects); drawTabs(); }
  });
  drawTabs(); drawWS();
}

function qCard(q, open) {
  const r = rated()[q.id];
  return '<details class="ddq" data-id="' + esc(q.id) + '"' + (open ? ' open' : '') + '><summary><span class="sd-pill">' + esc(q.theme) + '</span><b>' + esc(q.q) + '</b>' + (r ? '<span class="rate ' + r + '">' + r + '</span>' : '') + '</summary><div class="ddq-b">' +
    '<div class="ddq-probe">They are checking: ' + esc(q.probing) + '</div>' + storiesHTML(q.theme) +
    '<div class="sd-two"><div><h4>Strong answer</h4>' + (q.strong || '') + '</div><div><h4>Red flags</h4>' + (q.red_flags || '') + '</div></div>' +
    ((q.followups || []).length ? '<div><h4>Then they ask</h4><ul class="sd-list">' + q.followups.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></div>' : '') +
    '<div class="row" style="gap:6px"><span class="muted" style="font-size:13px">How would you do now?</span>' + ['strong', 'ok', 'weak'].map(k => '<button class="chip' + (r === k ? ' on' : '') + '" data-rate="' + k + '">' + k + '</button>').join('') + '</div></div></details>';
}
function wireRate(page, redraw) {
  page.addEventListener('click', e => {
    const b = e.target.closest('[data-rate]'); if (!b) return;
    const id = b.closest('.ddq').dataset.id, R = rated(), first = !R[id];
    R[id] = b.dataset.rate; store.set('ddRate', R);
    if (first) app().xp(3, 'deep-dive practice');
    redraw(id);
  });
}
function viewQuestions(page) {
  let th = 'all', only = 'all';
  page.innerHTML = '<div class="sd-hero"><h1>Questions</h1><p>Say your answer out loud first, then open it. Rate yourself so weak ones come back in Mock.</p></div><div class="sd-filter" id="f1"></div><div class="sd-filter" id="f2"></div><div id="ql" class="ddq-list"></div>';
  const draw = keepOpen => {
    const R = rated();
    $('#f1', page).innerHTML = ['all'].concat(THEMES).map(t => '<button class="chip' + (th === t ? ' on' : '') + '" data-th="' + esc(t) + '">' + (t === 'all' ? 'All themes' : esc(t)) + '</button>').join('');
    $('#f2', page).innerHTML = [['all', 'Any'], ['todo', 'Not rated'], ['weak', 'Weak'], ['ok', 'OK'], ['strong', 'Strong']].map(([k, l]) => '<button class="chip' + (only === k ? ' on' : '') + '" data-only="' + k + '">' + l + ' <span class="muted">' + QS.filter(q => k === 'all' || (k === 'todo' ? !R[q.id] : R[q.id] === k)).length + '</span></button>').join('');
    const list = QS.filter(q => (th === 'all' || q.theme === th) && (only === 'all' || (only === 'todo' ? !R[q.id] : R[q.id] === only)));
    $('#ql', page).innerHTML = list.map(q => qCard(q, q.id === keepOpen)).join('') || '<p class="muted">Nothing here yet.</p>';
  };
  page.addEventListener('click', e => { const a = e.target.closest('[data-th]'), b = e.target.closest('[data-only]'); if (a) { th = a.dataset.th; draw(); } if (b) { only = b.dataset.only; draw(); } });
  wireRate(page, id => draw(id));
  draw();
}
function viewMock(page, cleanup) {
  const R = rated();
  const weight = q => R[q.id] === 'weak' ? 4 : !R[q.id] ? 3 : R[q.id] === 'ok' ? 2 : 1;
  const pickSet = () => { const pool = QS.map(q => ({ q, k: Math.pow(Math.random(), 1 / weight(q)) })).sort((a, b) => b.k - a.k).map(x => x.q); const out = [], seen = new Set(); for (const q of pool) { if (!seen.has(q.theme) || out.length >= THEMES.length) { out.push(q); seen.add(q.theme); } if (out.length >= 6) break; } return out; };
  let set = pickSet(), i = 0, t = 120, tick = null, phase = 'answer';
  const stop = () => { if (tick) clearInterval(tick); tick = null; };
  cleanup.push(stop);
  function draw() {
    stop();
    if (i >= set.length) {
      page.innerHTML = '<div class="sd-hero"><h1>Mock done</h1><p>' + set.length + ' questions. Anything you rated weak comes back first next time.</p></div><div class="row" style="gap:8px"><button class="btn primary" id="again">Another round →</button><a class="btn" href="#dd-questions">Browse all questions</a></div>';
      $('#again', page).onclick = () => { set = pickSet(); i = 0; draw(); }; app().xp(20, 'deep-dive mock'); return;
    }
    const q = set[i]; t = 120; phase = 'answer';
    page.innerHTML = '<div class="sd-hero"><h1>Mock</h1><p>Answer out loud in about 2 minutes, like you are in the room. Then see what they were probing.</p></div>' +
      '<div class="sdq"><div class="meta"><span>' + (i + 1) + ' / ' + set.length + '</span><span class="sd-pill">' + esc(q.theme) + '</span><span class="sp"></span><span class="mono" id="tm">2:00</span></div><div class="qt">' + esc(q.q) + '</div>' +
      '<textarea id="nt" rows="3" placeholder="Optional: jot the story you would tell (project, your action, result)" style="width:100%;border-radius:14px;border:0;background:var(--subtle);color:var(--fg);padding:10px 12px;font:14px/1.5 var(--f-body)"></textarea>' +
      '<div id="after"></div><div class="row" style="justify-content:flex-end;gap:6px"><button class="btn primary" id="done">I answered →</button></div></div>';
    tick = setInterval(() => { t--; const el = $('#tm', page); if (!el) { stop(); return; } el.textContent = Math.floor(Math.max(0, t) / 60) + ':' + String(Math.max(0, t) % 60).padStart(2, '0'); el.style.color = t < 20 ? 'var(--bad)' : ''; if (t <= 0) stop(); }, 1000);
    $('#done', page).onclick = () => {
      if (phase === 'answer') {
        stop(); phase = 'review';
        $('#after', page).innerHTML = '<div class="ddq-probe">They were checking: ' + esc(q.probing) + '</div>' + storiesHTML(q.theme) + ((q.followups || []).length ? '<div class="callout warn"><div class="lbl">Follow-up: answer this too</div>' + esc(q.followups[0]) + '</div>' : '') + '<details class="sd-more"><summary>Strong answer vs red flags</summary><div class="sd-more-b sd-two"><div>' + (q.strong || '') + '</div><div>' + (q.red_flags || '') + '</div></div></details><div class="row" style="gap:6px"><span class="muted" style="font-size:13px">Rate it:</span>' + ['strong', 'ok', 'weak'].map(k => '<button class="chip" data-r="' + k + '">' + k + '</button>').join('') + '</div>';
        $('#done', page).hidden = true;
        $('#after', page).onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; const RR = rated(); RR[q.id] = b.dataset.r; store.set('ddRate', RR); i++; draw(); };
      }
    };
  }
  if (!QS.length) { page.innerHTML = '<p class="muted">Questions are loading.</p>'; return; }
  draw();
}
function render(page, h, cleanup) {
  if (h === 'dd-cheat' && window.CHEATS) { page.classList.add('sheetpage'); CHEATS.dd(page); }
  else if (h === 'dd-questions') viewQuestions(page);
  else if (h === 'dd-mock') viewMock(page, cleanup);
  else viewPrep(page);
}
window.DD = { tabFor, render };
})();
