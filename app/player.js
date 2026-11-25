/* Player card + stat tiles on every Practice page (SG Theory Prep pattern). Runs inside the main IIFE. */
const DAILY_GOAL = 120;
function xpToday() { return (store.get('xpDay', {})[todayKey()] || 0); }
function playerCardHTML(realm) {
  const xp = store.get('xp', 0), L = levelOf(xp), cur = LEVELS[L.n - 1][1], nxt = LEVELS[L.n] ? LEVELS[L.n][1] : cur + 600;
  const t = xpToday(), pct = Math.min(1, t / DAILY_GOAL), C = 2 * Math.PI * 20;
  const tiles = realmTiles(realm);
  return playerTop(xp, L, cur, nxt, t, pct, C) + '<div class="ptiles">' + tiles.map(([k, v, of]) => '<div class="ptile"><span>' + k + '</span><b>' + v + (of != null ? '<small> / ' + of + '</small>' : '') + '</b></div>').join('') + '</div>';
}
function realmTiles(realm) {
  const E = evlog.all(), solved = prog.solved();
  const pctOf = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';
  let tiles = [];
  if (realm === 'lc') {
    const gt = PROBLEMS.filter(p => p.govtech), dr = E.filter(e => e.k === 'drill');
    tiles = [['Reported tasks solved', gt.filter(p => solved[p.id]).length, gt.length], ['AI product set', PROBLEMS.filter(p => p.grl && solved[p.id]).length, PROBLEMS.filter(p => p.grl).length],
      ['Drill accuracy', pctOf(dr.filter(e => e.ok).length, dr.length)], ['Best drill streak', store.get('drillBest', 0) || '–'],
      ['Mocks done', E.filter(e => e.k === 'mock').length || '–']];
  } else if (realm === 'sd') {
    const p = store.get('sdProg', {}), D = (window.SD_DATA || {});
    const qz = Object.keys(p).filter(k => k.startsWith('qz:')).length;
    tiles = [['Designs studied', Object.keys(p).filter(k => k.startsWith('d:')).length, (D.designs || []).length], ['Timed rounds', Object.keys(p).filter(k => k.startsWith('q:')).length, (D.practice || []).length],
      ['Building blocks', Object.keys(p).filter(k => k.startsWith('c:')).length, (D.concepts || []).length], ['Quiz answers right', qz || '–'], ['Best drill round', store.get('sdBest', 0) ? store.get('sdBest', 0) + ' / 10' : '–']];
  } else if (realm === 'al') {
    const R = PROBLEMS.filter(x => x.al && x.al.kind === 'resume'), F = PROBLEMS.filter(x => x.al && x.al.kind === 'fundamentals');
    const Rp = PROBLEMS.filter(x => window.AL && AL.reported(x.id));
    tiles = [['Reported', Rp.filter(x => solved[x.id]).length, Rp.length], ['From your resume', R.filter(x => solved[x.id]).length, R.length], ['Fundamentals', F.filter(x => solved[x.id]).length, F.length]];
  } else if (realm === 'dd') {
    const R = store.get('ddRate', {}), Q = ((window.DD_DATA || {}).questions || []), W = ((window.DD_DATA || {}).worksheet || []);
    const MP = ((window.DD_DATA || {}).mine || {}).projects || [];
    let filled = 0; for (let i = 0; i < 2; i++) W.forEach(s => { const v = store.get('ddw:' + i + ':' + s.key, null), t = v == null ? (((MP[i] || {}).fill || {})[s.key] || '') : v; if (t.trim() && !/\[add:/.test(t)) filled++; });
    tiles = [['Strong answers', Object.values(R).filter(v => v === 'strong').length, Q.length], ['Rated so far', Object.keys(R).length, Q.length], ['Worksheet filled', filled, W.length * 2], ['Weak to revisit', Object.values(R).filter(v => v === 'weak').length || '–']];
  }
  return tiles;
}
function playerTop(xp, L, cur, nxt, t, pct, C) {
  return '<a class="player" href="#me" title="Level, trophies and quests"><div class="lvl-tile"><small>Level</small><span>' + L.n + '</span></div>' +
    '<div class="who"><div class="rank"><b>' + esc(L.title) + '</b><span>' + (xp - cur) + ' / ' + (nxt - cur) + ' XP</span></div><div class="pbar"><i style="width:' + Math.round(L.pct * 100) + '%"></i></div></div>' +
    '<div class="daily"><div class="ring' + (pct >= 1 ? ' done' : '') + '"><svg viewBox="0 0 48 48" aria-hidden="true"><circle class="track" cx="24" cy="24" r="20"/><circle class="val" cx="24" cy="24" r="20" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(1) + '"/></svg><b>' + t + '</b></div><div class="lab"><b>Daily goal</b>' + t + ' / ' + DAILY_GOAL + ' XP today</div></div></a>';
}
