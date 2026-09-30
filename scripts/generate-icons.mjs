/**
 * Generates the PWA raster icons from a self-contained SVG.
 *
 * Why not just reuse public/icon.svg? That file renders its Arabic glyph with
 * a <text> element, and a manifest/icon SVG is painted in an isolated context
 * with no access to the next/font stylesheet. The glyph therefore falls back
 * to the generic serif slot (or tofu) on most devices, and iOS ignores manifest
 * SVG icons for the home screen entirely.
 *
 * The artwork here is geometry only, so it rasterizes identically everywhere.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public");

/** Book/mushaf mark: an open book, drawn from paths so no font is involved. */
function markSvg(size, { padding }) {
  const s = size;
  const c = s / 2;
  // An open book: two pages meeting at a spine.
  const halfW = s * 0.28;
  const top = c - s * 0.16;
  const bottom = c + s * 0.2;
  const spineX = c;
  const pageDrop = s * 0.03;

  const leftPage = `
    M ${spineX} ${top + pageDrop}
    C ${spineX - halfW * 0.45} ${top - s * 0.02}, ${spineX - halfW * 0.8} ${top - s * 0.03}, ${spineX - halfW} ${top}
    L ${spineX - halfW} ${bottom}
    C ${spineX - halfW * 0.8} ${bottom - s * 0.02}, ${spineX - halfW * 0.45} ${bottom + s * 0.01}, ${spineX} ${bottom - pageDrop}
    Z`;

  const rightPage = `
    M ${spineX} ${top + pageDrop}
    C ${spineX + halfW * 0.45} ${top - s * 0.02}, ${spineX + halfW * 0.8} ${top - s * 0.03}, ${spineX + halfW} ${top}
    L ${spineX + halfW} ${bottom}
    C ${spineX + halfW * 0.8} ${bottom - s * 0.02}, ${spineX + halfW * 0.45} ${bottom + s * 0.01}, ${spineX} ${bottom - pageDrop}
    Z`;

  // Page rules, mirrored on each side.
  const rules = [];
  for (let i = 1; i <= 3; i += 1) {
    const y = top + (s * 0.09 * i);
    const inset = halfW * 0.16 * i;
    rules.push(
      `<line x1="${spineX - halfW + inset}" y1="${y}" x2="${spineX - halfW * 0.12}" y2="${y + s * 0.008}" />`
    );
    rules.push(
      `<line x1="${spineX + halfW - inset}" y1="${y}" x2="${spineX + halfW * 0.12}" y2="${y + s * 0.008}" />`
    );
  }

  const ringInset = s * 0.115 + padding;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1917"/>
      <stop offset="0.5" stop-color="#292524"/>
      <stop offset="1" stop-color="#44403c"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${s * 0.1875}" fill="url(#bg)"/>
  <circle cx="${c}" cy="${c}" r="${c - ringInset}" fill="none" stroke="#b45309" stroke-width="${s * 0.027}"/>
  <circle cx="${c}" cy="${c}" r="${c - ringInset - s * 0.038}" fill="none" stroke="#78716c" stroke-width="${s * 0.006}"/>
  <g fill="#fafaf9" fill-opacity="0.92">
    <path d="${leftPage}"/>
    <path d="${rightPage}"/>
  </g>
  <g stroke="#b45309" stroke-width="${s * 0.011}" stroke-linecap="round" opacity="0.75" fill="none">
    ${rules.join("\n    ")}
  </g>
  <line x1="${spineX}" y1="${top + pageDrop}" x2="${spineX}" y2="${bottom - pageDrop}"
        stroke="#b45309" stroke-width="${s * 0.016}" stroke-linecap="round"/>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, padding: 0, purpose: "any" },
  { file: "icon-512.png", size: 512, padding: 0, purpose: "any" },
  // A maskable icon is cropped to a circle by Android, so the mark must sit
  // inside the safe zone: content within the central 80% survives any crop.
  { file: "icon-maskable-512.png", size: 512, padding: 0, purpose: "maskable" },
  { file: "apple-touch-icon.png", size: 180, padding: 0, purpose: "apple" },
  { file: "favicon.png", size: 32, padding: 0, purpose: "favicon" },
];

for (const { file, size, padding } of targets) {
  const svg = markSvg(size, { padding });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(OUT_DIR, file), png);
  console.log(`${file}  ${size}x${size}  ${png.length} bytes`);
}

console.log("Icons written to public/");
