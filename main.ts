// Copy the bundled news image after checking its format and size limits.
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Resolve against this module, so the input never depends on the working directory.
// Reading it also makes a missing source fail before any output is created.
const image = new URL('./entry.png', import.meta.url);
const data = readFileSync(image);
const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const jpegHeader = Buffer.from([255, 216, 255]);
const png = data.subarray(0, pngHeader.length).equals(pngHeader);
const jpeg = data.subarray(0, jpegHeader.length).equals(jpegHeader);

if (!png && !jpeg) throw new Error('The bundled entry.png must contain PNG or JPEG bytes');
if (data.length > 1048576) throw new Error('The bundled image exceeds 1048576 bytes');
if (png) {
  // IHDR stores width and height as big-endian integers at these offsets.
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > 1024 || height > 1024) throw new Error('PNG dimensions exceed 1024 pixels');
}

const directory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destination = join(directory, 'entry.png');
if (!destination.endsWith('entry.png')) throw new Error('The output path must end in entry.png');
mkdirSync(directory, { recursive: true });
copyFileSync(image, destination);
const output = statSync(destination);
if (!output.isFile() || output.size !== data.length) {
  throw new Error('The output must be a file with the same byte length as the input');
}
