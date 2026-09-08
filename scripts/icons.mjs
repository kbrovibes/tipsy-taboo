import sharp from "sharp";
import { writeFileSync } from "node:fs";
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${100+2*pad} ${100+2*pad}">
<rect x="${-pad}" y="${-pad}" width="${100+2*pad}" height="${100+2*pad}" fill="#d2f56f"/>
<rect width="100" height="100" rx="24" fill="#d2f56f"/>
<path d="M22 30c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v20c0 6.6-5.4 12-12 12H45l-13 11v-11h0c-5.5-.5-10-5.7-10-12V30Z" fill="#fff" stroke="#2a1b2e" stroke-width="4.5" stroke-linejoin="round"/>
<circle cx="38" cy="40" r="4.4" fill="#2a1b2e"/><circle cx="50" cy="40" r="4.4" fill="#2a1b2e"/><circle cx="62" cy="40" r="4.4" fill="#2a1b2e"/>
<circle cx="70" cy="68" r="15" fill="#b8235a" stroke="#fff" stroke-width="4"/>
<path d="M61.5 59.5 78.5 76.5" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
</svg>`;
writeFileSync("icon-source.svg", svg(0));
for (const [file, size, pad] of [["public/icons/icon-192.png",192,10],["public/icons/icon-512.png",512,10],["src/app/icon.png",192,0],["src/app/apple-icon.png",180,8]]) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
}
const png = await sharp(Buffer.from(svg(0))).resize(64,64).png().toBuffer();
const { default: pngToIco } = await import("png-to-ico");
writeFileSync("src/app/favicon.ico", await pngToIco(png));
console.log("icons ok");
