/* Selisih Senja — logika permainan: status level, penghitung waktu,
   klik benar/salah, skor, petunjuk, jeda, dan kendali keyboard.
   File ini tidak menggambar adegan (itu tugas scene-renderer) dan
   tidak mengatur layar menu (itu tugas screens). */
(function () {
  var LEVELS = window.SELISIH_LEVELS;
  var R = window.SelisihRenderer;
  var A = window.SelisihAudio;

  var state = {
    screen: "menu", levelIndex: 0, found: [], timeLeft: 120, totalTimePlayed: 0,
    wrongCount: 0, hintsLeft: 3, paused: false, playing: false,
    levelScores: [0, 0, 0], stars: [0, 0, 0], unlocked: 1,
    focusIndex: 0, focusVisible: false, hintTarget: null, hintUntil: 0,
    missMarks: [], demo: false
  };
  var timerId = null, renderId = null, startEpoch = 0;

  function $(id) { return document.getElementById(id); }
  function level() { return LEVELS[state.levelIndex]; }
  function totalScore() { return state.levelScores.reduce(function (a, b) { return a + b; }, 0); }
  function remaining() { return level().diffs.length - state.found.length; }
  function bestScore() { try { return parseInt(localStorage.getItem("selisih-best") || "0", 10) || 0; } catch (e) { return 0; } }
  function saveBest() {
    try {
      if (totalScore() > bestScore()) localStorage.setItem("selisih-best", String(totalScore()));
      localStorage.setItem("selisih-unlocked", String(state.unlocked));
      localStorage.setItem("selisih-stars", JSON.stringify(state.stars));
    } catch (e) { /* penyimpanan boleh gagal diam-diam */ }
  }
  function loadProgress() {
    try {
      state.unlocked = Math.max(1, parseInt(localStorage.getItem("selisih-unlocked") || "1", 10) || 1);
      var s = JSON.parse(localStorage.getItem("selisih-stars") || "[0,0,0]");
      if (Array.isArray(s) && s.length === 3) state.stars = s;
    } catch (e) { /* mulai dari awal */ }
  }

  /* ---------- gambar ulang kedua panel ---------- */
  function renderAll() {
    var t = (Date.now() - startEpoch) / 1000;
    var cl = $("canvas-left"), cr = $("canvas-right");
    if (!cl || !cr || $("panels").hidden) return;
    var lv = level();
    R.drawScene(cl.getContext("2d"), lv, 0, t);
    R.drawScene(cr.getContext("2d"), lv, 1, t);
    state.found.forEach(function (diffId) {
      var d = lv.diffs.find(function (x) { return x.id === diffId; });
      if (d) { R.drawFoundRing(cl.getContext("2d"), lv, d, 0); R.drawFoundRing(cr.getContext("2d"), lv, d, 1); }
    });
    // petunjuk berdenyut
    if (state.hintTarget && Date.now() < state.hintUntil) {
      var hd = lv.diffs.find(function (x) { return x.id === state.hintTarget; });
      if (hd) { R.drawHintPulse(cl.getContext("2d"), lv, hd, 0, t); R.drawHintPulse(cr.getContext("2d"), lv, hd, 1, t); }
    }
    // sorot keyboard
    if (state.focusVisible) {
      var unfound = lv.diffs.filter(function (d) { return state.found.indexOf(d.id) < 0; });
      if (unfound.length) {
        var fd = unfound[state.focusIndex % unfound.length];
        R.drawFocusRing(cl.getContext("2d"), lv, fd, 0);
        R.drawFocusRing(cr.getContext("2d"), lv, fd, 1);
        var fn = $("focus-name"); if (fn) fn.textContent = "Sorot: perbedaan ke-" + (state.focusIndex % unfound.length + 1) + " dari " + unfound.length;
      }
    }
    // tanda silang klik salah yang memudar
    var now = Date.now();
    state.missMarks = state.missMarks.filter(function (m) { return now - m.at < 1200; });
    state.missMarks.forEach(function (m) {
      var alpha = 1 - (now - m.at) / 1200;
      var ctx = m.side === 0 ? cl.getContext("2d") : cr.getContext("2d");
      R.drawMissMark(ctx, m.x, m.y, alpha);
    });
  }

  function updateHud() {
    var lv = level();
    $("hud-level").textContent = "Level " + (state.levelIndex + 1) + ": " + lv.name;
    $("hud-remaining").textContent = String(remaining());
    $("hud-total").textContent = String(lv.diffs.length);
    var timeEl = $("hud-time"); timeEl.textContent = String(Math.max(0, state.timeLeft));
    timeEl.classList.toggle("low", state.timeLeft <= 30);
    $("hud-score").textContent = String(totalScore() + state.found.length * 100);
    $("hint-count").textContent = String(state.hintsLeft);
    $("btn-hint").disabled = state.hintsLeft <= 0 || remaining() === 0;
    var dots = $("hud-dots"); dots.innerHTML = "";
    lv.diffs.forEach(function (d) {
      var dot = document.createElement("span");
      dot.className = "dot" + (state.found.indexOf(d.id) >= 0 ? " found" : "");
      dots.appendChild(dot);
    });
  }

  /* ---------- alur level ---------- */
  function startLevel(idx, opts) {
    opts = opts || {};
    state.levelIndex = idx; state.found = []; state.timeLeft = level().timeLimit;
    state.wrongCount = 0; state.hintsLeft = 3; state.paused = false; state.playing = true;
    state.hintCost = 0; state.focusIndex = 0; state.focusVisible = false; state.hintTarget = null; state.missMarks = [];
    state.screen = "playing"; startEpoch = Date.now();
    $("hud").hidden = false; $("panels").hidden = false; $("focus-bar").hidden = false;
    window.SelisihScreens.show("playing");
    stopTimers(); startTimers();
    if (opts.prefound) {
      opts.prefound.forEach(function (id) { if (state.found.indexOf(id) < 0) state.found.push(id); });
    }
    if (opts.timeLeft != null) state.timeLeft = opts.timeLeft;
    if (opts.score != null) { /* skor demo hanya tampilan */ }
    updateHud(); renderAll(); A.ensureCtx();
  }
  function startGame() { state.levelScores = [0, 0, 0]; state.stars = [0, 0, 0]; state.unlocked = 1; state.totalTimePlayed = 0; startLevel(0); }
  function stopTimers() { if (timerId) { clearInterval(timerId); timerId = null; } if (renderId) { clearInterval(renderId); renderId = null; } }
  function startTimers() {
    timerId = setInterval(function () {
      if (!state.playing || state.paused) return;
      state.timeLeft--; state.totalTimePlayed++;
      if (state.timeLeft <= 0) { state.timeLeft = 0; updateHud(); failLevel(); return; }
      updateHud();
    }, 1000);
    renderId = setInterval(renderAll, 140);
  }

  function foundDiff(d) {
    state.found.push(d.id); A.playCorrect(); updateHud(); renderAll();
    if (remaining() === 0) completeLevel();
  }
  function completeLevel() {
    state.playing = false; stopTimers(); A.playWin(); A.stopMusic();
    var lv = level();
    var diffPoints = lv.diffs.length * 100;
    var timeBonus = state.timeLeft * 5;
    var cleanBonus = state.wrongCount === 0 ? 200 : 0;
    var levelScore = Math.max(0, diffPoints + timeBonus + cleanBonus - (state.hintCost || 0));
    state.levelScores[state.levelIndex] = levelScore;
    var stars = (state.wrongCount === 0 && state.timeLeft >= lv.timeLimit * 0.4) ? 3 : (state.wrongCount <= 2 ? 2 : 1);
    state.stars[state.levelIndex] = stars;
    state.unlocked = Math.max(state.unlocked, Math.min(3, state.levelIndex + 2));
    saveBest();
    window.SelisihScreens.showComplete({ diffPoints: diffPoints, timeBonus: timeBonus, cleanBonus: cleanBonus, levelScore: levelScore, total: totalScore(), stars: stars, levelName: lv.name, isLast: state.levelIndex === 2 });
  }
  function failLevel() {
    state.playing = false; stopTimers(); A.playLose();
    window.SelisihScreens.showFail({ found: state.found.length, total: level().diffs.length, levelName: level().name });
  }

  /* ---------- klik ---------- */
  function sceneCoords(canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    return { x: (ev.clientX - rect.left) * 560 / rect.width, y: (ev.clientY - rect.top) * 420 / rect.height };
  }
  function handleCanvasClick(canvas, side, ev) {
    if (!state.playing || state.paused || state.screen !== "playing") return;
    var p = sceneCoords(canvas, ev);
    var lv = level();
    var hit = null;
    lv.diffs.forEach(function (d) {
      if (state.found.indexOf(d.id) >= 0) return;
      var pos = R.posOf(lv, d.id, side);
      var dist = Math.hypot(p.x - pos.x, p.y - pos.y);
      if (dist <= d.r + 10 && !hit) hit = d;
    });
    if (hit) { foundDiff(hit); return; }
    // klik salah
    state.missMarks.push({ x: p.x, y: p.y, side: side, at: Date.now() });
    state.wrongCount++; state.timeLeft = Math.max(0, state.timeLeft - 5);
    A.playWrong(); updateHud(); renderAll();
    if (state.timeLeft <= 0) failLevel();
  }

  /* ---------- petunjuk, jeda, bisu ---------- */
  function useHint() {
    if (!state.playing || state.paused || state.hintsLeft <= 0 || remaining() === 0) return false;
    var unfound = level().diffs.filter(function (d) { return state.found.indexOf(d.id) < 0; });
    if (!unfound.length) return false;
    var target = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintTarget = target.id; state.hintUntil = Date.now() + 3000; state.hintsLeft--;
    // Biaya 50 poin per petunjuk; dikurangkan dari skor level saat level selesai.
    state.hintCost = (state.hintCost || 0) + 50;
    A.playHint(); updateHud(); renderAll();
    setTimeout(function () { state.hintTarget = null; }, 3000);
    return true;
  }
  function pauseGame() { if (!state.playing) return; state.paused = true; window.SelisihScreens.show("pause"); }
  function resumeGame() { state.paused = false; window.SelisihScreens.show("playing"); updateHud(); }
  function quitToMenu() { state.playing = false; state.paused = false; stopTimers(); A.stopMusic(); window.SelisihScreens.show("menu"); }
  function nextLevel() {
    if (state.levelIndex >= 2) { window.SelisihScreens.showVictory({ total: totalScore(), time: state.totalTimePlayed, stars: state.stars }); return; }
    startLevel(state.levelIndex + 1);
  }

  /* ---------- keyboard ---------- */
  function onKey(ev) {
    var k = ev.key;
    if (k === "m" || k === "M") { window.SelisihScreens.toggleMuteUI(); return; }
    if (state.screen === "playing" && state.playing) {
      if (k === "p" || k === "P" || k === "Escape") { ev.preventDefault(); if (state.paused) resumeGame(); else pauseGame(); return; }
      if (k === "h" || k === "H") { ev.preventDefault(); useHint(); return; }
      if (k === "ArrowRight" || k === "ArrowLeft" || k === "ArrowDown" || k === "ArrowUp") {
        ev.preventDefault(); state.focusVisible = true;
        var n = remaining(); if (!n) return;
        if (k === "ArrowRight" || k === "ArrowDown") state.focusIndex = (state.focusIndex + 1) % n;
        else state.focusIndex = (state.focusIndex - 1 + n) % n;
        renderAll(); return;
      }
      if (k === "Enter" || k === " ") {
        ev.preventDefault(); state.focusVisible = true;
        var unfound = level().diffs.filter(function (d) { return state.found.indexOf(d.id) < 0; });
        if (!unfound.length) return;
        foundDiff(unfound[state.focusIndex % unfound.length]); return;
      }
    } else if (state.screen === "pause" && (k === "p" || k === "P" || k === "Escape")) {
      ev.preventDefault(); resumeGame();
    }
  }

  /* ---------- mode demo untuk tangkapan layar ---------- */
  function demoStart(levelIdx, foundCount, timeLeft) {
    state.demo = true;
    startLevel(levelIdx, { timeLeft: timeLeft || 98 });
    var ids = level().diffs.slice(0, foundCount || 0).map(function (d) { return d.id; });
    ids.forEach(function (id) { if (state.found.indexOf(id) < 0) state.found.push(id); });
    updateHud(); renderAll();
  }
  function demoComplete(levelIdx) {
    state.demo = true;
    startLevel(levelIdx, { timeLeft: 86 });
    level().diffs.forEach(function (d) { state.found.push(d.id); });
    updateHud(); renderAll();
    // langsung hitung skor seperti level selesai
    state.playing = false; stopTimers();
    var lv = level();
    var diffPoints = lv.diffs.length * 100, timeBonus = 86 * 5, cleanBonus = 200;
    state.levelScores[levelIdx] = diffPoints + timeBonus + cleanBonus;
    state.stars[levelIdx] = 3;
    window.SelisihScreens.showComplete({ diffPoints: diffPoints, timeBonus: timeBonus, cleanBonus: cleanBonus, levelScore: diffPoints + timeBonus + cleanBonus, total: diffPoints + timeBonus + cleanBonus, stars: 3, levelName: lv.name, isLast: false });
  }

  loadProgress();
  document.addEventListener("keydown", onKey);
  window.SelisihGame = {
    state: state, startLevel: startLevel, startGame: startGame, nextLevel: nextLevel,
    pauseGame: pauseGame, resumeGame: resumeGame, quitToMenu: quitToMenu,
    useHint: useHint, handleCanvasClick: handleCanvasClick, renderAll: renderAll,
    updateHud: updateHud, totalScore: totalScore, bestScore: bestScore,
    demoStart: demoStart, demoComplete: demoComplete, saveBest: saveBest
  };
})();
