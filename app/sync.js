/* Account sync, in the claude.ai artifact only. Progress lives in localStorage under "pg:"; when the page runs
   as an artifact with the db and user capabilities, it is mirrored to the viewer's private subtree
   data/users/<id>/ so it follows them to other browsers and devices. Elsewhere (a saved file, your own host)
   nothing changes: progress stays in this browser.
   Layout: 16 shard documents data/users/<id>/s0..s15, each {v: 1, items: {key: [updatedAt, value | null]}}.
   The newest write of each key wins; a null value is a deletion. Runs inside the main IIFE. */
const SYNC = (() => {
  const PRE = 'pg:', META = 'tip:sync-meta', N = 16, MAX = 240 * 1024;
  const SKIP = k => k === 'pg:realm' || k.startsWith('pg:last:') || k === 'pg:mock';
  const st = { state: 'local', at: 0, db: null, uid: null, remote: {}, dirty: new Set(), chain: {}, timer: 0, pulledAt: 0 };
  const subs = new Set(); const emit = () => subs.forEach(f => { try { f(st.state); } catch (e) { /* listener */ } });
  const LS = (() => { try { return window.localStorage; } catch (e) { return null; } })();
  if (!LS) return { state: () => 'local', onChange: f => subs.add(f) };
  const rawSet = Storage.prototype.setItem, rawDel = Storage.prototype.removeItem;
  let meta = {}; try { meta = JSON.parse(LS.getItem(META) || '{}') || {}; } catch (e) { meta = {}; }
  let metaTimer = 0;
  const saveMeta = () => { clearTimeout(metaTimer); metaTimer = setTimeout(() => { try { rawSet.call(LS, META, JSON.stringify(meta)); } catch (e) { /* full */ } }, 400); };
  const shard = k => { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0; return Math.abs(h) % N; };
  const mine = k => typeof k === 'string' && k.startsWith(PRE) && !SKIP(k);

  // every local write of a synced key is stamped, and its shard queued for upload
  const touch = k => { meta[k] = Date.now(); saveMeta(); if (st.db) { st.dirty.add(shard(k)); schedule(); } };
  Storage.prototype.setItem = function (k, v) { rawSet.call(this, k, v); if (this === LS && mine(k)) touch(k); };
  Storage.prototype.removeItem = function (k) { rawDel.call(this, k); if (this === LS && mine(k)) touch(k); };

  function localItems(s) {
    const out = {};
    for (let i = 0; i < LS.length; i++) { const k = LS.key(i); if (mine(k) && shard(k) === s) out[k] = [meta[k] || 1, LS.getItem(k)]; }
    for (const k of Object.keys(meta)) if (mine(k) && shard(k) === s && !(k in out) && LS.getItem(k) == null) out[k] = [meta[k], null];
    return out;
  }
  const doc = s => st.db.doc('data/users/' + st.uid + '/s' + s);

  async function pull() {
    const snaps = await Promise.all(Array.from({ length: N }, (_, s) => doc(s).get()));
    let changed = false;
    snaps.forEach((snap, s) => {
      const items = (snap.exists && snap.data() && snap.data().items) || {};
      st.remote[s] = items;
      for (const [k, pair] of Object.entries(items)) {
        if (!mine(k) || !Array.isArray(pair)) continue;
        const [ts, val] = pair, cur = LS.getItem(k);
        if (ts > (meta[k] || 0)) {
          if (val == null) { if (cur != null) { rawDel.call(LS, k); changed = true; } }
          else if (cur !== val) { rawSet.call(LS, k, val); changed = true; }
          meta[k] = ts;
        } else if ((meta[k] || 0) > ts) st.dirty.add(s);
      }
      const L = localItems(s);
      if (Object.keys(L).some(k => !(k in items))) st.dirty.add(s);
    });
    saveMeta(); st.pulledAt = Date.now();
    return changed;
  }
  async function pushShard(s) {
    let items = localItems(s);
    // stay under the document size limit: keep the most recently changed keys
    let body = JSON.stringify(items);
    if (body.length > MAX) {
      const keep = {}; let size = 2;
      for (const [k, p] of Object.entries(items).sort((a, b) => b[1][0] - a[1][0])) { const n = k.length + JSON.stringify(p).length + 4; if (size + n > MAX) continue; keep[k] = p; size += n; }
      items = keep;
    }
    if (JSON.stringify(items) === JSON.stringify(st.remote[s] || {})) return;
    await doc(s).set({ v: 1, items });
    st.remote[s] = items;
  }
  // one write at a time per document
  function push() {
    const todo = [...st.dirty]; st.dirty.clear();
    if (!todo.length) return Promise.resolve();
    st.state = 'syncing'; emit();
    return Promise.all(todo.map(s => (st.chain[s] = (st.chain[s] || Promise.resolve()).then(() => pushShard(s)))))
      .then(() => { st.state = 'synced'; st.at = Date.now(); emit(); })
      .catch(e => { todo.forEach(s => st.dirty.add(s)); fail(e); });
  }
  function schedule() { clearTimeout(st.timer); st.timer = setTimeout(push, 2500); }
  function fail(e) {
    const c = e && e.code;
    st.state = c === 'quota_exceeded' ? 'full' : c === 'invalid_argument' || c === 'revoked' || c === 'not_granted' ? 'local' : 'error';
    if (st.state === 'local') st.db = null;   // this viewer may not write: stay on this device for the visit
    emit();
  }
  async function start() {
    if (!(window.claude && window.claude.use)) return;
    const [db, user] = await Promise.all([window.claude.use('db').catch(() => null), window.claude.use('user').catch(() => null)]);
    if (!db || !user) return;
    const uid = await user.id().catch(() => null);
    if (!uid) return;
    st.db = db; st.uid = uid; st.state = 'syncing'; emit();
    try {
      const changed = await pull();
      await push();
      if (st.state === 'syncing') { st.state = 'synced'; st.at = Date.now(); emit(); }
      if (changed && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('.CodeMirror, textarea, input'))) window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) { fail(e); }
    document.addEventListener('visibilitychange', () => {
      if (!st.db) return;
      if (document.visibilityState === 'hidden') { clearTimeout(st.timer); push(); }
      else if (Date.now() - st.pulledAt > 60000) pull().then(ch => { if (ch) window.dispatchEvent(new HashChangeEvent('hashchange')); return push(); }).catch(fail);
    });
  }
  start();
  const LABEL = { local: 'Saved in this browser', syncing: 'Syncing to your Claude account…', synced: 'Synced to your Claude account', error: 'Could not sync just now; saved in this browser', full: 'Your synced storage is full; saved in this browser' };
  return { state: () => st.state, label: () => LABEL[st.state], onChange: f => { subs.add(f); return () => subs.delete(f); } };
})();
window.SYNC = SYNC;
