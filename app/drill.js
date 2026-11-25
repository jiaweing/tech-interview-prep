function viewDrill(page) {
  // Pattern drill, SG Theory Prep style: one card, lettered options, short feedback, rounds of 10.
  page.classList.add('narrow');
  let deck = [], q = null, streak = 0, best = store.get('drillBest', 0), t0 = 0, iv = null, roundN = 0, roundOk = 0;
  const roundMiss = {}, seen = store.get('drillSeen', {});
  const SC = (D.drill && D.drill.scenarios) || [];
  const ALL = SC.length ? SC.map(x => ({ id: x.id, pattern: x.pattern, statement: '<p>' + x.text + '</p>', clue: x.clue, why: x.why })) : PROBLEMS.filter(p => !p.al);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  page.innerHTML = '<h1 class="sr-only">Pattern drill</h1><div class="dq-card" id="dq"></div>';
  const card = $('#dq', page);
  const tick = () => { const el = $('.dq-time', card); if (el) el.textContent = Math.floor((performance.now() - t0) / 1000) + 's'; };
  const summary = () => {
    clearInterval(iv);
    const weak = Object.entries(roundMiss).sort((a, b) => b[1] - a[1])[0];
    if (roundOk >= 9) store.set('drillRound9', 1);
    card.innerHTML = '<div class="dq-top"><span class="chip">Round done</span></div><div class="dq-score"><b>' + roundOk + '</b><span> / 10</span></div>' +
      '<p class="muted">' + (weak ? 'Mixed up most: <b>' + esc(pname(weak[0])) + '</b>.' : 'Clean round.') + ' Best streak ' + best + '.</p>' +
      '<div class="dq-fb"><span></span><span class="row" style="gap:8px">' + (weak ? '<a class="btn" href="#pattern-' + weak[0] + '">Learn ' + esc(pname(weak[0])) + '</a>' : '') + '<button class="btn primary" data-again>Another 10</button></span></div>';
  };
  const next = () => {
    if (roundN === 10) { summary(); return; }
    if (!deck.length) {
      const pri = id => (WEIGHTS[id] || 1) * (1.25 - mastery(id).m);
      const pool = ALL.slice().sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)).slice(0, Math.max(30, Math.ceil(ALL.length * .6)));
      deck = shuffle(pool).map(p => ({ p, k: Math.pow(Math.random(), 1 / pri(p.pattern)) })).sort((a, b) => a.k - b.k).map(x => x.p);
    }
    q = deck.pop();
    seen[q.id] = (seen[q.id] || 0) + 1; store.set('drillSeen', seen);
    const opts = shuffle([patById[q.pattern] || { id: q.pattern, name: q.pattern }].concat(shuffle(PATTERNS.filter(p => p.id !== q.pattern)).slice(0, 3)));
    card.innerHTML = '<div class="dq-top"><span class="chip">' + (roundN + 1) + ' / 10</span>' + (streak >= 2 ? '<span class="chip dq-combo">🔥 ' + streak + '</span>' : '') + '<span class="dq-sp"></span><span class="chip dq-time">0s</span></div>' +
      '<div class="dq-text prose inline dstmt">' + q.statement + '</div>' +
      '<div class="dq-opts">' + opts.map((o, i) => '<button class="dq-opt" data-o="' + o.id + '"><span class="dq-l">' + 'ABCD'[i] + '</span><span>' + esc(o.name) + '</span><span class="dq-mark"></span></button>').join('') + '</div>' +
      '<div class="dq-exp" hidden></div><div class="dq-fb"><span class="dq-msg" aria-live="polite"></span><button class="btn primary" data-n hidden>Next</button></div>';
    t0 = performance.now(); clearInterval(iv); iv = setInterval(tick, 250);
  };
  const answer = b => {
    if (!b || b.disabled) return;
    clearInterval(iv); const secs = (performance.now() - t0) / 1000;
    const ok = b.dataset.o === q.pattern;
    if (ok) { streak++; roundOk++; } else { streak = 0; roundMiss[q.pattern] = (roundMiss[q.pattern] || 0) + 1; }
    roundN++;
    evlog.add({ k: 'drill', p: q.pattern, ok, s: Math.round(secs * 10) / 10, guess: b.dataset.o });
    if (streak > best) { best = streak; store.set('drillBest', best); }
    $$('.dq-opt', card).forEach(x => {
      const r = x.dataset.o === q.pattern, w = x === b && !ok;
      x.classList.toggle('right', r); x.classList.toggle('wrong', w); x.classList.toggle('dim', !r && !w);
      $('.dq-mark', x).textContent = r ? '✓' : w ? '✗' : ''; x.disabled = true;
    });
    const P = patById[q.pattern] || {}, C = ((D.cheat || {}).patterns || []).find(c => c.id === q.pattern) || {};
    markClues($('.dstmt', card), q.clue ? [q.clue] : (CLUES[q.pattern] || []).concat(P.signals || []).filter(w => w.length > 4));
    const exp = $('.dq-exp', card);
    exp.innerHTML = (q.clue ? '<p><b>Clue</b> "' + esc(q.clue) + '"' + (q.why ? ': ' + esc(q.why) : '') + '</p>' : q.why ? '<p>' + esc(q.why) + '</p>' : '') + (C.move ? '<p><b>Move</b> ' + esc(C.move) + '</p>' : '') +
      '<p><a href="#pattern-' + q.pattern + '">Learn ' + esc(P.name || '') + ' →</a></p>';
    exp.hidden = false;
    const m = $('.dq-msg', card); m.className = 'dq-msg ' + (ok ? 'ok' : 'bad'); m.textContent = ok ? 'Correct · ' + secs.toFixed(1) + 's' : 'It is ' + (P.name || q.pattern);
    const n = $('[data-n]', card); n.textContent = roundN === 10 ? 'See round' : 'Next'; n.hidden = false; n.focus();
    if (!ok) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
  };
  card.addEventListener('click', e => {
    if (e.target.closest('[data-n]')) { next(); return; }
    if (e.target.closest('[data-again]')) { roundN = 0; roundOk = 0; Object.keys(roundMiss).forEach(k => delete roundMiss[k]); next(); return; }
    answer(e.target.closest('.dq-opt'));
  });
  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) return;
    const k = e.key.toLowerCase(), i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (i >= 0 && k.length === 1) answer($$('.dq-opt', card)[i]);
    else if (e.key === 'Enter' && $('[data-n]:not([hidden])', card) && document.activeElement !== $('[data-n]', card)) { e.preventDefault(); next(); }
  };
  document.addEventListener('keydown', onKey);
  cleanup.push(() => { clearInterval(iv); document.removeEventListener('keydown', onKey); });
  next();
}
