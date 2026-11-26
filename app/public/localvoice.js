/* Local voice through audio.cpp (https://github.com/0xShug0/audio.cpp), for self-hosted copies.
   When an audio.cpp server is running (audiocpp_server --cors-origins "*"), the page uses it for both directions:
   - speech out: POST /v1/audio/speech with a TTS model such as Kokoro; each panel member gets their own voice.
   - speech in: the page records the microphone itself, finds where you stop talking from the audio level
     (voice activity detection), and sends each stretch of speech to POST /v1/audio/transcriptions.
   It exposes the same shapes as the claude.ai tts and dictation capabilities, so the interviewer code is unchanged.
   Settings live in localStorage under "tip:audiocpp". Loaded before selfhost.js. */
(() => {
  const KEY = 'tip:audiocpp';
  const DEF = { on: false, url: 'http://127.0.0.1:8080', voices: 'am_michael,bf_emma,am_fenrir', language: 'en' };
  const settings = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } };
  const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const fail = (code, message) => Object.assign(new Error(message || code), { code });
  const local = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  // find a running server and its speech (tts) and transcription (asr) models
  async function probe(force) {
    const c = settings();
    if (!force && !c.on && !local()) return null;   // a hosted page only looks for a local server once you turn it on
    const url = String(c.url || DEF.url).replace(/\/+$/, '');
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 1500);
    try {
      const r = await fetch(url + '/v1/models', { signal: ctl.signal });
      if (!r.ok) return null;
      const M = (await r.json()).data || [];
      const tts = M.find(m => m.task === 'tts'), asr = M.find(m => m.task === 'asr');
      if (!tts && !asr) return null;
      return { url, tts: tts ? tts.id : null, asr: asr ? asr.id : null, models: M.map(m => m.id + ' (' + m.task + ')'),
        voices: String(c.voices || '').split(',').map(s => s.trim()).filter(Boolean), language: c.language || '' };
    } catch (e) { return null; } finally { clearTimeout(t); }
  }

  /* ---------- speech out ---------- */
  function makeTTS(L) {
    const subs = new Set(), emit = s => subs.forEach(f => { try { f(s); } catch (e) { /* listener */ } });
    let ctl = null, audio = null, rate = 1;
    const VOICE = { rounded: 0, buttery: 0, glassy: 1, airy: 2 };   // the Claude voice names the app asks for
    const pick = v => L.voices.length ? L.voices[(VOICE[v] || 0) % L.voices.length] : undefined;
    // short pieces so the first one plays while the next is generated
    const pieces = t => (String(t).match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [String(t)]).reduce((a, s) => { if (a.length && (a[a.length - 1] + s).length < 160) a[a.length - 1] += s; else a.push(s); return a; }, []).map(s => s.trim()).filter(Boolean);
    async function synth(text, voice, signal) {
      const body = { model: L.tts, input: text }; if (voice) body.voice = voice; if (rate !== 1) body.speed = rate;
      const r = await fetch(L.url + '/v1/audio/speech', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
      if (!r.ok) throw fail('error', 'audio.cpp speech failed: ' + r.status + ' ' + (await r.text()).slice(0, 200));
      return URL.createObjectURL(await r.blob());
    }
    const play = (src, signal) => new Promise((res, rej) => {
      audio = new Audio(src);
      const done = () => { URL.revokeObjectURL(src); res(); };
      audio.onended = done; audio.onerror = () => { URL.revokeObjectURL(src); rej(fail('error', 'could not play the audio')); };
      signal.addEventListener('abort', () => { audio.pause(); URL.revokeObjectURL(src); rej(fail('stopped')); }, { once: true });
      audio.play().then(() => emit({ state: 'speaking' })).catch(e => rej(fail('error', e.message)));
    });
    return {
      concurrent: true,   // it is ordinary page audio, so it can play while the microphone is open
      speak(text, o) {
        if (ctl) ctl.abort();
        const my = ctl = new AbortController(), voice = pick(o && o.voice);
        const parts = Array.isArray(text) ? text.map(l => l.text) : pieces(text);
        emit({ state: 'starting' });
        return (async () => {
          let next = synth(parts[0], voice, my.signal);
          for (let i = 0; i < parts.length; i++) {
            const src = await next;
            next = i + 1 < parts.length ? synth(parts[i + 1], voice, my.signal) : null;
            if (next) next.catch(() => {});
            await play(src, my.signal);
          }
          if (ctl === my) emit({ state: 'idle', reason: 'completed' });
        })().catch(e => { if (ctl === my) emit({ state: 'idle', reason: e && e.code === 'stopped' ? 'stopped' : 'error' }); throw e; });
      },
      stop() { if (ctl) ctl.abort(); ctl = null; if (audio) audio.pause(); emit({ state: 'idle', reason: 'stopped' }); },
      setRate(r) { rate = r; },
      onState(f) { subs.add(f); return () => subs.delete(f); }
    };
  }

  /* ---------- speech in ---------- */
  // 16 kHz mono 16-bit WAV, which every audio.cpp ASR model accepts
  function wav(samples, rate) {
    const ratio = rate / 16000, n = Math.floor(samples.length / ratio), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const a = Math.floor(i * ratio), b = Math.min(samples.length, Math.floor((i + 1) * ratio)); let s = 0; for (let j = a; j < b; j++) s += samples[j]; s = b > a ? s / (b - a) : 0; v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true); }
    return new Blob([buf], { type: 'audio/wav' });
  }
  function makeDictation(L) {
    const cb = { partial: new Set(), final: new Set(), state: new Set(), level: new Set() };
    const emit = (k, v) => cb[k].forEach(f => { try { f(v); } catch (e) { /* listener */ } });
    const END_MS = 1100, PARTIAL_MS = 1400, MAX_MS = 30000;
    let st = null;
    async function transcribe(chunks, rate) {
      const n = chunks.reduce((a, c) => a + c.length, 0), all = new Float32Array(n); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
      const fd = new FormData(); fd.append('model', L.asr); fd.append('file', wav(all, rate), 'speech.wav'); if (L.language) fd.append('language', L.language);
      const r = await fetch(L.url + '/v1/audio/transcriptions', { method: 'POST', body: fd });
      if (!r.ok) throw fail('error', 'audio.cpp transcription failed: ' + r.status);
      const j = await r.json(); return String(j.text || '').trim();
    }
    function frame(x, s) {
      let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i];
      const rms = Math.sqrt(e / x.length), now = performance.now();
      emit('level', { level: Math.min(1, rms * 12) });
      if (!s.talking) s.noise = s.noise * 0.95 + rms * 0.05;            // track the room's background level between utterances
      const loud = rms > Math.max(0.01, s.noise * 3);
      s.pre.push(x); if (s.pre.length > 4) s.pre.shift();                  // keep the start of a word
      if (!s.talking) {
        s.hits = loud ? s.hits + 1 : 0;
        if (s.hits >= 2) { s.talking = true; s.utter = s.pre.slice(); s.began = now; s.lastLoud = now; s.lastPartial = now; }
        return;
      }
      s.utter.push(x); if (loud) s.lastLoud = now;
      if (now - s.lastLoud > END_MS || now - s.began > MAX_MS) { finish(s); return; }
      if (now - s.lastPartial > PARTIAL_MS && !s.busy) {
        s.lastPartial = now; s.busy = true;
        transcribe(s.utter.slice(), s.rate).then(t => { if (t && s.talking) emit('partial', { text: t }); }).catch(() => {}).finally(() => { s.busy = false; });
      }
    }
    function finish(s) {
      const chunks = s.utter; s.talking = false; s.utter = []; s.hits = 0;
      const job = transcribe(chunks, s.rate).then(t => { if (t) emit('final', { text: t }); }).catch(e => emit('partial', { text: '' }));
      s.jobs.push(job); return job;
    }
    return {
      vad: true,   // finals arrive at the end of each stretch of speech, found from the audio itself
      start() {
        if (st) return Promise.resolve();
        // the AudioContext is created inside the click or key press, so the browser lets it run
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const s = st = { ctx, stream: null, pre: [], utter: [], talking: false, hits: 0, noise: 0.005, jobs: [], rate: ctx.sampleRate };
        emit('state', { state: 'listening' });
        return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }).then(stream => {
          if (st !== s) { stream.getTracks().forEach(t => t.stop()); return; }
          s.stream = stream;
          const src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(2048, 1, 1), mute = ctx.createGain();
          mute.gain.value = 0; src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
          proc.onaudioprocess = e => { if (st === s) frame(new Float32Array(e.inputBuffer.getChannelData(0)), s); };
          s.proc = proc;
        }).catch(e => { st = null; ctx.close(); emit('state', { state: 'idle', reason: 'not_granted' }); throw fail('not_granted', e.message); });
      },
      async stop() {
        const s = st; if (!s) return;
        emit('state', { state: 'finishing' });
        st = null;
        if (s.talking && s.utter.length) finish(s);
        if (s.proc) s.proc.onaudioprocess = null;
        if (s.stream) s.stream.getTracks().forEach(t => t.stop());
        await Promise.all(s.jobs).catch(() => {});
        s.ctx.close().catch(() => {});
        emit('state', { state: 'idle', reason: 'stopped' });
      },
      onPartial(f) { cb.partial.add(f); return () => cb.partial.delete(f); },
      onFinal(f) { cb.final.add(f); return () => cb.final.delete(f); },
      onState(f) { cb.state.add(f); return () => cb.state.delete(f); },
      onLevel(f) { cb.level.add(f); return () => cb.level.delete(f); }
    };
  }

  // settings dialog: turn it on, the server address, the voices for the interviewer and the panel
  function dialog() {
    if (document.querySelector('.sh-dlg')) return;
    const c = settings(), d = document.createElement('dialog'); d.className = 'sh-dlg';
    d.innerHTML = '<form method="dialog"><h2>Local voice with audio.cpp</h2>' +
      '<p>Run an <a href="https://github.com/0xShug0/audio.cpp" target="_blank" rel="noopener">audio.cpp</a> server on this computer with a speech model and a transcription model, started with <code>--cors-origins "*"</code>. The interviewer then speaks and listens through it; nothing leaves your machine.</p>' +
      '<label class="sh-chk"><input type="checkbox" class="lv-on"> Use audio.cpp for voice</label>' +
      '<label>Server address<input class="lv-url" spellcheck="false"></label>' +
      '<label>Voices (interviewer, then the panel)<input class="lv-voices" spellcheck="false" placeholder="am_michael,bf_emma,am_fenrir"></label>' +
      '<p class="lv-status muted"></p>' +
      '<div class="sh-row"><button type="button" class="btn small lv-test">Test</button><span class="sh-sp"></span><button value="cancel" class="btn small">Cancel</button><button value="save" class="btn small primary">Save</button></div></form>';
    const $ = q => d.querySelector(q);
    $('.lv-on').checked = !!c.on; $('.lv-url').value = c.url; $('.lv-voices').value = c.voices;
    const read = () => ({ on: $('.lv-on').checked, url: $('.lv-url').value.trim() || DEF.url, voices: $('.lv-voices').value.trim(), language: c.language });
    $('.lv-test').onclick = async () => {
      const prev = settings(); save(read()); $('.lv-status').textContent = 'Looking for the server…';
      const L = await probe(true); save(prev);
      $('.lv-status').textContent = L ? 'Found: ' + L.models.join(', ') + (L.tts ? '' : '. No speech model.') + (L.asr ? '' : ' No transcription model.') : 'No audio.cpp server answered at that address. Is it running with --cors-origins "*"?';
    };
    d.addEventListener('close', () => { if (d.returnValue === 'save') { save(read()); location.reload(); } d.remove(); });
    document.body.appendChild(d); d.showModal();
  }

  window.LOCALVOICE = { probe, makeTTS, makeDictation, dialog, settings };
})();
