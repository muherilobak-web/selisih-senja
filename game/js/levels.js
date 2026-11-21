/* Selisih Senja — data level: nama, waktu, dan daftar perbedaan.
   Tiap perbedaan: id, nama yang ramah, posisi x/y di kanvas 560x420,
   radius klik, jenis (tambah / hilang / warna / geser), dan untuk
   jenis geser: posisi kedua di panel kanan (dx, dy).
   Jenis tambah = hanya ada di panel kanan. Jenis hilang = hanya ada
   di panel kiri. Jenis warna = objek sama, warna berbeda. Jenis
   geser = objek sama berpindah posisi di panel kanan. */
window.SELISIH_LEVELS = [
  {
    id: 1,
    name: "Pasar Senja",
    subtitle: "Kios buah, gerobak sayur, dan kucing di atas karung",
    timeLimit: 120,
    sky: "senja",
    diffs: [
      { id: "kucing",  name: "Kucing di atas karung", x: 96,  y: 322, r: 30, kind: "hilang" },
      { id: "lampu",   name: "Warna lampu gantung",  x: 282, y: 78,  r: 26, kind: "warna" },
      { id: "buah",    name: "Warna tumpukan buah",   x: 185, y: 262, r: 30, kind: "warna" },
      { id: "ayam",    name: "Ayam pindah tempat",    x: 438, y: 318, r: 28, kind: "geser", dx: 52, dy: 14 },
      { id: "sepeda",  name: "Sepeda tua bersandar",  x: 505, y: 300, r: 30, kind: "hilang" },
      { id: "topi",    name: "Warna topi penjual",    x: 332, y: 176, r: 24, kind: "warna" },
      { id: "payung",  name: "Payung kecil tambahan", x: 498, y: 172, r: 26, kind: "tambah" },
      { id: "keranjang", name: "Keranjang buah tambahan", x: 138, y: 356, r: 28, kind: "tambah" }
    ]
  },
  {
    id: 2,
    name: "Pantai Pagi",
    subtitle: "Perahu nelayan, layang-layang, dan payung pantai",
    timeLimit: 120,
    sky: "pagi",
    diffs: [
      { id: "layang",  name: "Layang-layang di langit", x: 428, y: 82,  r: 30, kind: "hilang" },
      { id: "payung",  name: "Warna payung pantai",     x: 122, y: 212, r: 30, kind: "warna" },
      { id: "perahu",  name: "Perahu pindah tempat",    x: 330, y: 268, r: 32, kind: "geser", dx: -58, dy: 10 },
      { id: "ember",   name: "Ember dan sekop tambahan", x: 212, y: 348, r: 26, kind: "tambah" },
      { id: "camar",   name: "Burung camar di langit",  x: 132, y: 72,  r: 26, kind: "hilang" },
      { id: "kelapa",  name: "Kelapa di pasir",         x: 470, y: 352, r: 26, kind: "tambah" },
      { id: "jala",    name: "Jala nelayan",            x: 268, y: 318, r: 28, kind: "hilang" },
      { id: "bintang", name: "Bintang laut di pasir",   x: 92,  y: 356, r: 26, kind: "warna" }
    ]
  },
  {
    id: 3,
    name: "Hutan Kabut",
    subtitle: "Pondok kayu, jembatan bambu, dan kunang-kunang",
    timeLimit: 150,
    sky: "hutan",
    diffs: [
      { id: "monyet",  name: "Monyet di dahan",        x: 448, y: 138, r: 30, kind: "hilang" },
      { id: "kunang",  name: "Kunang-kunang tambahan", x: 168, y: 152, r: 26, kind: "tambah" },
      { id: "jamur",   name: "Warna jamur besar",      x: 96,  y: 318, r: 28, kind: "warna" },
      { id: "papan",   name: "Papan jembatan hilang",  x: 300, y: 330, r: 28, kind: "hilang" },
      { id: "bunga",   name: "Warna bunga liar",       x: 398, y: 352, r: 26, kind: "warna" },
      { id: "jendela", name: "Cahaya jendela pondok",  x: 122, y: 196, r: 24, kind: "warna" },
      { id: "batu",    name: "Batu di sungai pindah",  x: 252, y: 356, r: 26, kind: "geser", dx: 48, dy: -8 },
      { id: "burung",  name: "Burung di pohon",        x: 88,  y: 108, r: 26, kind: "tambah" },
      { id: "buahpohon", name: "Buah di pohon",        x: 498, y: 208, r: 26, kind: "tambah" }
    ]
  }
];
window.SELISIH_SCENE_W = 560;
window.SELISIH_SCENE_H = 420;
