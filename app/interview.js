/* Mock interviewer as a voice call. Claude plays the interviewer.
   Turn-taking: words arrive from the dictation capability; when they stop arriving for a moment, the turn ends and is sent.
   Hands-free mode keeps the microphone open for the whole call and speaks with the browser's voice (the Claude voice
   cannot play while the microphone is open); Claude-voice mode speaks with the tts capability and you tap to talk.
   Coding problems ("Interview me"), system design rounds and the Deep dive round. Runs inside the main IIFE. */
const INTERVIEW = (() => {
  let tts = null, dict = null, ready = false;
  const PAUSE_MS = 1500;
  (async () => {
    if (!(window.claude && window.claude.use)) return;
    tts = await window.claude.use('tts').catch(() => null);
    dict = await window.claude.use('dictation').catch(() => null);
    if (tts) try { tts.onState(({ state }) => { if (S && S.mode === 'claude') setSpeaking(state === 'speaking' || state === 'starting'); }); } catch (e) { /* no state */ }
    if (dict) {
      dict.onPartial(({ text }) => heard(text, false));
      dict.onFinal(({ text }) => heard(text, true));
      dict.onState(({ state, reason }) => { if (!S) return; S.mic = state === 'listening' || state === 'starting'; paint(); if (state === 'idle') { if (reason === 'not_granted' || reason === 'unavailable') { S.noMic = true; S.mode = 'claude'; note('Microphone is off for this page. Type your answers.'); paint(); } else if (S.mode === 'claude' && (S.pending + S.partial).trim()) endTurn(); } });
    }
    ready = true;
  })();
  const strip = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const I = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const ICON = {
    mic: I('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>'),
    micOff: I('<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>'),
    keys: I('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>'),
    list: I('<path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"/>'),
    hands: I('<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>'),
    spark: I('<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>'),
    expand: I('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>'),
    shrink: I('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>'),
    end: I('<path d="M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473"/><line x1="22" x2="2" y1="2" y2="22"/>'),
    x: I('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')
  };
  const browserVoice = () => typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  let S = null; // the running call

  /* ---------- state and painting ---------- */
  function note(t) { if (S) S.noteEl.textContent = t || ''; }
  function setSpeaking(on) { if (!S) return; S.speaking = on; if (!on) S.quietUntil = Date.now() + 600; paint(); }
  function paint() {
    if (!S) return;
    const st = S.busy ? 'thinking' : S.speaking ? 'speaking' : S.mic ? 'listening' : 'idle';
    S.el.dataset.state = st;
    S.stateEl.textContent = { thinking: 'Thinking…', speaking: 'Interviewer is speaking', listening: S.pending.trim() ? 'Listening… pause to send' : 'Listening', idle: S.noMic || !dict ? 'Type your answer' : S.mode === 'hands' ? 'Tap the mic to start' : 'Tap the mic or press Space to talk' }[st];
    const micB = S.el.querySelector('[data-c=mic]');
    if (micB.dataset.on !== String(S.mic)) { micB.innerHTML = S.mic ? ICON.mic : ICON.micOff; micB.dataset.on = String(S.mic); } micB.classList.toggle('on', S.mic); micB.hidden = !dict || S.noMic;
    micB.setAttribute('aria-label', S.mic ? (S.mode === 'hands' ? 'Mute the microphone' : 'Stop and send') : 'Talk');
    const hb = S.el.querySelector('[data-c=mode]'); hb.hidden = !dict || S.noMic || !browserVoice() || !tts;
    if (hb.dataset.m !== S.mode) { hb.dataset.m = S.mode; hb.innerHTML = S.mode === 'hands' ? ICON.hands : ICON.spark; }
    hb.title = S.mode === 'hands' ? 'Hands-free: the mic stays open and the browser voice speaks. Click for the Claude voice (tap to talk)' : 'Claude voice: tap the mic for each answer. Click for hands-free'; hb.setAttribute('aria-label', hb.title);
    S.el.querySelector('[data-c=size] ').innerHTML = S.full ? ICON.shrink : ICON.expand;
    S.el.classList.toggle('iv-full', S.full); document.body.classList.toggle('iv-full-on', S.full);
    const gk = (st === 'listening') + '|' + S.full;
    if (S.glow && gk !== S.glowKey) { S.glowKey = gk; try { S.glow.update({ active: st === 'listening', type: S.full ? 'mobile' : 'default', borderRadius: S.full ? 0 : 24 }); } catch (e) { /* glow off */ } }
  }

  /* ---------- hearing: words in, end of turn by pause ---------- */
  function heard(text, final) {
    if (!S) return;
    if (S.ignoring()) { S.echo = !final; return; }   // the interviewer's own voice (or while it thinks)
    if (S.echo) { if (final) S.echo = false; return; }   // the tail of that same utterance
    const before = (S.pending + ' ' + S.partial).trim().length;
    if (final) { S.pending = (S.pending + ' ' + text).replace(/\s+/g, ' ').trim(); S.partial = ''; }
    else S.partial = text;
    S.lastHeard = Date.now();
    const live = (S.pending + ' ' + S.partial).trim();
    S.lv = Math.min(1.1, (S.lv || 0) + 0.3 + 0.025 * Math.max(0, live.length - before));   // words arriving light the glow
    if (live) { S.capEl.textContent = live; S.capEl.className = 'iv-cap you'; }
    paint();
  }
  function endTurn() {
    if (!S) return;
    const text = (S.pending + ' ' + S.partial).trim(); S.pending = ''; S.partial = '';
    if (text) send(text);
  }
  function watchPause() {
    if (!S) return;
    const ig = S.ignoring(); if (ig !== S.wasIgnoring) { S.wasIgnoring = ig; paint(); }
    if (S.busy || S.speaking || !S.mic) return;
    const live = (S.pending + ' ' + S.partial).trim();
    const now = Date.now(), done = S.stream ? now - S.lastLoud > 1000 && now - S.lastHeard > 600 : now - S.lastHeard > PAUSE_MS;
    if (live && done) {
      if (S.mode === 'claude') { dict.stop().catch(() => {}); }   // idle state then sends
      else endTurn();
    }
  }

  /* ---------- speaking ---------- */
  function speak(text) {
    if (!S) return;
    text = String(text).slice(0, 1990);
    if (S.mode === 'hands' && browserVoice()) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.rate = 1.02;
        const v = (speechSynthesis.getVoices() || []).find(x => /en[-_](US|GB|AU|SG)/i.test(x.lang) && /natural|neural|google|samantha|daniel|serena/i.test(x.name)) || (speechSynthesis.getVoices() || []).find(x => /^en/i.test(x.lang));
        if (v) u.voice = v;
        u.onboundary = () => { if (S) S.kick = 1; };
        u.onstart = () => setSpeaking(true); u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
        setSpeaking(true); speechSynthesis.speak(u);
      } catch (e) { setSpeaking(false); }
      return;
    }
    if (tts && !S.mic) { try { tts.speak(text, { voice: 'rounded' }).catch(() => setSpeaking(false)); } catch (e) { /* voice off */ } }
  }
  function hush() { try { if (tts) tts.stop(); } catch (e) { /* ignore */ } try { if (browserVoice()) speechSynthesis.cancel(); } catch (e) { /* ignore */ } setSpeaking(false); }

  /* ---------- transcript and talking to Claude ---------- */
  function add(role, text) {
    const row = document.createElement('div'); row.className = 'iv-msg ' + (role === 'assistant' ? 'iv-them' : 'iv-you');
    const who = document.createElement('b'); who.textContent = role === 'assistant' ? 'Interviewer' : 'You';
    const p = document.createElement('p'); p.textContent = text;
    row.appendChild(who); row.appendChild(p); S.log.appendChild(row); S.log.scrollTop = 1e9;
    return p;
  }
  function caption(text, who) { if (!S) return; S.capEl.textContent = text; S.capEl.className = 'iv-cap ' + who; }
  async function send(text) {
    if (!S || S.busy) return;
    text = String(text || '').trim(); if (!text) return;
    hush(); add('user', text); caption(text, 'you');
    const mins = Math.floor((Date.now() - S.start) / 60000), lim = S.cfg.minutes || 45;
    const extra = '[Time: ' + mins + ' of ' + lim + ' minutes used' + (mins >= lim ? ', time is up: wrap up now' : mins >= lim * 0.8 ? ', start wrapping up' : '') + ']' + (S.cfg.context ? '\n' + S.cfg.context() : '');
    S.turns.push({ role: 'user', content: text + '\n\n' + extra });
    S.busy = true; S.input.value = ''; paint();
    const p = add('assistant', '…'); S.ctl = new AbortController();
    if (!AI.sample) { p.textContent = 'Claude is not available on this page right now.'; S.busy = false; paint(); return; }
    try {
      const msgs = [{ role: 'user', content: S.cfg.rules }, { role: 'assistant', content: S.cfg.opener }].concat(S.turns.slice(-16));
      const r = await AI.sample(msgs, { cache: false, signal: S.ctl.signal, onText: ({ text: t }) => { if (S) { p.textContent = t; S.log.scrollTop = 1e9; } } });
      if (!S) return;
      const say = (r.text || '').trim();
      p.textContent = say; S.turns.push({ role: 'assistant', content: say });
      S.busy = false; caption(say, 'them'); speak(say); paint();
      if (/feedback/i.test(text)) { if (S.cfg.onFeedback) S.cfg.onFeedback(say); scorecard(); }
    } catch (e) {
      if (S) { p.textContent = (AI_ERR || {})[e && e.code] || 'The interviewer lost the line. Try again.'; S.turns.pop(); }
    } finally { if (S) { S.busy = false; S.ctl = null; paint(); } }
  }
  async function scorecard() {
    if (!S || !AI.sample || !AI.sample.json) return;
    const dims = S.cfg.dims || ['Communication', 'Problem solving', 'Code quality', 'Testing'];
    const transcript = S.turns.map(t => (t.role === 'assistant' ? 'Interviewer: ' : 'Candidate: ') + String(t.content).split('\n\n[Time')[0]).join('\n').slice(-7000);
    const box = document.createElement('div'); box.className = 'iv-card'; box.textContent = 'Scoring the interview…';
    S.cardHost.innerHTML = ''; S.cardHost.appendChild(box); S.el.classList.add('scored'); S.full = true; S.el.querySelector('.iv-sheet').hidden = true; S.el.querySelector('[data-c=log]').classList.remove('on'); paint();
    try {
      const G = await AI.sample.json('Score this mock interview strictly but fairly, like the hiring panel would. Round: ' + S.cfg.title + '.\n\nTranscript:\n' + transcript +
        '\n\nReply with ONLY JSON: {"scores": {' + dims.map(d => '"' + d + '": 1-5').join(', ') + '}, "verdict": "Strong hire|Hire|Lean hire|Lean no hire|No hire", "fix_first": "the single most useful thing to practise, one sentence"}', { cache: false });
      if (!S) return;
      box.innerHTML = '';
      const h = document.createElement('b'); h.className = 'iv-verdict'; h.textContent = (G && G.verdict) || 'Scored'; box.appendChild(h);
      dims.forEach(d => { const v = Math.max(0, Math.min(5, +((G && G.scores) || {})[d] || 0)); const r = document.createElement('div'); r.className = 'iv-score'; const l = document.createElement('span'); l.textContent = d; const dots = document.createElement('i'); dots.className = 'iv-dots'; for (let k = 1; k <= 5; k++) { const x = document.createElement('em'); if (k <= v) x.className = 'on'; dots.appendChild(x); } r.appendChild(l); r.appendChild(dots); box.appendChild(r); });
      if (G && G.fix_first) { const p = document.createElement('p'); p.textContent = 'Fix first: ' + G.fix_first; box.appendChild(p); }
    } catch (e) { if (S) box.textContent = 'Could not score this one. The spoken feedback still stands.'; }
  }

  /* ---------- microphone ---------- */
  function micTap() {
    if (!S || !dict || S.noMic) return;
    if (S.mic) {
      if (S.mode === 'hands') { dict.stop().catch(() => {}); return; }   // mute
      dict.stop().catch(() => {}); return;                              // stop; the idle state sends what was said
    }
    if (S.speaking) hush();
    S.quietUntil = 0; S.echo = false;
    S.pending = ''; S.partial = ''; S.lastHeard = Date.now();
    // start() must run straight from the click or key press, before anything is awaited
    const started = dict.start();
    tryStream();
    started.catch(err => { if (err && err.code === 'not_granted' && S) { S.noMic = true; note('Microphone is off for this page. Type your answers.'); paint(); } });
  }

  function tryStream() {
    if (!S || S.stream !== undefined) return;
    S.stream = null;
    const pol = document.permissionsPolicy || document.featurePolicy;
    if (!pol || !pol.allowsFeature || !pol.allowsFeature('microphone') || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(st => {
      if (!S) { st.getTracks().forEach(t => t.stop()); return; }
      S.stream = st; S.lastLoud = Date.now(); if (S.glow) try { S.glow.update({ stream: st }); } catch (e) { /* glow off */ }
    }).catch(() => { /* words drive the glow instead */ });
  }
  // the glow's level when there is no audio: a burst for each batch of words, fading out
  function userLevel() {
    if (!S) return 0;
    const now = performance.now(), dt = Math.min(0.1, (now - (S.lvT || now)) / 1000); S.lvT = now;
    S.lv = (S.lv || 0) * Math.exp(-dt * 1.8);
    const talking = Date.now() - S.lastHeard < 700 ? 0.18 + 0.08 * Math.sin(now / 95) : 0;
    return Math.min(1, S.lv + talking);
  }
  /* ---------- the interviewer: five bars ---------- */
  const ENV = [0.5, 0.78, 1, 0.78, 0.5];
  function vizLoop() {
    if (!S) return;
    S.raf = requestAnimationFrame(vizLoop);
    const now = performance.now(), dt = Math.min(0.1, (now - (S.vzT || now)) / 1000); S.vzT = now;
    const st = S.el.dataset.state, t = now / 1000;
    S.kick = (S.kick || 0) * Math.exp(-dt * 6);
    S.bars.forEach((b, i) => {
      let f;
      if (st === 'speaking') {
        const n = (Math.sin(t * (7.1 + i * 1.3) + i * 2.1) + Math.sin(t * (4.3 - i * 0.6) + i)) / 4 + 0.5;
        f = ENV[i] * (0.28 + 0.6 * n + 0.25 * S.kick);
      } else if (st === 'thinking') f = 0.08 + 0.3 * Math.max(0, Math.sin(t * 6 - i * 0.75));
      else if (st === 'listening') f = 0.04 + 0.16 * ENV[i] * Math.min(1, S.lv || 0) * (0.7 + 0.3 * Math.sin(t * 9 + i));
      else f = 0.03 + 0.03 * Math.sin(t * 1.4 + i * 0.5);
      const prev = S.fv[i] || 0, next = prev + (Math.max(0, Math.min(1, f)) - prev) * (1 - Math.exp(-dt * 16));
      S.fv[i] = next; b.style.setProperty('--f', next.toFixed(3));
    });
  }

  /* ---------- the call screen ---------- */
  function close() {
    if (!S) return;
    hush();
    try { if (dict && S.mic) dict.stop().catch(() => {}); } catch (e) { /* ignore */ }
    if (S.ctl) S.ctl.abort();
    clearInterval(S.tick); clearInterval(S.vad); cancelAnimationFrame(S.raf); document.removeEventListener('keydown', S.onKey, true);
    if (S.stream) S.stream.getTracks().forEach(t => t.stop());
    if (S.glow) try { S.glow.unmount(); } catch (e) { /* ignore */ }
    S.el.remove(); document.body.classList.remove('iv-on', 'iv-full-on'); S = null;
  }
  function open(cfg) {
    close();
    const el = document.createElement('section'); el.className = 'iv'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Mock interview call');
    el.innerHTML =
      '<div class="iv-top"><span class="iv-title"></span><span class="iv-time">00:00</span><button type="button" class="iv-b iv-close" data-c="close" aria-label="Leave without feedback">' + ICON.x + '</button></div>' +
      '<div class="iv-glow" aria-hidden="true"></div>' +
      '<div class="iv-stage"><div class="iv-viz" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p class="iv-state" aria-live="polite"></p><p class="iv-cap them"></p><div class="iv-cardhost"></div></div>' +
      '<div class="iv-chips"></div>' +
      '<div class="iv-sheet" hidden><div class="iv-log" aria-live="polite"></div></div>' +
      '<form class="iv-type" hidden><input type="text" placeholder="Type your answer" aria-label="Type your answer"><button type="submit" class="iv-b iv-send" aria-label="Send">↑</button></form>' +
      '<p class="iv-note"></p>' +
      '<div class="iv-bar">' +
        '<button type="button" class="iv-b" data-c="mode" aria-label="Hands-free or Claude voice">' + ICON.hands + '</button>' +
        '<button type="button" class="iv-b" data-c="keys" aria-label="Type instead">' + ICON.keys + '</button>' +
        '<button type="button" class="iv-b iv-mic" data-c="mic">' + ICON.micOff + '</button>' +
        '<button type="button" class="iv-b" data-c="log" aria-label="Transcript">' + ICON.list + '</button>' +
        '<button type="button" class="iv-b" data-c="size" aria-label="Full screen or call bar">' + ICON.expand + '</button>' +
        '<button type="button" class="iv-b iv-end" data-c="end" aria-label="End the interview and get feedback">' + ICON.end + '</button>' +
      '</div>';
    el.querySelector('.iv-title').textContent = cfg.title;
    const chips = el.querySelector('.iv-chips');
    (cfg.chips || []).forEach(([label, say]) => { const c = document.createElement('button'); c.type = 'button'; c.className = 'iv-chip'; c.textContent = label; c.dataset.say = say; chips.appendChild(c); });
    chips.onclick = e => { const c = e.target.closest('[data-say]'); if (c && S && !S.busy) send(c.dataset.say); };
    document.body.appendChild(el); document.body.classList.add('iv-on');
    S = { cfg, el, log: el.querySelector('.iv-log'), input: el.querySelector('.iv-type input'), capEl: el.querySelector('.iv-cap'), stateEl: el.querySelector('.iv-state'), noteEl: el.querySelector('.iv-note'), bars: Array.from(el.querySelectorAll('.iv-viz i')), fv: [], lv: 0, lastLoud: 0, stream: undefined, cardHost: el.querySelector('.iv-cardhost'),
      turns: [], echo: false, busy: false, speaking: false, mic: false, noMic: false, pending: '', partial: '', lastHeard: 0, quietUntil: 0, start: Date.now(), full: !!cfg.wide,
      mode: browserVoice() && dict ? 'hands' : 'claude' };
    // the mic only overlaps the interviewer's voice in hands-free mode; there, words heard while it talks are its own
    S.ignoring = () => S.busy || (S.mode === 'hands' && (S.speaking || Date.now() < S.quietUntil));
    S.tick = setInterval(() => { if (!S) return; const s = Math.floor((Date.now() - S.start) / 1000); el.querySelector('.iv-time').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
    S.vad = setInterval(watchPause, 200);
    S.raf = requestAnimationFrame(vizLoop);
    // your voice: the Voice Glow rising from the bottom edge while the interviewer listens
    if (window.VOICEGLOW) try { S.glow = VOICEGLOW.mount(el.querySelector('.iv-glow'), { theme: 'dark', type: S.full ? 'mobile' : 'default', borderRadius: S.full ? 0 : 24, level: userLevel, active: false, onLevel: l => { if (S && l > 0.16) S.lastLoud = Date.now(); } }); } catch (e) { S.glow = null; }
    el.querySelector('.iv-bar').addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b || !S) return;
      const c = b.dataset.c;
      if (c === 'mic') micTap();
      else if (c === 'keys') { const f = el.querySelector('.iv-type'); f.hidden = !f.hidden; b.classList.toggle('on', !f.hidden); if (!f.hidden) S.input.focus(); }
      else if (c === 'log') { const sh = el.querySelector('.iv-sheet'); sh.hidden = !sh.hidden; b.classList.toggle('on', !sh.hidden); S.log.scrollTop = 1e9; }
      else if (c === 'size') { S.full = !S.full; paint(); }
      else if (c === 'mode') { if (S.mic) dict.stop().catch(() => {}); hush(); S.mode = S.mode === 'hands' ? 'claude' : 'hands'; note(S.mode === 'hands' ? 'Hands-free: tap the mic once and just talk. Headphones help, so it does not hear itself.' : 'Claude voice: tap the mic (or press Space) for each answer. It sends when you pause.'); paint(); }
      else if (c === 'end') { if (S.busy) return; S.pending = ''; S.partial = ''; if (S.mic) dict.stop().catch(() => {}); send('Let\'s stop here. Can I get your feedback?'); }
    });
    el.querySelector('[data-c=close]').onclick = close;
    el.querySelector('.iv-type').onsubmit = e => { e.preventDefault(); send(S.input.value); };
    S.onKey = e => {
      if (!S) return;
      if (e.key === 'Escape' && S.full) { S.full = false; paint(); return; }
      const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.CodeMirror'));
      const alt = e.altKey && (e.code === 'KeyM' || e.key === 'm' || e.key === 'M');
      if (alt || (e.key === ' ' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); micTap(); }
    };
    document.addEventListener('keydown', S.onKey, true);
    if (!dict) note(ready ? 'Voice input is not available here. Use the keyboard button to type.' : '');
    add('assistant', cfg.opener); caption(cfg.opener, 'them'); paint();
    speak(cfg.opener);
  }
  /* ---------- coding problem ---------- */
  function forProblem(P, page) {
    const al = document.body.dataset.realm === 'al', CR = window.CO ? CO.round('coding') : null;
    const round = CR ? 'a ' + CR.company + ' "' + CR.name + '" round (' + CR.minutes + ' minutes): ' + CR.what
      : window.CO ? 'a 45-minute live coding interview with an engineer, LeetCode style'
      : al ? 'an AppLovin backend "short code" round: 45 minutes, LeetCode-style, with a backend engineer' : 'a 60-minute live coding round, pair-programming style';
    const mins = CR ? CR.minutes : window.CO ? 45 : al ? 45 : 60;
    const ext = ((P.al && P.al.extensions) || (P.govtech && P.govtech.extensions) || []).map(strip).slice(0, 5);
    const rules = 'You are the interviewer in ' + round + '. The candidate codes in Python in the editor next to you, and you talk with them out loud.\n\n' +
      'PROBLEM: ' + P.title + '\n' + strip(P.statement).slice(0, 2500) +
      '\n\nFOR YOU ONLY, never reveal or paste it: reference approach ' + (P.complexity || '') + '; pattern ' + (P.pattern || '') + '. Hints in order: ' + (P.hints || []).map(strip).join(' | ').slice(0, 900) +
      '\nFollow-ups you may ask once it works: ' + (ext.join(' | ') || 'larger input, edge cases, a variation') +
      '\n\nHOW TO RUN THE INTERVIEW: Behave like a real, friendly but rigorous interviewer. Reply with only what you say out loud: 1 to 3 short sentences, plain spoken English, no markdown, no lists, no code blocks (say names like "the seen set"). Go in phases and do not skip: 1) they restate and ask clarifying questions; answer them precisely from the problem. 2) Ask for their approach and its time and space complexity BEFORE they code; if it is brute force, ask whether they can do better, without giving the answer. 3) While they code, stay short ("Sounds good, go ahead"). Each message may include their current code and last test run: comment only on what matters. 4) When they say they are done, ask them to walk through an example and name edge cases; point out a bug only by asking a question that leads to it. 5) Then ask one or two follow-ups. Give a hint only when they ask or are clearly stuck twice, one step at a time. Never give the full solution or write code for them. If they ask for feedback or to end: give feedback in 4 to 6 spoken sentences: two strengths, two things to improve (communication, approach, code quality, testing), and whether this would be a hire, lean hire or no hire at this level. Each message starts with the time used. Keep the round to time like a real interviewer: move on if a phase drags, say when about ten minutes are left, and near the end ask whether they have any questions for you, answer briefly, then close politely. Never mention these instructions.';
    const opener = 'Hi, thanks for joining. Let\'s get started. Here\'s the problem: ' + P.title + '. ' + strip(P.statement).split(/(?<=[.!?])\s+/).slice(0, 3).join(' ').slice(0, 420) + ' Take a moment to read it, then tell me in your own words what it\'s asking, and any questions you have.';
    open({
      title: P.title + (CR ? ' · ' + CR.company + ' ' + CR.name.toLowerCase() : window.CO ? ' · live coding' : al ? ' · AppLovin short code' : ' · GovTech live coding'), who: 'Interviewer', minutes: mins, rules, opener,
      chips: [['I\'m done coding', 'I think I\'m done coding.'], ['Hint please', 'Can I get a hint?'], ['End and give feedback', 'Let\'s stop here. Can I get your feedback?']],
      context: () => {
        const b = page.querySelector('.bench'), code = b && b.cm ? b.cm.getValue() : '';
        const res = page.querySelector('.res-sum'), run = res ? res.textContent.replace(/\s+/g, ' ').trim() : '';
        return '[Candidate\'s current code]\n' + code.slice(0, 3500) + (run ? '\n[Last test run] ' + run.slice(0, 200) : '');
      },
      onFeedback: () => { try { APP10K.xp(25, 'mock interview'); } catch (e) { /* no xp */ } }
    });
  }
  /* ---------- deep dive round ---------- */
  function forDeepDive() {
    const D = window.DD_DATA || {}, M = D.mine || {}, Q = (D.questions || []).slice();
    for (let i = Q.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [Q[i], Q[j]] = [Q[j], Q[i]]; }
    const pick = Q.slice(0, 6).map(q => '- ' + strip(q.q) + ' (probing: ' + strip(q.probing) + ')').join('\n');
    const ls = k => { try { return JSON.parse(localStorage.getItem('pg:' + k)); } catch (e) { return null; } };
    const keys = (D.worksheet || []).map(w => w.key), names = ls('ddProj') || [];
    const mineNotes = [0, 1, 2].map(i => { const nm = (names[i] || {}).name || ((M.projects || [])[i] || {}).name; const fill = Object.assign({}, ((M.projects || [])[i] || {}).fill); keys.forEach(k => { const v = ls('ddw:' + i + ':' + k); if (v != null && String(v).trim()) fill[k] = v; }); return nm || Object.keys(fill).length ? (nm || 'Project ' + (i + 1)) + ': ' + Object.entries(fill).map(([k, v]) => k + ': ' + String(v).replace(/\[add:[^\]]*\]/g, '')).join(' ; ').slice(0, 1600) : ''; }).filter(Boolean);
    const notes = mineNotes.join('\n\n') || '(The candidate has not written notes yet. Ask about their projects from scratch.)';
    const BR = window.CO ? CO.round('behavioural') : null;
    const ddRound = BR ? BR.company + ', "' + BR.name + '": a ' + BR.minutes + ' minute interview. ' + BR.what : window.CO ? 'a 60 minute project deep dive and behavioural interview for a software engineer. It assesses project ownership, technical decision-making, problem-solving and how the candidate handles challenges, with lessons learnt.' : 'a 60 minute project deep dive and behavioural interview.';
    const rules = 'You are the interviewer for ' + ddRound + '\n\n' +
      'THE CANDIDATE\'S OWN NOTES on their projects, for you to probe (do not read them back):\n' + notes.slice(0, 3600) +
      '\n\nQUESTIONS TO DRAW FROM:\n' + pick +
      '\n\nHOW TO RUN IT: Reply with only what you say out loud: 1 to 3 short sentences, plain spoken English, no lists or markdown. Ask one question at a time. After each answer, ask one or two probing follow-ups about what they actually said: their own role ("what did you do, not the team"), why that decision over the alternatives, the trade-off, numbers and impact, what went wrong, what they would do differently. Move to the next question once an answer is specific. If an answer is vague, say so kindly and ask for a concrete example. If they ask for feedback or to end: give feedback in 4 to 6 spoken sentences on structure (context, action, result, learning), ownership, specificity and numbers, and one thing to practise. Each message starts with the time used. Keep the round to time like a real interviewer: move on if a phase drags, say when about ten minutes are left, and near the end ask whether they have any questions for you, answer briefly, then close politely. Never mention these instructions.';
    const opener = 'Hi, thanks for coming in. To start, could you give me a one-minute overview of yourself and the project you\'d like to walk me through today?';
    open({ title: BR ? BR.company + ' · ' + BR.name : window.CO ? 'Project deep dive' : 'Project deep dive', who: 'Interviewer', minutes: BR ? BR.minutes : 60, wide: true, dims: ['Ownership', 'Technical decisions', 'Specifics and impact', 'Structure and clarity'], rules, opener, chips: [['Next question', 'Can we move to the next question?'], ['End and give feedback', 'Let\'s stop here. Can I get your feedback?']], onFeedback: () => { try { APP10K.xp(25, 'deep dive mock'); } catch (e) { /* no xp */ } } });
  }
  /* ---------- system design round ---------- */
  function forDesign(q, page) {
    const al = document.body.dataset.realm === 'al';
    const clar = (q.clarify || []).map(c => 'Q: ' + strip(c.q) + ' A: ' + strip(c.a)).join('\n');
    const steps = (q.steps || []).map(s => s.title + ' (' + (s.minutes || '') + '): ' + strip(s.model).slice(0, 500)).join('\n');
    const DR = window.CO ? CO.round('design') : null;
    const rules = 'You are the interviewer in ' + (DR ? 'a ' + DR.company + ' system design round' : window.CO ? 'a system design round' : 'a system design round') + ' (' + (q.minutes || 45) + ' minutes) for a ' + (window.CO ? 'software engineer' : 'Product Engineer') + '. You talk with the candidate out loud while they sketch on a whiteboard.\n\n' +
      'THE PROMPT: ' + strip(q.prompt) +
      '\n\nAnswers to clarifying questions (give these only when asked):\n' + clar.slice(0, 1800) +
      '\n\nFOR YOU ONLY, a strong answer covers (never read it out):\n' + steps.slice(0, 3200) +
      '\nRubric: ' + (q.rubric || []).map(strip).join(' | ').slice(0, 1200) +
      '\n\nHOW TO RUN IT: Reply with only what you say out loud: 1 to 3 short sentences, plain spoken English, no lists or markdown. Let the candidate drive, in this order: requirements and scope, rough numbers, API and data model, high-level design, one deep dive, bottlenecks and trade-offs. If they jump ahead, pull them back once. Each message may include what is on their whiteboard and their notes; react to that. Probe like a real interviewer: what happens at 10 times the traffic, what fails first, why this database, how does it stay consistent, what does it cost. Do not hand them the design; if they are stuck, ask a narrower question. Keep an eye on time. If they ask for feedback or to end: give feedback in 4 to 6 spoken sentences against the rubric: what was strong, what was missing, and hire, lean hire or no hire. Each message starts with the time used. Keep the round to time like a real interviewer: move on if a phase drags, say when about ten minutes are left, and near the end ask whether they have any questions for you, answer briefly, then close politely. Never mention these instructions.';
    const opener = 'Hi, thanks for joining. Here\'s today\'s design question. ' + strip(q.prompt).slice(0, 520) + ' Where would you like to start?';
    open({
      title: q.title + ' · system design', who: 'Interviewer', minutes: q.minutes || 45, wide: true, dims: ['Requirements and scope', 'High-level design', 'Deep dive and trade-offs', 'Communication'], rules, opener,
      chips: [['Next phase', 'I think that covers this part. What would you like to see next?'], ['Hint please', 'I\'m a bit stuck. Can you point me in a direction?'], ['End and give feedback', 'Let\'s stop here. Can I get your feedback?']],
      context: () => {
        let board = '';
        try { const B = JSON.parse(localStorage.getItem('pg:sdboard:' + q.id) || 'null'); if (B && B.nodes && B.nodes.length) { const nm = id => (B.nodes.find(n => n.id === id) || {}).label || id; board = 'components: ' + B.nodes.map(n => n.label + ' (' + n.kind + ')').join(', ') + '; arrows: ' + (B.edges || []).map(e => nm(e.from) + ' -> ' + nm(e.to) + (e.label ? ' (' + e.label + ')' : '')).join(', '); } } catch (e) { /* no board */ }
        const notes = Array.from(page.querySelectorAll('.sdp-step textarea')).map((t, i) => t.value.trim() ? ((q.steps[i] || {}).title || 'Step') + ': ' + t.value.trim() : '').filter(Boolean).join('\n');
        return (board ? '[Whiteboard] ' + board.slice(0, 1500) : '[Whiteboard is empty]') + (notes ? '\n[Their notes]\n' + notes.slice(0, 2000) : '');
      },
      onFeedback: () => { try { APP10K.xp(25, 'design mock'); } catch (e) { /* no xp */ } }
    });
  }
  /* ---------- entry points ---------- */
  function mountButtons(page, h) {
    if (h.startsWith('p-') && probById[h.slice(2)] && !page.classList.contains('exam')) {
      const head = page.querySelector('.prob-head'); if (!head || head.querySelector('.iv-start')) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small primary iv-start'; b.textContent = 'Interview me';
      b.title = 'A spoken mock interview on this problem: the interviewer asks, listens and follows up';
      b.onclick = () => forProblem(probById[h.slice(2)], page);
      const sp = head.querySelector('.ide-sp'); if (sp) sp.after(b); else head.appendChild(b);
    }
    if (h.startsWith('sd-q-') && window.SD_DATA && !page.querySelector('.iv-start')) {
      const q = (SD_DATA.practice || []).find(x => x.id === h.slice(5)), row = page.querySelector('.sd-head .row');
      if (q && row) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small primary iv-start'; b.textContent = 'Interview me'; b.title = 'A spoken mock of this design round'; b.onclick = () => forDesign(q, page); row.appendChild(b); }
    }
    if (h === 'dd-mock' && !page.querySelector('.iv-dd')) {
      const c = document.createElement('section'); c.className = 'iv-dd';
      c.innerHTML = '<div><h2>Voice mock</h2><p class="muted">The interviewer asks out loud, listens to your answer and probes it, like a real deep dive round.</p></div><button type="button" class="btn primary">Start the voice mock</button>';
      c.querySelector('button').onclick = forDeepDive;
      page.prepend(c);
    }
  }
  return { mountButtons, close };
})();
