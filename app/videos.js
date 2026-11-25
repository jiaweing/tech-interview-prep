/* NeetCode walkthrough video for each problem: thumbnail, play inline, or open on YouTube. Data: window.VIDEO_DATA = { id: [[videoId, lcNumber, title, same], ...] } */
(function () {
'use strict';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ok = v => /^[A-Za-z0-9_-]{11}$/.test(v);
function html(P) {
  const L = ((window.VIDEO_DATA || {})[P && P.id] || []).filter(x => ok(x[0]));
  if (!L.length) return '';
  return '<div class="vid-sec"><span class="eyebrow">Watch</span>' + L.map(([v, n, t, same]) =>
    '<div class="vid" data-v="' + v + '"><button type="button" class="vid-thumb" aria-label="Play NeetCode video: ' + esc(t) + '"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v + '/mqdefault.jpg" onerror="this.remove()"><span class="vid-play">▶</span></button>' +
    '<div class="vid-meta"><b>NeetCode · LC ' + n + ' ' + esc(t) + '</b><span class="vid-tag ' + (same ? 'same' : '') + '">' + (same ? 'Same problem' : 'Similar idea') + '</span>' +
    '<a class="vid-open" href="https://www.youtube.com/watch?v=' + v + '" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></div></div>').join('') + '</div>';
}
document.addEventListener('click', e => {
  const b = e.target.closest('.vid-thumb'); if (!b) return;
  const box = b.closest('.vid'), v = box && box.dataset.v; if (!v || !ok(v)) return;
  const f = document.createElement('iframe');
  f.className = 'vid-frame'; f.src = 'https://www.youtube-nocookie.com/embed/' + v + '?autoplay=1&rel=0';
  f.title = 'NeetCode video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.loading = 'lazy';
  f.referrerPolicy = 'strict-origin-when-cross-origin';
  b.replaceWith(f);
});
window.VIDEOS = { html };
})();
