# GATE.md — news-image-20261117

Catatan gate untuk entri ini, semua diukur di mesin ini (Windows, Node v24.19.0, git 2.53.0.windows.3), 18 Nov 2026.
Kit: `D:\dipsik\makefun\forge\news-image-20261117\news-image-20261117-kit`.

## 1. Tiga lapis yang memutuskan entri

| lapis | dijalankan | memutuskan |
|---|---|---|
| intake + transcripts gate | lokal, `makefun check` | `Valid` tidak, tapi entri ditolak bila gagal |
| run gate (`run_completes`, `run_deterministic`) | server | `Valid` = 1/0 |
| image gate (PNG/JPEG utuh, ≤1 MiB, ≤1024×1024) | server | `Valid` = 1/0 |
| juri | server | peringkat (win rate) |

`check` hanya menjalankan lapis pertama. Dua lapis tengah tidak bisa dijalankan lokal — lihat §4.

## 2. Perintah persis dan hasilnya sekarang

```
cd D:\dipsik\makefun\forge\news-image-20261117\news-image-20261117-kit
node cli/makefun.mjs check --kit . --repo D:\dipsik\makefun\entries\news-image-20261117 --worktree
```

Hasil di worktree (18 Nov 2026 ±07:00 WIB): `competition_open`, `snapshot`, `license_osi`, `entrypoint` pass; `transcripts_present` FAIL karena belum ada bundle; 13 cek lain skip karena itu; 5 baris "at submission".
Ringkasan dari CLI: `4 passed, 1 failed, 13 skipped, 5 checked at submission`, exit 1.

`transcripts_present` hanya bisa hijau setelah sesi builder selesai dan bundle dibuat:

```
node cli/makefun.mjs bundle --repo <repo> --system-prompt <file> --effort <effort> --out transcripts.tar.gz --redact "<detail>"
node cli/makefun.mjs check --kit . --repo <repo> --transcripts transcripts.tar.gz
```

## 3. Baris `check` yang harus pass

| baris | arti | sekarang |
|---|---|---|
| `competition_open` | waktu pemeriksaan di antara opening `2026-11-17T23:43:00Z` dan deadline `2026-11-19T00:00:00Z` | pass |
| `snapshot` | 7 berkas, 15.102 B; batas intake 100 MiB/berkas, 512 MiB/repo | pass |
| `license_osi` | `LICENSE` memuat baris `SPDX-License-Identifier: MIT` — teks MIT saja **gagal** | pass (baris ditambahkan) |
| `entrypoint` | `main.ts` di root memilih runtime `node22` | pass |
| `transcripts_present` | ada sesi yang bisa di-parse dari bundle | FAIL sampai bundle ada |
| `thinking_*`, `transcripts_run_record` | 12 cek transkrip; lihat §3a | skip sampai bundle ada |
| `repo_public`, `repo_owner`, `repo_created_after_open`, `commit_in_repo`, `duplicate_snapshot` | hanya bisa dicek situs saat submit | dicetak sebagai "at submission" |

Tiga baris "at submission" yang paling mudah menjatuhkan: repo harus publik dan dibuat **setelah** `2026-11-17T23:43:00Z`; `.makefun/owner.json` sudah ada di repo ini (wallet `3fDEba…yYy`), jadi `repo_owner` aman meski owner GitHub bukan login make.fun; snapshot tidak boleh identik dengan entri akun lain (starter yang tidak diubah akan kena).

### 3a. Transcript gate: 12 baris, non-strict tapi run record wajib

Tidak ada `strict_transcripts` di `competition.yaml` (bundle upload), tetapi `transcripts_required: true` dan `transcripts_run_record` aktif untuk entri masuk ≥ `2026-11-17T00:00Z`. Baris yang terlihat di `check`: `transcripts_present`, `transcripts_recorded`, `thinking_wellformed`, `thinking_in_window`, `thinking_committed`, `thinking_reproduces` (min_authored 0,3; max_unwritten_share 0,4; entrypoint ≥1 baris authored), `thinking_on_task` (sesi harus menyebut istilah tugas; daftar istilahnya baru dicetak saat ada bundle), `thinking_turns` (≥5 turn), `thinking_priced`, `thinking_revised` (≥2 write), `thinking_fresh`, `transcripts_run_record`.

Konsekuensi untuk entri ini: `main.ts` yang ada sekarang ditulis di luar sesi builder, jadi seluruh barisnya `absent`. Entri tetap butuh **satu baris `main.ts` yang ditulis di sesi terekam**; kalau tidak, `thinking_reproduces` gagal pada entrypoint.

## 4. Yang tidak bisa dijalankan lokal

```
node cli/makefun.mjs grade-local --kit . --bot <repo> --worktree --driver process
→ makefun grade-local: news-image-20261117 is a program/v1 competition: its scorer and
  reference data are not published in the kit, so the house grades it from its
  competition directory (--kit competitions/news-image-20261117)
```

Jadi: satu-satunya verifikasi lokal adalah `check`. `run_completes`, `run_deterministic`, gate gambar dan juri hanya berjalan di server.

`run_completes` (dari tabel cek CLI): "The entry must build and run to completion in the grader's sandbox within the harness's limits."
`run_deterministic`: "Two runs of the entry on the same data must produce the same action log." — untuk `program/v1` artinya dua run menulis byte yang sama; fix resminya: hapus jam dinding, randomness tanpa seed, panggilan jaringan, iterasi tak berurut.

