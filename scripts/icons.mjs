import sharp from "sharp";
import { writeFileSync } from "node:fs";

/** The app mark: a speech bubble with the word redacted out of it. */
const mark = `
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#4c2ee0"/></linearGradient></defs>
<rect width="100" height="100" rx="26" fill="url(#g)"/>
<path d="M24 34c0-5 4-9 9-9h34c5 0 9 4 9 9v22c0 5-4 9-9 9H49L33 78V65c-5 0-9-4-9-9V34Z" fill="#fff"/>
<rect x="33" y="35.5" width="34" height="8.5" rx="4.25" fill="#15121f"/>
<rect x="33" y="49" width="21" height="8.5" rx="4.25" fill="#15121f"/>
<rect x="58" y="49" width="9" height="8.5" rx="4.25" fill="#c9f542"/>`;

const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${100 + 2 * pad} ${100 + 2 * pad}">
<rect x="${-pad}" y="${-pad}" width="${100 + 2 * pad}" height="${100 + 2 * pad}" fill="#5b3df5"/>${mark}</svg>`;

writeFileSync("icon-source.svg", svg(0));
for (const [file, size, pad] of [
  ["public/icons/icon-192.png", 192, 0],
  ["public/icons/icon-512.png", 512, 0],
  ["src/app/icon.png", 192, 0],
  ["src/app/apple-icon.png", 180, 6],
]) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
}
const png = await sharp(Buffer.from(svg(0))).resize(64, 64).png().toBuffer();
const { default: pngToIco } = await import("png-to-ico");
writeFileSync("src/app/favicon.ico", await pngToIco(png));
console.log("icons ok");
