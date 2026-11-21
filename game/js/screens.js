/* Selisih Senja — layar dan menu: menu utama, cara bermain,
   pilih level, jeda, level selesai, gagal, dan kemenangan akhir.
   File ini hanya mengatur tampilan; logika permainan ada di
   game-logic dan gambar adegan ada di scene-renderer. */
(function () {
  var LEVELS = window.SELISIH_LEVELS;
  var R = window.SelisihRenderer;
  var A = window.SelisihAudio;
  var G = null; // diisi saat bootstrap (game-logic sudah dimuat duluan)

  function $(id) { return document.getElementById(id); }
  function game() { if (!G) G = window.SelisihGame; return G; }
  var SCREENS = ["menu", "howto", "levels", "pause", "complete", "fail", "victory"];
  var MAP = { menu: "screen-menu", howto: "screen-howto", levels: "screen-levels", pause: "screen-pause", complete: "screen-complete", fail: "screen-fail", victory: "screen-victory" };

  function show(name) {
    var g = game();
    if (g) g.state.screen = name;
    SCREENS.forEach(function (s) { var el = $(MAP[s]); if (el) el.hidden = (s !== name); });
    var playing = (name === "playing");
    $("panels").hidden = !playing && name !== "pause" && name !== "complete" && name !== "fail" && name !== "victory";
    // Saat layar akhir tampil di atas panel, panel tetap terlihat di belakang overlay.
    if (name === "pause" || name === "complete" || name === "fail" || name === "victory") $("panels").hidden = false;
    $("hud").hidden = !(playing || name === "pause" || name === "complete" || name === "fail" || name === "victory");
    $("focus-bar").hidden = !playing;
    if (name === "menu") { $("panels").hidden = true; $("hud").hidden = true; renderMenuHero(); updateBest(); }
    if (name === "levels") renderLevelCards();
    if (name === "howto") renderHowtoDemo();
  }

  function renderMenuHero() {
    var c = $("menu-canvas"); if (!c) return;
    R.drawSceneScaled(c.getContext("2d"), c.width, c.height, LEVELS[0], 0, 1.2);
    // lingkari kucing sebagai contoh kecil di latar menu
    var ctx = c.getContext("2d");
    ctx.save(); ctx.scale(c.width / 560, c.height / 420);
    R.drawFoundRing(ctx, LEVELS[0], LEVELS[0].diffs[0], 0);
    ctx.restore();
  }
  function renderHowtoDemo() {
    var l = $("howto-canvas-left"), r = $("howto-canvas-right");
    if (!l || !r) return;
    R.drawSceneScaled(l.getContext("2d"), l.width, l.height, LEVELS[0], 0, 0.5);
    R.drawSceneScaled(r.getContext("2d"), r.width, r.height, LEVELS[0], 1, 0.5);
    var ctx = l.getContext("2d");
    ctx.save(); ctx.scale(l.width / 560, l.height / 420);
    R.drawFoundRing(ctx, LEVELS[0], LEVELS[0].diffs[0], 0);
    ctx.restore();
    var ctx2 = r.getContext("2d");
    ctx2.save(); ctx2.scale(r.width / 560, r.height / 420);
    R.drawFoundRing(ctx2, LEVELS[0], LEVELS[0].diffs[0], 1);
    ctx2.restore();
  }
  function updateBest() {
    var g = game(); var el = $("best-score");
    if (el && g) el.textContent = String(g.bestScore());
  }
  function renderLevelCards() {
    var wrap = $("level-cards"); if (!wrap) return;
    var g = game(); wrap.innerHTML = "";
    LEVELS.forEach(function (lv, i) {
      var locked = i + 1 > g.state.unlocked;
      var card = document.createElement("div");
      card.className = "level-card" + (locked ? " locked" : "");
      var stars = "☆☆☆".split("").map(function (_, s) { return s < g.state.stars[i] ? "★" : "☆"; }).join("");
      card.innerHTML = "<canvas width='230' height='150'></canvas><h3>" + (i + 1) + ". " + lv.name + "</h3>" +
        "<p>" + lv.subtitle + "</p><p>" + lv.diffs.length + " perbedaan • " + lv.timeLimit + " detik</p>" +
        "<p>" + (locked ? "🔒 Terkunci — selesaikan level sebelumnya" : "Bintang: " + stars) + "</p>";
      var cv = card.querySelector("canvas");
      R.drawSceneScaled(cv.getContext("2d"), cv.width, cv.height, lv, 0, 0.8 + i);
      if (!locked) card.addEventListener("click", function () { A.playClick(); g.startLevel(i); });
      wrap.appendChild(card);
    });
  }

  function showComplete(d) {
    $("complete-stars").textContent = "★".repeat(d.stars) + "☆".repeat(3 - d.stars);
    $("complete-level-name").textContent = d.levelName + " selesai!";
    $("score-diff").textContent = String(d.diffPoints);
    $("score-time").textContent = "+" + d.timeBonus;
    $("score-clean").textContent = "+" + d.cleanBonus;
    $("score-level-total").textContent = String(d.levelScore);
    $("score-grand-total").textContent = String(d.total);
    $("btn-next-level").textContent = d.isLast ? "🏆 Lihat Kemenangan" : "➡ Level Berikutnya";
    show("complete");
  }
  function showFail(d) {
    $("fail-text").textContent = "Kamu menemukan " + d.found + " dari " + d.total + " perbedaan di " + d.levelName + ". Hampir sampai — coba lagi!";
    show("fail");
  }
  function showVictory(d) {
    $("victory-score").textContent = String(d.total);
    $("victory-time").textContent = String(d.time);
    var wrap = $("victory-stars"); wrap.innerHTML = "";
    LEVELS.forEach(function (lv, i) {
      var p = document.createElement("p");
      p.textContent = lv.name + ": " + "★".repeat(d.stars[i]) + "☆".repeat(3 - d.stars[i]);
      wrap.appendChild(p);
    });
    show("victory");
  }
  function toggleMuteUI() {
    var m = A.toggleMuted();
    var label = m ? "🔇 Bisu" : "🔊 Suara";
    var b1 = $("btn-mute"); if (b1) b1.textContent = label;
    var b2 = $("btn-pause-mute"); if (b2) b2.textContent = m ? "🔇 Suara: bisu" : "🔊 Suara: nyala";
    return m;
  }

  window.SelisihScreens = {
    show: show, showComplete: showComplete, showFail: showFail,
    showVictory: showVictory, toggleMuteUI: toggleMuteUI,
    renderMenuHero: renderMenuHero, updateBest: updateBest
  };
})();
