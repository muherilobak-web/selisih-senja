/* Selisih Senja — mesin gambar prosedural.
   Satu-satunya tugas file ini: menggambar adegan di kanvas dari kode,
   tanpa gambar luar. Tiap level digambar dari daftar objek yang sama;
   perbedaan hanya mengubah satu objek di satu panel. */
(function () {
  var W = 560, H = 420;

  function circle(ctx, x, y, r, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  }
  function poly(ctx, pts, color) {
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }
  function line(ctx, x1, y1, x2, y2, color, w) {
    ctx.strokeStyle = color; ctx.lineWidth = w || 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function grad(ctx, x0, y0, x1, y1, stops) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function diffById(level, id) {
    for (var i = 0; i < level.diffs.length; i++) if (level.diffs[i].id === id) return level.diffs[i];
    return null;
  }
  function isRight(level, id) { return true; } // placeholder dihapus pemakaian
  function posOf(level, id, side) {
    var d = diffById(level, id);
    if (!d) return { x: 0, y: 0 };
    if (side === 1 && d.kind === "geser") return { x: d.x + (d.dx || 0), y: d.y + (d.dy || 0) };
    return { x: d.x, y: d.y };
  }
  function colorOf(level, id, side, leftColor, rightColor) {
    var d = diffById(level, id);
    if (d && d.kind === "warna" && side === 1) return rightColor;
    return leftColor;
  }
  function present(level, id, side) {
    var d = diffById(level, id);
    if (!d) return true;
    if (d.kind === "hilang") return side === 0;
    if (d.kind === "tambah") return side === 1;
    return true;
  }

  /* ---------- gambar kecil yang dipakai ulang ---------- */
  function drawCat(ctx, x, y) {
    ellipse(ctx, x, y, 20, 12, "#e8a34c");            // badan kucing oranye
    circle(ctx, x + 16, y - 10, 9, "#e8a34c");        // kepala
    poly(ctx, [[x + 10, y - 16], [x + 12, y - 26], [x + 17, y - 17]], "#e8a34c");
    poly(ctx, [[x + 18, y - 17], [x + 22, y - 26], [x + 24, y - 16]], "#e8a34c");
    line(ctx, x - 18, y - 4, x - 30, y - 14, "#e8a34c", 4); // ekor
    circle(ctx, x + 19, y - 11, 1.6, "#222"); circle(ctx, x + 13, y - 11, 1.6, "#222");
    line(ctx, x - 6, y + 8, x - 6, y + 12, "#c97e2e", 3); line(ctx, x + 4, y + 8, x + 4, y + 12, "#c97e2e", 3);
  }
  function drawChicken(ctx, x, y) {
    ellipse(ctx, x, y, 13, 10, "#fff3d6");
    circle(ctx, x + 11, y - 9, 7, "#fff3d6");
    poly(ctx, [[x + 9, y - 15], [x + 12, y - 20], [x + 15, y - 15]], "#e14b32");
    circle(ctx, x + 13, y - 10, 1.5, "#222");
    poly(ctx, [[x + 17, y - 8], [x + 23, y - 6], [x + 17, y - 5]], "#f2a541");
    line(ctx, x - 4, y + 9, x - 4, y + 14, "#f2a541", 2); line(ctx, x + 4, y + 9, x + 4, y + 14, "#f2a541", 2);
  }
  function drawBicycle(ctx, x, y) {
    circle(ctx, x - 18, y, 13, "rgba(0,0,0,0)"); ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x - 18, y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 18, y, 13, 0, Math.PI * 2); ctx.stroke();
    line(ctx, x - 18, y, x, y - 14, "#3a2a1a", 3); line(ctx, x + 18, y, x, y - 14, "#3a2a1a", 3);
    line(ctx, x, y - 14, x + 10, y - 20, "#3a2a1a", 3); line(ctx, x - 6, y - 20, x + 10, y - 20, "#3a2a1a", 3);
    line(ctx, x - 18, y, x + 18, y, "#3a2a1a", 2);
  }
  function drawBird(ctx, x, y, color) {
    ctx.strokeStyle = color || "#333"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.quadraticCurveTo(x - 3, y - 7, x, y);
    ctx.quadraticCurveTo(x + 3, y - 7, x + 9, y); ctx.stroke();
  }
  function drawStarfish(ctx, x, y, color) {
    ctx.fillStyle = color; ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      var a2 = a + Math.PI / 5;
      ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
      ctx.lineTo(x + Math.cos(a2) * 6, y + Math.sin(a2) * 6);
    }
    ctx.closePath(); ctx.fill();
  }
  function drawMonkey(ctx, x, y) {
    ellipse(ctx, x, y, 15, 13, "#8a5a33"); circle(ctx, x, y - 16, 11, "#8a5a33");
    circle(ctx, x - 8, y - 16, 4, "#d9b48a"); circle(ctx, x + 8, y - 16, 4, "#d9b48a");
    ellipse(ctx, x, y - 12, 7, 5, "#d9b48a");
    circle(ctx, x - 4, y - 18, 1.6, "#222"); circle(ctx, x + 4, y - 18, 1.6, "#222");
    line(ctx, x + 12, y + 4, x + 24, y - 10, "#8a5a33", 4);
    line(ctx, x - 10, y + 10, x - 14, y + 18, "#8a5a33", 3); line(ctx, x + 10, y + 10, x + 14, y + 18, "#8a5a33", 3);
  }
  function drawMushroom(ctx, x, y, capColor) {
    rect(ctx, x - 6, y - 6, 12, 20, "#f5e6c8");
    ctx.fillStyle = capColor; ctx.beginPath(); ctx.arc(x, y - 6, 18, Math.PI, 0); ctx.closePath(); ctx.fill();
    circle(ctx, x - 8, y - 14, 3, "#fff"); circle(ctx, x + 6, y - 18, 2.5, "#fff");
  }

  /* ---------- LEVEL 1: PASAR SENJA ---------- */
  function drawPasar(ctx, level, side, t) {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 420, [[0, "#7b2d8b"], [0.45, "#e2703a"], [0.7, "#f7b267"], [1, "#f7d08a"]]);
    ctx.fillRect(0, 0, W, H);
    circle(ctx, 448, 96, 34, "#ffe9a8"); circle(ctx, 448, 96, 26, "#fff3c4");
    ellipse(ctx, 120, 62, 52, 14, "rgba(255,220,180,0.75)"); ellipse(ctx, 300, 42, 60, 13, "rgba(255,200,170,0.6)");
    // rumah jauh
    rect(ctx, 0, 210, 90, 70, "#6e3a6e"); poly(ctx, [[0, 210], [45, 182], [90, 210]], "#4a2350");
    rect(ctx, 470, 200, 90, 80, "#6e3a6e"); poly(ctx, [[470, 200], [515, 172], [560, 200]], "#4a2350");
    rect(ctx, 22, 232, 14, 18, "#ffd98a"); rect(ctx, 492, 222, 14, 18, "#ffd98a");
    // tanah pasar
    ctx.fillStyle = grad(ctx, 0, 280, 0, 420, [[0, "#c98a4b"], [1, "#8a5a33"]]); ctx.fillRect(0, 280, W, 140);
    ellipse(ctx, 280, 300, 260, 12, "rgba(0,0,0,0.12)");
    // spanduk kain
    line(ctx, 60, 120, 500, 120, "#5a2d1a", 3);
    var bannerColors = ["#e14b32", "#f2a541", "#3f9e6b", "#e14b32", "#f2a541"];
    for (var i = 0; i < 5; i++) {
      poly(ctx, [[70 + i * 86, 120], [150 + i * 86, 120], [142 + i * 86, 152], [78 + i * 86, 152]], bannerColors[i]);
      circle(ctx, 110 + i * 86, 136, 5, "#fff7e8");
    }
    // kios buah kiri: tenda garis
    for (var s = 0; s < 6; s++) rect(ctx, 120 + s * 22, 168, 22, 26, s % 2 ? "#fff3d6" : "#e14b32");
    poly(ctx, [[112, 168], [258, 168], [250, 196], [120, 196]], "rgba(0,0,0,0.15)");
    rect(ctx, 126, 196, 8, 90, "#7a4a22"); rect(ctx, 244, 196, 8, 90, "#7a4a22");
    rect(ctx, 118, 252, 140, 14, "#a06a35"); // meja kios
    // tumpukan buah — perbedaan warna
    var fruitColor = colorOf(level, "buah", side, "#f2762e", "#7fc94a");
    var fx, fy;
    for (fy = 0; fy < 3; fy++) for (fx = 0; fx < 5 - fy; fx++) circle(ctx, 158 + fx * 22 + fy * 11, 244 - fy * 16, 10, fruitColor);
    for (fx = 0; fx < 4; fx++) circle(ctx, 138 + fx * 18, 252, 9, "#e14b32");
    // karung + kucing — perbedaan hilang
    ellipse(ctx, 96, 348, 34, 18, "#b98a4e"); ellipse(ctx, 96, 338, 26, 12, "#cfa15e");
    if (present(level, "kucing", side)) drawCat(ctx, 96, 322);
    // keranjang tambahan — hanya kanan
    if (present(level, "keranjang", side)) {
      ellipse(ctx, 138, 362, 22, 12, "#8a5a33"); ellipse(ctx, 138, 354, 18, 8, "#a06a35");
      circle(ctx, 130, 348, 6, "#f2762e"); circle(ctx, 142, 346, 6, "#e14b32"); circle(ctx, 136, 340, 6, "#f2a541");
    }
    // penjual tengah
    ellipse(ctx, 332, 300, 26, 10, "rgba(0,0,0,0.18)");
    rect(ctx, 316, 226, 32, 66, "#3f9e6b"); // baju
    circle(ctx, 332, 198, 16, "#f2c89a");   // kepala
    var hatColor = colorOf(level, "topi", side, "#e14b32", "#2f6fb2");
    ellipse(ctx, 332, 184, 20, 8, hatColor); rect(ctx, 320, 168, 24, 12, hatColor);
    circle(ctx, 324, 198, 2, "#222"); circle(ctx, 340, 198, 2, "#222");
    // gerobak sayur
    rect(ctx, 368, 262, 120, 16, "#a06a35"); rect(ctx, 368, 278, 120, 10, "#7a4a22");
    circle(ctx, 392, 292, 12, "#4a2f1a"); circle(ctx, 464, 292, 12, "#4a2f1a");
    circle(ctx, 384, 256, 9, "#7fc94a"); circle(ctx, 402, 252, 9, "#e14b32"); circle(ctx, 420, 256, 9, "#f2a541");
    circle(ctx, 438, 252, 9, "#7fc94a"); circle(ctx, 456, 256, 9, "#e14b32"); circle(ctx, 472, 254, 9, "#f2762e");
    line(ctx, 368, 262, 352, 236, "#7a4a22", 5); // gagang gerobak
    // ayam — perbedaan geser
    var cp = posOf(level, "ayam", side); drawChicken(ctx, cp.x, cp.y);
    // sepeda — perbedaan hilang
    if (present(level, "sepeda", side)) drawBicycle(ctx, 505, 300);
    // payung kecil tambahan — hanya kanan
    if (present(level, "payung", side)) {
      line(ctx, 498, 172, 498, 196, "#5a2d1a", 3);
      ctx.fillStyle = "#2f6fb2"; ctx.beginPath(); ctx.arc(498, 172, 20, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffd23e"; ctx.beginPath(); ctx.arc(498, 172, 20, Math.PI * 1.25, Math.PI * 1.75); ctx.closePath(); ctx.fill();
    }
    // lampu gantung — perbedaan warna
    line(ctx, 40, 60, 520, 60, "#3a1a3a", 2);
    var lampColor = colorOf(level, "lampu", side, "#ffb347", "#ff7ad9");
    for (var li = 0; li < 4; li++) {
      var lx = 90 + li * 130;
      line(ctx, lx, 60, lx, 74, "#3a1a3a", 2);
      circle(ctx, lx, 82, 9, lampColor); circle(ctx, lx, 82, 14, lampColor.replace(")", ",0.25)").replace("#", "rgba(") === lampColor ? lampColor : lampColor);
    }
    // cahaya lampu senja
    ctx.fillStyle = "rgba(255,179,71,0.12)"; ctx.beginPath(); ctx.arc(282, 82, 34, 0, Math.PI * 2); ctx.fill();
    // asap gerobak (animasi ringan)
    var smokeY = 236 - ((t * 12) % 26);
    circle(ctx, 356, smokeY, 7, "rgba(255,255,255,0.35)"); circle(ctx, 350, smokeY - 10, 5, "rgba(255,255,255,0.25)");
  }

  /* ---------- LEVEL 2: PANTAI PAGI ---------- */
  function drawPantai(ctx, level, side, t) {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 420, [[0, "#7ec8f2"], [0.4, "#bfe6f7"], [0.55, "#ffe9a8"], [1, "#ffe9a8"]]);
    ctx.fillRect(0, 0, W, H);
    circle(ctx, 92, 74, 30, "#fff3c4"); circle(ctx, 92, 74, 22, "#ffedb0");
    ellipse(ctx, 300, 56, 56, 13, "rgba(255,255,255,0.85)"); ellipse(ctx, 470, 96, 48, 12, "rgba(255,255,255,0.7)");
    // camar — perbedaan hilang
    if (present(level, "camar", side)) { drawBird(ctx, 132, 72); drawBird(ctx, 168, 58); }
    drawBird(ctx, 360, 64); drawBird(ctx, 396, 84);
    // layang-layang — perbedaan hilang
    if (present(level, "layang", side)) {
      poly(ctx, [[428, 66], [446, 86], [428, 102], [410, 86]], "#e14b32");
      poly(ctx, [[428, 66], [446, 86], [436, 70]], "#ffd23e");
      line(ctx, 428, 102, 420, 150, "#5a2d1a", 2);
      poly(ctx, [[420, 118], [426, 122], [420, 128]], "#2f6fb2"); poly(ctx, [[419, 134], [425, 138], [419, 144]], "#2f6fb2");
    }
    // laut
    ctx.fillStyle = grad(ctx, 0, 170, 0, 290, [[0, "#2f8fc9"], [1, "#5fb8e6"]]); ctx.fillRect(0, 170, W, 120);
    for (var wi = 0; wi < 5; wi++) {
      var wy = 196 + wi * 22, woff = Math.sin(t * 1.4 + wi * 2) * 8;
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(20 + woff, wy); ctx.quadraticCurveTo(140 + woff, wy - 8, 260 + woff, wy);
      ctx.quadraticCurveTo(400 + woff, wy + 8, 540 + woff, wy); ctx.stroke();
    }
    // perahu — perbedaan geser
    var bp = posOf(level, "perahu", side);
    ctx.fillStyle = "#8a5a33"; ctx.beginPath(); ctx.moveTo(bp.x - 42, bp.y); ctx.lineTo(bp.x + 42, bp.y);
    ctx.lineTo(bp.x + 30, bp.y + 16); ctx.lineTo(bp.x - 30, bp.y + 16); ctx.closePath(); ctx.fill();
    line(ctx, bp.x, bp.y, bp.x, bp.y - 42, "#5a2d1a", 4);
    poly(ctx, [[bp.x + 3, bp.y - 40], [bp.x + 30, bp.y - 4], [bp.x + 3, bp.y - 4]], "#fff3d6");
    poly(ctx, [[bp.x - 3, bp.y - 36], [bp.x - 24, bp.y - 4], [bp.x - 3, bp.y - 4]], "#e14b32");
    // pasir
    ctx.fillStyle = grad(ctx, 0, 290, 0, 420, [[0, "#f2d8a0"], [1, "#e0b96f"]]); ctx.fillRect(0, 290, W, 130);
    ellipse(ctx, 280, 306, 250, 8, "rgba(0,0,0,0.08)");
    // payung pantai — perbedaan warna
    var umColor = colorOf(level, "payung", side, "#e14b32", "#2f9e6b");
    line(ctx, 122, 212, 122, 300, "#7a4a22", 5);
    ctx.fillStyle = umColor; ctx.beginPath(); ctx.arc(122, 212, 46, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff3d6"; ctx.beginPath(); ctx.arc(122, 212, 46, Math.PI * 1.2, Math.PI * 1.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff3d6"; ctx.beginPath(); ctx.arc(122, 212, 46, Math.PI * 1.65, Math.PI * 1.95); ctx.closePath(); ctx.fill();
    // anak bermain layang-layang
    circle(ctx, 470, 300, 12, "#f2c89a"); rect(ctx, 460, 312, 20, 30, "#2f6fb2");
    line(ctx, 462, 342, 456, 366, "#3a2a1a", 4); line(ctx, 478, 342, 484, 366, "#3a2a1a", 4);
    line(ctx, 480, 318, 496, 306, "#f2c89a", 4);
    // jala nelayan — perbedaan hilang
    if (present(level, "jala", side)) {
      ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 2;
      for (var ni = 0; ni < 4; ni++) { ctx.beginPath(); ctx.moveTo(240, 306 + ni * 8); ctx.lineTo(300, 306 + ni * 8); ctx.stroke(); }
      for (var nj = 0; nj < 4; nj++) { ctx.beginPath(); ctx.moveTo(246 + nj * 18, 304); ctx.lineTo(246 + nj * 18, 332); ctx.stroke(); }
      circle(ctx, 270, 318, 4, "#5a2d1a");
    }
    // ember dan sekop tambahan — hanya kanan
    if (present(level, "ember", side)) {
      poly(ctx, [[200, 336], [224, 336], [220, 362], [204, 362]], "#e14b32");
      line(ctx, 212, 336, 212, 326, "#5a2d1a", 3); line(ctx, 212, 326, 228, 318, "#f2a541", 4);
      poly(ctx, [[228, 318], [234, 326], [228, 330]], "#f2a541");
    }
    // bintang laut — perbedaan warna
    drawStarfish(ctx, 92, 356, colorOf(level, "bintang", side, "#f2762e", "#2f6fb2"));
    // kelapa tambahan — hanya kanan
    if (present(level, "kelapa", side)) {
      circle(ctx, 470, 352, 13, "#8a5a33"); circle(ctx, 470, 352, 9, "#6e4525");
      line(ctx, 470, 340, 470, 330, "#3f9e6b", 3); ellipse(ctx, 480, 332, 9, 4, "#3f9e6b");
    }
    // kerang dan rumput laut
    ellipse(ctx, 330, 372, 12, 8, "#ff9ec6"); ellipse(ctx, 150, 388, 12, 8, "#fff3d6");
    line(ctx, 520, 392, 520, 372, "#3f9e6b", 3); line(ctx, 532, 392, 532, 376, "#3f9e6b", 3);
  }

  /* ---------- LEVEL 3: HUTAN KABUT ---------- */
  function drawHutan(ctx, level, side, t) {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 420, [[0, "#cfe8c0"], [0.5, "#a8d8a0"], [1, "#7fb87a"]]);
    ctx.fillRect(0, 0, W, H);
    circle(ctx, 470, 66, 26, "#fff8d0"); circle(ctx, 470, 66, 18, "#fff3a8");
    // pepohonan belakang
    for (var ti = 0; ti < 6; ti++) {
      var tx = 20 + ti * 96;
      poly(ctx, [[tx, 190], [tx + 34, 90], [tx + 68, 190]], "#5a9e5a");
      poly(ctx, [[tx + 8, 150], [tx + 34, 70], [tx + 60, 150]], "#6fb86f");
      rect(ctx, tx + 28, 190, 12, 34, "#7a4a22");
    }
    // tanah + sungai
    ctx.fillStyle = grad(ctx, 0, 280, 0, 420, [[0, "#8ab86a"], [1, "#5a9e5a"]]); ctx.fillRect(0, 280, W, 140);
    ctx.fillStyle = "#7ec8e6"; ctx.beginPath(); ctx.moveTo(210, 300); ctx.quadraticCurveTo(280, 330, 240, 420);
    ctx.lineTo(330, 420); ctx.quadraticCurveTo(350, 340, 300, 300); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(250, 330); ctx.quadraticCurveTo(275, 350, 260, 380); ctx.stroke();
    // pondok kayu kiri
    rect(ctx, 70, 200, 110, 80, "#a06a35"); poly(ctx, [[60, 200], [125, 158], [190, 200]], "#7a3b1a");
    rect(ctx, 112, 232, 26, 48, "#5a2d1a");
    var winColor = colorOf(level, "jendela", side, "#ffd23e", "#3a4a5a");
    rect(ctx, 82, 214, 22, 22, winColor); rect(ctx, 148, 214, 22, 22, winColor);
    line(ctx, 93, 214, 93, 236, "#5a2d1a", 2); line(ctx, 82, 225, 104, 225, "#5a2d1a", 2);
    // jembatan bambu di atas sungai
    for (var bi = 0; bi < 6; bi++) {
      var bx = 226 + bi * 18;
      if (bi === 3 && !present(level, "papan", side)) continue; // papan hilang di kanan
      rect(ctx, bx, 318, 16, 10, "#c9a35e");
    }
    line(ctx, 220, 312, 340, 312, "#8a5a33", 3);
    // monyet di dahan — perbedaan hilang
    line(ctx, 400, 160, 500, 140, "#5a2d1a", 6);
    if (present(level, "monyet", side)) drawMonkey(ctx, 448, 138);
    // jamur besar — perbedaan warna
    drawMushroom(ctx, 96, 318, colorOf(level, "jamur", side, "#e14b32", "#2f6fb2"));
    drawMushroom(ctx, 128, 330, "#f2a541");
    // bunga liar — perbedaan warna
    var flColor = colorOf(level, "bunga", side, "#ff7ad9", "#ffd23e");
    for (var fi = 0; fi < 5; fi++) {
      var fx2 = 382 + fi * 12, fy2 = 352 + (fi % 2) * 8;
      line(ctx, fx2, fy2, fx2, fy2 + 12, "#3f9e6b", 2);
      circle(ctx, fx2, fy2, 5, flColor); circle(ctx, fx2, fy2, 2, "#fff");
    }
    // batu di sungai — perbedaan geser
    var sp = posOf(level, "batu", side);
    ellipse(ctx, sp.x, sp.y, 16, 10, "#9a9a9a"); ellipse(ctx, sp.x, sp.y - 3, 10, 6, "#b5b5b5");
    // burung di pohon — hanya kanan
    if (present(level, "burung", side)) {
      circle(ctx, 88, 108, 8, "#2f6fb2"); poly(ctx, [[80, 104], [72, 100], [80, 100]], "#f2a541");
      line(ctx, 82, 116, 76, 122, "#2f6fb2", 3); line(ctx, 94, 116, 100, 122, "#2f6fb2", 3);
    }
    // buah di pohon — hanya kanan
    if (present(level, "buahpohon", side)) {
      circle(ctx, 498, 208, 7, "#e14b32"); circle(ctx, 512, 220, 7, "#e14b32"); circle(ctx, 486, 222, 7, "#f2762e");
    }
    // kunang-kunang tambahan — hanya kanan (plus kunang-kunang biasa di kedua panel)
    var ff, fx3, fy3;
    for (ff = 0; ff < 4; ff++) {
      fx3 = 200 + ff * 60 + Math.sin(t + ff) * 6; fy3 = 130 + (ff % 2) * 40 + Math.cos(t * 0.8 + ff) * 5;
      circle(ctx, fx3, fy3, 3.5, "rgba(255,240,120,0.95)");
      ctx.fillStyle = "rgba(255,240,120,0.18)"; ctx.beginPath(); ctx.arc(fx3, fy3, 10, 0, Math.PI * 2); ctx.fill();
    }
    if (present(level, "kunang", side)) {
      circle(ctx, 168, 152, 4, "rgba(255,240,120,0.95)");
      ctx.fillStyle = "rgba(255,240,120,0.2)"; ctx.beginPath(); ctx.arc(168, 152, 12, 0, Math.PI * 2); ctx.fill();
      circle(ctx, 188, 168, 3.5, "rgba(255,240,120,0.95)");
    }
    // kabut pagi
    ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(0, 250, W, 34);
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(0, 120, W, 26);
    // rumput dan daun
    for (var gi = 0; gi < 8; gi++) {
      var gx = 30 + gi * 66;
      line(ctx, gx, 396, gx + 4, 380, "#3f9e6b", 3); line(ctx, gx + 10, 398, gx + 14, 382, "#4aab5e", 3);
    }
  }

  function drawScene(ctx, level, side, t) {
    ctx.save(); ctx.clearRect(0, 0, W, H);
    if (level.id === 1) drawPasar(ctx, level, side, t || 0);
    else if (level.id === 2) drawPantai(ctx, level, side, t || 0);
    else drawHutan(ctx, level, side, t || 0);
    ctx.restore();
  }

  /* Skala adegan ke kanvas berukuran apa pun (menu, kartu level, contoh). */
  function drawSceneScaled(ctx, w, h, level, side, t) {
    ctx.save(); ctx.scale(w / W, h / H); drawScene(ctx, level, side, t || 0); ctx.restore();
  }

  function ringAt(ctx, x, y, r, color) {
    ctx.strokeStyle = color || "#ffd23e"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#3a1a00"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r + 9, 0, Math.PI * 2); ctx.stroke();
  }
  function drawFoundRing(ctx, level, diff, side) {
    var p = posOf(level, diff.id, side);
    ringAt(ctx, p.x, p.y, diff.r, "#ffd23e");
  }
  function drawMissMark(ctx, x, y, alpha) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.strokeStyle = "#ff4b32"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12); ctx.stroke(); ctx.restore();
  }
  function drawFocusRing(ctx, level, diff, side) {
    var p = posOf(level, diff.id, side);
    ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, diff.r + 12, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  function drawHintPulse(ctx, level, diff, side, t) {
    var p = posOf(level, diff.id, side);
    var pulse = 10 + Math.sin(t * 6) * 5;
    ctx.save(); ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(255,210,62,0.35)"; ctx.beginPath(); ctx.arc(p.x, p.y, diff.r + pulse, 0, Math.PI * 2); ctx.fill();
    ringAt(ctx, p.x, p.y, diff.r + pulse - 6, "#ffd23e"); ctx.restore();
  }

  window.SelisihRenderer = {
    drawScene: drawScene, drawSceneScaled: drawSceneScaled,
    drawFoundRing: drawFoundRing, drawMissMark: drawMissMark,
    drawFocusRing: drawFocusRing, drawHintPulse: drawHintPulse,
    posOf: posOf, W: W, H: H
  };
})();
