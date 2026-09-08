import sharp from "sharp";

const F = "Outfit, Geist, Arial, Helvetica, sans-serif";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#4c2ee0"/></linearGradient>
  <radialGradient id="glowA" cx="50%" cy="0%" r="70%"><stop offset="0" stop-color="#5b3df5" stop-opacity=".16"/><stop offset="1" stop-color="#5b3df5" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB" cx="100%" cy="100%" r="55%"><stop offset="0" stop-color="#c9f542" stop-opacity=".3"/><stop offset="1" stop-color="#c9f542" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1200" height="630" fill="#f7f6fb"/>
<rect width="1200" height="630" fill="url(#glowA)"/><rect width="1200" height="630" fill="url(#glowB)"/>

<g transform="translate(80,96) scale(1.24)">
  <rect width="100" height="100" rx="26" fill="url(#mark)"/>
  <path d="M24 34c0-5 4-9 9-9h34c5 0 9 4 9 9v22c0 5-4 9-9 9H49L33 78V65c-5 0-9-4-9-9V34Z" fill="#fff"/>
  <rect x="33" y="35.5" width="34" height="8.5" rx="4.25" fill="#15121f"/>
  <rect x="33" y="49" width="21" height="8.5" rx="4.25" fill="#15121f"/>
  <rect x="58" y="49" width="9" height="8.5" rx="4.25" fill="#c9f542"/>
</g>

<text x="80" y="330" font-family="${F}" font-weight="800" font-size="92" fill="#15121f" letter-spacing="-3">TIPSY <tspan fill="#5b3df5">TABO</tspan></text>
<g transform="translate(614,264)"><circle cx="35" cy="35" r="28" fill="none" stroke="#5b3df5" stroke-width="10"/><path d="M15 15 55 55" stroke="#5b3df5" stroke-width="10" stroke-linecap="round"/></g>
<text x="80" y="396" font-family="${F}" font-weight="600" font-size="38" fill="rgba(21,18,31,.72)">Say anything. Except that.</text>

<g transform="translate(80,442)">
  <rect width="290" height="64" rx="20" fill="#dcfce7"/>
  <path d="M36 32 46 42 66 22" stroke="#15803d" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="86" y="41" font-family="${F}" font-weight="700" font-size="22" fill="#15121f">Swipe right · got it</text>
</g>
<g transform="translate(390,442)">
  <rect width="290" height="64" rx="20" fill="#ffe4e8"/>
  <path d="M68 32H30M44 20 30 32l14 12" stroke="#e11d48" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="86" y="41" font-family="${F}" font-weight="700" font-size="22" fill="#15121f">Swipe left · pass</text>
</g>
<text x="80" y="556" font-family="${F}" font-weight="600" font-size="24" fill="rgba(21,18,31,.62)">One phone · 2–4 teams · 6,280 cards · works offline</text>

<g transform="translate(766,86)">
  <rect x="0" y="0" width="354" height="458" rx="30" fill="#fff" stroke="rgba(21,18,31,.07)"/>
  <path d="M0 30a30 30 0 0 1 30-30h294a30 30 0 0 1 30 30v96H0V30Z" fill="#e9e4ff"/>
  <text x="177" y="46" text-anchor="middle" font-family="${F}" font-weight="700" font-size="13" letter-spacing="3" fill="#3d25c9">GET THEM TO SAY</text>
  <text x="177" y="100" text-anchor="middle" font-family="${F}" font-weight="800" font-size="46" fill="#15121f">Hangover</text>
  <text x="177" y="172" text-anchor="middle" font-family="${F}" font-weight="700" font-size="12" letter-spacing="3" fill="#e11d48">WITHOUT SAYING</text>
  ${["Headache", "Drunk", "Morning", "Alcohol", "Regret"]
    .map(
      (w, i) =>
        `<rect x="28" y="${192 + i * 50}" width="298" height="40" rx="14" fill="#ffe4e8"/>` +
        `<text x="177" y="${219 + i * 50}" text-anchor="middle" font-family="${F}" font-weight="700" font-size="22" fill="#15121f">${w}</text>`
    )
    .join("")}
</g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("docs/media/og.png");
console.log("og ok");