## 5. Catatan Windows

**5a. `check --worktree` + EPERM.** Bila working tree memuat **dua berkas dengan byte identik**, misalnya `entry.png` dan salinan hasil build di `out1/entry.png`, `check --worktree` gagal:

```
makefun check: EPERM: operation not permitted, rename
  'C:\Users\...\Temp\makefun-check-XXXX\blobs\tmp\<id>.part'
  -> 'C:\Users\...\Temp\makefun-check-XXXX\blobs\<xx>\<sha256>'
```

Sebabnya blob store: dua berkas berisi sama di-stage bersamaan, lalu rename kedua menabrak blob read-only yang sudah ada. Diuji ulang: dengan `out1/` + `out2/` berisi `entry.png` → EPERM; dengan `out/` (di-.gitignore) → pass, 6 entri. **Aturan: hasil build hanya di direktori yang di-.gitignore (`out/`), jangan pernah di `out1/`, `dist/`, `build/` yang tidak di-ignore.**

**5b. `check` mode commit gagal karena URL `file:///D:/`.** Tanpa flag, `check` membaca commit lewat `git fetch file:///D:/...`, dan git-for-windows 2.53.0 menolaknya:

```
fatal: '/C:/Users/.../makefun-check-XXXX/repo' does not appear to be a git repository
```

Diuji terpisah: `git fetch file:///D:/path` → gagal (`'/D:/path' does not appear to be a git repository`), sedangkan `git fetch file://D:/path` dan `git fetch D:/path` → berhasil. Workaround yang terbukti (env git, bukan ubah config global):

```powershell
$env:GIT_CONFIG_COUNT='1'
$env:GIT_CONFIG_KEY_0='url.file://D:/.insteadOf'
$env:GIT_CONFIG_VALUE_0='file:///D:/'
node cli/makefun.mjs check --kit . --repo <repo>     # mode commit: lolos, membaca HEAD
```

Dengan env itu `check` mode commit berjalan normal (membaca `d157ffc…`, 6 entri). Tanpa itu, pakai `--worktree`.

**5c. CRLF.** `core.autocrlf` aktif di mesin ini, jadi setiap commit mencetak `LF will be replaced by CRLF`. Blob yang tersimpan tetap LF, dan pembacaan commit memakai blob, jadi gate tidak terpengaruh — tetapi jangan pernah membandingkan byte berkas teks antara worktree dan `git show`.

**5d. Path.** Semua perintah di atas menerima path Windows absolut; `--repo` boleh di luar kit.

## 6. Gambar: apa yang wajib, dan apakah butuh library

Kontrak (RULES.txt "The task"): satu berkas `/output/entry.png`, PNG **atau** JPEG yang dikenali dari byte pertamanya, ≤ 1 MiB (1.048.576 B), ≤ 1024×1024 piksel, gambar utuh.

- **SVG/HTML tidak diterima.** Gate membaca PNG/JPEG dari magic bytes; SVG bernama `entry.png` akan ditolak. Tidak ada jalur "render di browser".
- **Tidak butuh library pihak ketiga.** PNG bisa ditulis murni dengan `node:zlib` + CRC32: dibuktikan oleh `tools/make-placeholder.mjs`, 512×512, hasil 1.496 B, dan dua kali jalan menghasilkan sha256 identik (`02ee625f…5ac1`). Tidak ada `npm install` di grade — "nothing is installed before it runs" — jadi `sharp`/`canvas` (native binding) tidak mungkin dipakai di sana.
- **Rekomendasi:** ImageGen merender PNG final saat sesi build, berkasnya di-commit, dan `main.ts` hanya memvalidasi + menyalin. Determinisme jadi gratis (copy byte-identik). Kalau program harus menggambar sendiri, raster `Uint8Array` → PNG via `zlib.deflateSync(level: 9)` deterministik; teks di dalam gambar butuh rasterizer font, dan itu satu-satunya bagian yang mahal tanpa library.
- **JPEG** diterima gate, tetapi menulis JPEG murni butuh DCT manual — tidak sepadan; pakai PNG.

`main.ts` sekarang memeriksa empat hal sebelum menulis: magic bytes PNG/JPEG, ukuran ≤ 1 MiB, IHDR ≤ 1024×1024, lalu menyalin.

## 7. Checklist sebelum submit

1. `entry.png` final: PNG/JPEG utuh, ≤1 MiB, ≤1024×1024, dan **bukan** berkas kit (snapshot identik = ditolak).
2. `node main.ts` dua kali ke direktori berbeda → sha256 sama.
3. `main.ts` punya ≥1 baris yang ditulis di sesi builder.
4. `check --worktree` hijau kecuali baris "at submission"; lalu `bundle` + `check --transcripts`.
5. Repo GitHub dibuat setelah `2026-11-17T23:43:00Z`, publik, LICENSE ber-SPDX, `.makefun/owner.json` ikut ter-commit.
6. Submit dengan `--bundle transcripts.tar.gz --keypair wallet.json`; batas 10 submit/UTC-hari, 20 total; entri final = submit terakhir sebelum `2026-11-19T00:00Z`.
