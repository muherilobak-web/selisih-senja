/* Selisih Senja — semua suara dibuat oleh kode lewat WebAudio.
   Tidak ada berkas audio luar. Denting saat benar, nada rendah
   saat salah, melodi pendek saat menang, nada turun saat gagal,
   dan arpeggio lembut sebagai musik latar yang bisa dimatikan. */
(function () {
  var audioCtx = null;
  var muted = false;
  var musicTimer = null;
  var musicStep = 0;
  var MUSIC_NOTES = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46];

  function ensureCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type || "sine"; osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function playCorrect() { tone(880, 0.18, "sine", 0.22); tone(1318.5, 0.28, "sine", 0.2, 0.09); }
  function playWrong() { tone(196, 0.3, "triangle", 0.18); tone(155.5, 0.35, "triangle", 0.15, 0.08); }
  function playClick() { tone(660, 0.08, "sine", 0.1); }
  function playHint() { tone(1046.5, 0.15, "sine", 0.15); tone(783.99, 0.2, "sine", 0.14, 0.1); }
  function playWin() {
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.35, "sine", 0.2, i * 0.13); });
    tone(1318.5, 0.6, "sine", 0.18, 0.55);
  }
  function playLose() { tone(392, 0.35, "triangle", 0.16); tone(311.1, 0.4, "triangle", 0.16, 0.25); tone(233.1, 0.6, "triangle", 0.15, 0.5); }
  function startMusic() {
    if (musicTimer) return;
    musicTimer = setInterval(function () {
      if (muted) return;
      var f = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
      tone(f, 0.9, "sine", 0.05); musicStep++;
    }, 620);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  function isMuted() { return muted; }
  function setMuted(m) { muted = !!m; if (muted) stopMusic(); else startMusic(); return muted; }
  function toggleMuted() { return setMuted(!muted); }

  window.SelisihAudio = {
    playCorrect: playCorrect, playWrong: playWrong, playClick: playClick,
    playHint: playHint, playWin: playWin, playLose: playLose,
    startMusic: startMusic, stopMusic: stopMusic,
    isMuted: isMuted, setMuted: setMuted, toggleMuted: toggleMuted, ensureCtx: ensureCtx
  };
})();
