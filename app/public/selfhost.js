/* Self-hosted mode. Inside a claude.ai artifact the viewer supplies window.claude (sample, tts, dictation,
   downloads) before any script runs, and this file does nothing. Anywhere else (a saved file, GitHub Pages,
   your own server) it supplies the same four capabilities:
   - sample: the Anthropic API through the official SDK (bundled as window.ANTHROPIC_SDK), with an API key
     the visitor pastes in. The key stays in this browser's localStorage and is sent only to api.anthropic.com.
   - tts: the browser's speechSynthesis.
   - dictation: the browser's SpeechRecognition (Chrome, Edge, Safari).
   - downloads: a plain file download. */
(() => {
  if (window.claude) return;
  const KEY = 'tip:anthropic-key', MODEL = 'claude-opus-5-5';
  const read = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const write = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { /* storage blocked */ } };
  const fail = (code, message, text) => Object.assign(new Error(message || code), { code, text });

  /* ---------- settings dialog: paste or remove the API key ---------- */
  function keyDialog(reason) {
    if (document.querySelector('.sh-dlg')) return;
    const d = document.createElement('dialog'); d.className = 'sh-dlg';
    d.innerHTML = '<form method="dialog"><h2>Use your own Claude</h2>' +
      '<p class="sh-why"></p>' +
      '<p>Outside claude.ai, the AI interviewer, grading and chat call the Anthropic API with your key. It is kept only in this browser and sent only to api.anthropic.com. Create one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>.</p>' +
      '<label>Anthropic API key<input type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-..."></label>' +
      '<div class="sh-row"><button type="button" class="btn small sh-clear">Remove key</button><span class="sh-sp"></span><button value="cancel" class="btn small">Cancel</button><button value="save" class="btn small primary">Save</button></div></form>';
    d.querySelector('.sh-why').textContent = reason || '';
    const inp = d.querySelector('input'); inp.value = read(KEY);
    d.querySelector('.sh-clear').onclick = () => { write(KEY, ''); inp.value = ''; };
    d.addEventListener('close', () => { if (d.returnValue === 'save') write(KEY, inp.value.trim()); d.remove(); });
    document.body.appendChild(d); d.showModal(); inp.focus();
  }

  /* ---------- sample: Claude through the Anthropic SDK ---------- */
  async function sample(input, opts) {
    opts = opts || {};
    const key = read(KEY);
    if (!key) { keyDialog('Add an API key to talk to Claude here.'); throw fail('needs_key', 'Add your Anthropic API key first.'); }
    if (!window.ANTHROPIC_SDK) throw fail('unavailable', 'The Anthropic SDK did not load.');
    const messages = typeof input === 'string' ? [{ role: 'user', content: input }] : input.map(m => ({ role: m.role, content: m.content }));
    const client = new window.ANTHROPIC_SDK.Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
    let text = '';
    try {
      // fallbacks: if the model declines, the API reruns the request on a model it picks for that refusal category
      const stream = client.beta.messages.stream({
        model: MODEL, max_tokens: 16000, messages,
        output_config: { effort: opts.effort || 'low' },
        betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'
      }, { signal: opts.signal });
      stream.on('text', delta => { text += delta; if (opts.onText) opts.onText({ text, delta }); });
      const msg = await stream.finalMessage();
      if (msg.stop_reason === 'refusal') throw fail('refused', 'Claude would not answer that.', text);
      const out = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
      return { text: out, truncated: msg.stop_reason === 'max_tokens' };
    } catch (e) {
      const A = window.ANTHROPIC_SDK.Anthropic;
      if (e && e.code) throw e;
      if (e instanceof A.APIUserAbortError || (opts.signal && opts.signal.aborted)) throw fail('cancelled', 'Stopped.', text);
      if (e instanceof A.AuthenticationError || e instanceof A.PermissionDeniedError) { keyDialog('That API key was not accepted. Check it and try again.'); throw fail('not_granted', 'The API key was not accepted.', text); }
      if (e instanceof A.RateLimitError) throw fail('rate_limited', 'Rate limited.', text);
      if (e instanceof A.BadRequestError) throw fail('prompt_too_large', e.message, text);
      if (e instanceof A.APIConnectionError) throw fail('offline', 'Could not reach the Anthropic API.', text);
      throw fail('error', (e && e.message) || 'Something went wrong.', text);
    }
  }
  sample.json = async (input, opts) => {
    const r = await sample(input, Object.assign({ effort: 'medium' }, opts || {}));
    const t = r.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    try { return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t); } catch (e) { throw fail('bad_json', 'Claude did not return JSON.', r.text); }
  };
  sample.limits = async () => ({ images: false });

  /* ---------- tts: the browser's voice ---------- */
  function makeTTS() {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return null;
    const subs = new Set(), emit = s => subs.forEach(f => { try { f(s); } catch (e) { /* listener */ } });
    let rate = 1;
    const voice = () => { const V = speechSynthesis.getVoices() || []; return V.find(v => /^en/i.test(v.lang) && /natural|neural|google|samantha|daniel|serena/i.test(v.name)) || V.find(v => /^en/i.test(v.lang)) || null; };
    return {
      speak(text, o) {
        const lines = Array.isArray(text) ? text.map(l => l.text) : [String(text)];
        speechSynthesis.cancel();
        return new Promise((resolve, reject) => {
          let i = 0;
          const next = () => {
            if (i >= lines.length) { emit({ state: 'idle', reason: 'completed' }); resolve(); return; }
            const u = new SpeechSynthesisUtterance(lines[i++]); u.rate = (o && o.rate) || rate; const v = voice(); if (v) u.voice = v;
            u.onend = next; u.onerror = ev => { emit({ state: 'idle', reason: 'stopped' }); reject(fail(ev.error === 'interrupted' || ev.error === 'canceled' ? 'stopped' : 'error')); };
            speechSynthesis.speak(u);
          };
          emit({ state: 'speaking' }); next();
        });
      },
      stop() { speechSynthesis.cancel(); emit({ state: 'idle', reason: 'stopped' }); },
      setRate(r) { rate = r; },
      onState(f) { subs.add(f); return () => subs.delete(f); }
    };
  }

  /* ---------- dictation: the browser's speech recognition ---------- */
  function makeDictation() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const cb = { partial: new Set(), final: new Set(), state: new Set() };
    const emit = (k, v) => cb[k].forEach(f => { try { f(v); } catch (e) { /* listener */ } });
    let rec = null, want = false, stopWait = null;
    const make = () => {
      const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = navigator.language || 'en-US';
      r.onresult = ev => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) emit('final', { text: t.trim() }); else interim += t;
        }
        if (interim.trim()) emit('partial', { text: interim.trim() });
      };
      r.onerror = ev => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { want = false; emit('state', { state: 'idle', reason: 'not_granted' }); } };
      r.onend = () => {
        if (want) { try { r.start(); return; } catch (e) { want = false; } }   // the browser ends long sessions; carry on
        rec = null; emit('state', { state: 'idle', reason: 'stopped' }); if (stopWait) { stopWait(); stopWait = null; }
      };
      return r;
    };
    return {
      start() {
        if (rec) return Promise.resolve();
        want = true; rec = make();
        try { rec.start(); } catch (e) { rec = null; want = false; return Promise.reject(fail('unavailable', e.message)); }
        emit('state', { state: 'listening' });
        return Promise.resolve();
      },
      stop() { want = false; if (!rec) return Promise.resolve(); emit('state', { state: 'finishing' }); return new Promise(res => { stopWait = res; try { rec.stop(); } catch (e) { res(); } }); },
      onPartial(f) { cb.partial.add(f); return () => cb.partial.delete(f); },
      onFinal(f) { cb.final.add(f); return () => cb.final.delete(f); },
      onState(f) { cb.state.add(f); return () => cb.state.delete(f); }
    };
  }

  /* ---------- downloads ---------- */
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename || 'download';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
  };

  const caps = { sample, tts: makeTTS(), dictation: makeDictation(), downloads };
  window.claude = { use: name => Promise.resolve(caps[name] || null) };
  window.SELFHOST = { keyDialog, hasKey: () => !!read(KEY) };
})();
