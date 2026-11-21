// Selisih Senja — program penyerah untuk make.fun.
//
// Tugas program ini sederhana dan hanya memakai pustaka standar Node:
//   1. Cari direktori tempat berkas ini berada (itulah akar repo entri).
//   2. Buat direktori output, diambil dari MAKEFUN_OUTPUT_DIR
//      atau /output bila variabel itu tidak diset.
//   3. Salin seluruh isi folder game/ dan screenshots/ dari samping
//      berkas ini ke dalam direktori output.
//   4. Minta library vendored ./vendor/makefun-game.ts menyusun
//      dossier.json di dalam direktori output, dengan batas-batas
//      yang ditetapkan kompetisi.
//
// Program ini saya tulis segar dari deskripsi tugasnya; ia tidak
// menyalin starter mana pun dan tidak memakai pustaka luar.
import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

await mkdir(outputDir, { recursive: true });
await cp(join(rootDir, "game"), join(outputDir, "game"), { recursive: true });
await cp(join(rootDir, "screenshots"), join(outputDir, "screenshots"), { recursive: true });

const dossier = await buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots_max_files: 4,
  screenshot_max_bytes: 262144,
  game_max_files: 993,
  game_max_bytes: 50331648,
  path_max_bytes: 1000,
});
await writeFile(join(outputDir, "dossier.json"), dossier);

console.log("Dossier ditulis ke " + join(outputDir, "dossier.json"));
