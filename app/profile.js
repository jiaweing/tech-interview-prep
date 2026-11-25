/* Profile: one page outside the rounds (level, daily goal, progress per round, trophies) and the avatar in the top-right corner. Runs inside the main IIFE. */
const AV_COLORS = ['#2563eb', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0f766e'];
const ME_REALMS = [['lc', 'Coding', 'Live coding', 'home'], ['sd', 'System design', '', 'sd'], ['dd', 'Behavioural', 'Deep dive', 'dd']];
function meName() { const n = String(store.get('meName', '') || '').trim(); return n || 'You'; }
function meInitials() { return meName().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'Y'; }
function meColor() { const c = store.get('meColor', ''); return AV_COLORS.includes(c) ? c : AV_COLORS[0]; }
function avatarHTML(cls) { return '<span class="me-av' + (cls ? ' ' + cls : '') + '" style="background:' + meColor() + '" aria-hidden="true">' + esc(meInitials()) + '</span>'; }
function refreshMe() {
  let a = document.getElementById('meBtn');
  if (!a) { a = document.createElement('a'); a.id = 'meBtn'; a.className = 'me-btn'; a.href = '#me'; document.body.appendChild(a); }
  const L = levelOf(store.get('xp', 0));
  a.setAttribute('aria-label', 'Profile: ' + meName() + ', level ' + L.n);
  a.classList.toggle('on', /^me(-|$)|^trophies$/.test(curHash || ''));
  a.innerHTML = avatarHTML() + '<span class="me-txt"><b>' + esc(meName()) + '</b><small>Lv ' + L.n + ' · ' + esc(L.title) + '</small></span>';
}
function viewProfile(page, h) {
  page.classList.add('narrow');
  const tab = h === 'me-rounds' ? 'rounds' : h === 'me-trophies' || h === 'trophies' ? 'trophies' : 'me';
  if (tab === 'rounds') {
    page.innerHTML = '<h1 class="sr-only">Rounds</h1><div class="me-realms">' + ME_REALMS.map(([k, n, sub, href]) => '<a class="me-realm" href="#' + href + '"><div class="me-rh"><b>' + n + '</b><span class="muted">' + sub + '</span></div><div class="ptiles">' +
      realmTiles(k).map(([lab, v, of]) => '<div class="ptile"><span>' + lab + '</span><b>' + v + (of != null ? '<small> / ' + of + '</small>' : '') + '</b></div>').join('') + '</div></a>').join('') + '</div>';
    return;
  }
  const tro = document.createElement('div'); viewTrophies(tro);
  const lv = tro.querySelector('.lvcard'); if (lv) lv.remove();
  const quests = tro.querySelector('.quests');
  if (tab === 'trophies') { if (quests) quests.remove(); page.innerHTML = ''; Array.from(tro.childNodes).forEach(n => page.appendChild(n)); return; }
  const xp = store.get('xp', 0), L = levelOf(xp), cur = LEVELS[L.n - 1][1], nxt = LEVELS[L.n] ? LEVELS[L.n][1] : cur + 600;
  const t = xpToday(), pct = Math.min(1, t / DAILY_GOAL), C = 2 * Math.PI * 20;
  page.innerHTML = '<div class="me-head">' + avatarHTML('big') + '<div class="me-id"><label class="sr-only" for="meName">Your name</label><input id="meName" class="me-name" maxlength="40" placeholder="Your name" value="' + esc(store.get('meName', '') || '') + '">' +
      '<div class="me-swatches" role="radiogroup" aria-label="Avatar colour">' + AV_COLORS.map(c => '<button type="button" class="me-sw' + (c === meColor() ? ' on' : '') + '" role="radio" aria-checked="' + (c === meColor()) + '" aria-label="Colour" data-c="' + c + '" style="background:' + c + '"></button>').join('') + '</div></div></div>' +
    playerTop(xp, L, cur, nxt, t, pct, C).replace('<a class="player" href="#me"', '<div class="player"').replace(/<\/a>$/, '</div>');
  if (quests) page.appendChild(quests);
  const inp = page.querySelector('#meName');
  inp.addEventListener('input', () => { store.set('meName', inp.value.slice(0, 40)); page.querySelector('.me-av.big').textContent = meInitials(); refreshMe(); });
  page.querySelector('.me-swatches').addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    store.set('meColor', b.dataset.c);
    page.querySelectorAll('.me-sw').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
    page.querySelector('.me-av.big').style.background = b.dataset.c; refreshMe();
  });
}
