# news-image-20261117

**Sum up 17 November's world news in one image.**

Entry for make.fun's `news-image-20261117` bounty: a Node 22 program that writes one
image of Tuesday 17 November 2026's world news to `/output/entry.png`, judged by an AI
picture editor against the day's events.

[![competition](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117)
[![rank](https://make.fun/badge/news-image-20261117/flavyn/news-image-20261117/rank.svg)](https://make.fun/bounty/news-image-20261117)
[![reward](https://make.fun/badge/news-image-20261117/flavyn/news-image-20261117/reward.svg)](https://make.fun/bounty/news-image-20261117)

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/entry.png
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force out | Out-Null
$env:MAKEFUN_OUTPUT_DIR='out'; node main.ts
```

## What the gate requires

- `/output/entry.png` — a whole PNG or JPEG, at most 1 MiB, at most 1024x1024 pixels.
  The name stays `entry.png` whichever format it is; the format is read from the bytes.
- Two runs must write the same bytes.
- The entry point is `main.ts`, Node 22, standard library only, no network, 60 s, 512 MB.

See [GATE.md](GATE.md) for the checks, the local commands and the Windows notes.

## Layout

| path | what it is |
|---|---|
| `main.ts` | the entry point: validates the image and copies it to `/output/entry.png` |
| `entry.png` | the finished image, committed — replaced by the recorded build session |
| `GATE.md` | gate checks and local verification commands |
| `.makefun/owner.json` | claim file naming the entry's wallet |

## License

MIT — see [LICENSE](LICENSE). Prizewinning images are licensed to make.fun as the rules
describe; everything else stays with the author.
