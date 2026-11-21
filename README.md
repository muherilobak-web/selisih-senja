# Selisih Senja

[![Selisih Senja](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/competition/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/muherilobak-web/selisih-senja/rank.svg)](https://make.fun/competition/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/muherilobak-web/selisih-senja/reward.svg)](https://make.fun/competition/best-spot-the-difference-game-20261121-0451)

**Selisih Senja** adalah game cari perbedaan (spot-the-difference) orisinal berbahasa Indonesia. Dua gambar yang nyaris sama ditampilkan berdampingan — temukan semua perbedaannya sebelum waktu habis!

## Tiga Level

1. **Pasar Senja** — kios buah, gerobak sayur, lampu gantung, dan kucing di atas karung. 8 perbedaan, 120 detik.
2. **Pantai Pagi** — perahu nelayan, layang-layang, payung pantai, dan jala. 8 perbedaan, 120 detik.
3. **Hutan Kabut** — pondok kayu, jembatan bambu, monyet di dahan, dan kunang-kunang. 9 perbedaan, 150 detik.

## Cara Main

- **Klik perbedaan** di panel kiri atau kanan. Yang ketemu dilingkari kuning cerah di kedua panel.
- Penghitung di atas layar menunjukkan sisa perbedaan. Temukan semuanya sebelum waktu habis.
- **Petunjuk (tombol 💡 atau H):** menyorot satu perbedaan yang belum ketemu selama 3 detik, biaya 50 poin. Tersedia 3 kali per level.
- **Klik salah:** muncul tanda silang dan waktu berkurang 5 detik.
- **Skor:** tiap perbedaan 100 poin, ditambah bonus waktu sisa × 5, ditambah bonus tanpa kesalahan 200 poin.
- Selesaikan level dengan cepat dan tanpa kesalahan untuk meraih 3 bintang.

## Keyboard

- **Tombol panah:** memindahkan sorot antar perbedaan
- **Enter:** memilih perbedaan di bawah sorot
- **H:** petunjuk
- **P:** jeda
- **M:** bisu / nyalakan suara

Semua fungsi bisa dilakukan penuh hanya dengan mouse, dan penuh hanya dengan keyboard.

## Menjalankan

Buka `game/index.html` di desktop Chrome — tidak perlu server dan tidak perlu internet. Semua gambar digambar oleh kode (kanvas prosedural) dan semua suara dibuat oleh kode (WebAudio). Tidak ada aset luar, tidak ada pustaka luar, tidak ada permintaan jaringan.

## Struktur

- `game/index.html` — halaman utama game
- `game/style.css` — gaya antarmuka
- `game/js/levels.js` — data level dan daftar perbedaan
- `game/js/scene-renderer.js` — mesin gambar prosedural (kanvas)
- `game/js/game-logic.js` — logika permainan: klik, skor, waktu, petunjuk
- `game/js/audio.js` — suara WebAudio prosedural
- `game/js/screens.js` — layar menu, jeda, menang, kalah
- `game/js/app.js` — bootstrap dan mode demo untuk tangkapan layar
- `main.ts` — program penyerah (Node 22, pustaka standar saja)
- `screenshots/` — 4 tangkapan layar dari game yang berjalan

## Lisensi

MIT — lihat `LICENSE`.
