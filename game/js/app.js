/* Selisih Senja — bootstrap: memasang semua tombol, klik kanvas,
   dan membaca penanda demo di alamat halaman untuk tangkapan layar.
   Penanda demo: ?demo=1:3 artinya level 1 dengan 3 perbedaan sudah
   ketemu; ?demo=2:4 level 2 dengan 4 ketemu; ?demo=3:2 level 3 dengan
   2 ketemu; ?demo=complete:1 artinya layar level selesai level 1. */
(function () {
  function $(id) { return document.getElementById(id); }
  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }

  function boot() {
    var G = window.SelisihGame, S = window.SelisihScreens, A = window.SelisihAudio;
    if (!G || !S || !A) { setTimeout(boot, 50); return; }

    on("btn-play", "click", function () { A.ensureCtx(); A.playClick(); A.startMusic(); G.startGame(); });
    on("btn-howto", "click", function () { A.playClick(); S.show("howto"); });
    on("btn-levels", "click", function () { A.playClick(); S.show("levels"); });
    on("btn-howto-back", "click", function () { A.playClick(); S.show("menu"); });
    on("btn-levels-back", "click", function () { A.playClick(); S.show("menu"); });
    on("btn-hint", "click", function () { G.useHint(); });
    on("btn-mute", "click", function () { S.toggleMuteUI(); });
    on("btn-pause", "click", function () { G.pauseGame(); });
    on("btn-resume", "click", function () { G.resumeGame(); });
    on("btn-restart-level", "click", function () { G.startLevel(G.state.levelIndex); });
    on("btn-quit-menu", "click", function () { G.quitToMenu(); });
    on("btn-pause-mute", "click", function () { S.toggleMuteUI(); });
    on("btn-next-level", "click", function () { A.playClick(); G.nextLevel(); });
    on("btn-replay-level", "click", function () { G.startLevel(G.state.levelIndex); });
    on("btn-complete-menu", "click", function () { G.quitToMenu(); });
    on("btn-retry-level", "click", function () { G.startLevel(G.state.levelIndex); });
    on("btn-fail-menu", "click", function () { G.quitToMenu(); });
    on("btn-play-again", "click", function () { G.startGame(); });
    on("btn-victory-menu", "click", function () { G.quitToMenu(); });

    var cl = $("canvas-left"), cr = $("canvas-right");
    if (cl) cl.addEventListener("click", function (ev) { G.handleCanvasClick(cl, 0, ev); });
    if (cr) cr.addEventListener("click", function (ev) { G.handleCanvasClick(cr, 1, ev); });

    // Penanda demo untuk tangkapan layar.
    var params = new URLSearchParams(window.location.search);
    var demo = params.get("demo");
    if (demo) {
      var parts = demo.split(":");
      if (parts[0] === "complete") {
        G.demoComplete(parseInt(parts[1] || "1", 10) - 1);
      } else {
        var li = parseInt(parts[0] || "1", 10) - 1;
        var fc = parseInt(parts[1] || "0", 10);
        var times = [98, 88, 112];
        G.demoStart(li, fc, times[li] || 90);
      }
      return;
    }
    S.show("menu");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
