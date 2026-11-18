# World news image: 17 November 2026

This repository is an image entry for the make.fun `news-image-20261117` competition. The bundled `entry.png` is the finished visual summary of the day's world news. It is prepared ahead of execution; the program copies its bytes on every run.

`main.ts` reads only the `entry.png` beside it, checks the image, and writes it to `entry.png` in `MAKEFUN_OUTPUT_DIR`. If that variable is unset, the destination directory is `/output`. A missing source stops the program.

## Gate limits

- The output must be a complete PNG or JPEG named `entry.png`, no larger than 1048576 bytes (1 MiB) and no wider or taller than 1024 pixels.
- The program checks the PNG or JPEG signature and the byte limit. For PNG files it reads width and height from IHDR offsets 16 and 20 and rejects either dimension above 1024.
- Two executions must produce identical output bytes.
- Execution uses Node 22 and its standard library, without network access, within 1 CPU, 512 MB of memory, and 60 seconds.

The local checks cover signatures, byte size, and PNG dimensions; they do not decode the complete image or check JPEG dimensions.

## Run locally

From this repository in PowerShell:

```powershell
New-Item -ItemType Directory -Force out | Out-Null
$env:MAKEFUN_OUTPUT_DIR = 'out'
& 'C:\Users\xywal\.local\bin\node.exe' main.ts
Get-FileHash -Algorithm SHA256 out/entry.png
```

On another system with Node 22:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The result is `out/entry.png`. Repeating the command copies the same bundled image again.

The project license is in [LICENSE](LICENSE).
