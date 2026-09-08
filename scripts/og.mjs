import sharp from "sharp";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(42,27,46,0.06)"/></pattern></defs>
<rect width="1200" height="630" fill="#f7f2ea"/><rect width="1200" height="630" fill="url(#d)"/>
<g transform="translate(80,110) scale(1.5)">
<rect width="100" height="100" rx="24" fill="#d2f56f"/>
<path d="M22 30c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v20c0 6.6-5.4 12-12 12H45l-13 11v-11h0c-5.5-.5-10-5.7-10-12V30Z" fill="#fff" stroke="#2a1b2e" stroke-width="4.5" stroke-linejoin="round"/>
<circle cx="38" cy="40" r="4.4" fill="#2a1b2e"/><circle cx="50" cy="40" r="4.4" fill="#2a1b2e"/><circle cx="62" cy="40" r="4.4" fill="#2a1b2e"/>
<circle cx="70" cy="68" r="15" fill="#b8235a" stroke="#fff" stroke-width="4"/><path d="M61.5 59.5 78.5 76.5" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
</g>
<text x="80" y="360" font-family="Bricolage Grotesque, Manrope, Arial, Helvetica, sans-serif" font-weight="800" font-size="96" fill="#2a1b2e" letter-spacing="-3">TIPSY <tspan fill="#b8235a">TABO</tspan></text>
<g transform="translate(546,290)"><circle cx="38" cy="38" r="30" fill="none" stroke="#b8235a" stroke-width="11"/><path d="M17 17 59 59" stroke="#b8235a" stroke-width="11" stroke-linecap="round"/></g>
<text x="80" y="430" font-family="Manrope, Arial, Helvetica, sans-serif" font-weight="600" font-size="40" fill="rgba(42,27,46,0.72)">Say anything. Except that.</text>
<text x="80" y="500" font-family="Manrope, Arial, Helvetica, sans-serif" font-weight="600" font-size="26" fill="rgba(42,27,46,0.62)">One phone · 2–4 teams · 5,000+ cards · swipe to play · works offline</text>
<g transform="translate(760,110)">
<rect x="0" y="0" width="360" height="420" rx="34" fill="#fff" stroke="rgba(60,30,60,0.08)"/>
<rect x="0" y="0" width="360" height="120" rx="34" fill="#ffdce9"/><rect x="0" y="80" width="360" height="40" fill="#ffdce9"/>
<text x="180" y="42" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="700" font-size="14" letter-spacing="3" fill="#9c1f52">GET THEM TO SAY</text>
<text x="180" y="92" text-anchor="middle" font-family="Bricolage Grotesque, Arial, sans-serif" font-weight="800" font-size="46" fill="#2a1b2e">Hangover</text>
<text x="180" y="160" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="3" fill="#d0342c">WITHOUT SAYING</text>
${["Headache","Drunk","Morning","Alcohol","Regret"].map((w,i)=>`<rect x="28" y="${178+i*46}" width="304" height="38" rx="12" fill="rgba(255,224,220,0.7)"/><circle cx="${180-w.length*7-14}" cy="${197+i*46}" r="4" fill="#d0342c"/><text x="${180+8}" y="${204+i*46}" text-anchor="middle" font-family="Bricolage Grotesque, Arial, sans-serif" font-weight="700" font-size="22" fill="#2a1b2e">${w}</text>`).join("")}
</g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("docs/media/og.png");
console.log("og ok");
