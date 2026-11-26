#!/usr/bin/env node
// Regenerates the optimized media committed under public/media/.
// Inputs are the original assets already in public/. Run locally:
//   node scripts/build-media.mjs
// Requires: sharp (installed with next) and ffmpeg on PATH (posters only).
// Outputs are committed, so builds and deploys never need ffmpeg.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUB = path.join(ROOT, "public");
const OUT = path.join(PUB, "media");
fs.mkdirSync(path.join(OUT, "hero"), { recursive: true });
fs.mkdirSync(path.join(OUT, "footer"), { recursive: true });
fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });

const report = [];
const write = async (pipeline, file) => {
  await pipeline.toFile(file);
  const { size } = fs.statSync(file);
  report.push(`${path.relative(PUB, file)}  ${size} B`);
};

// 1) Hero day-phase art. The *.avif sources are really PNG files.
const HERO = {
  morning: "newimages/cofounder-bg.avif",
  afternoon: "newimages/after_alt.avif",
  evening: "newimages/vegas_night_hero.avif",
  night: "newimages/niag_night_hero.avif",
};
for (const [phase, src] of Object.entries(HERO)) {
  for (const width of [720, 1200]) {
    const base = () => sharp(path.join(PUB, src)).resize({ width, withoutEnlargement: true });
    await write(base().avif({ quality: 42, effort: 6 }), path.join(OUT, "hero", `${phase}-${width}.avif`));
    await write(base().webp({ quality: 70 }), path.join(OUT, "hero", `${phase}-${width}.webp`));
  }
}

// 2) Footer day-phase art (was 1–3 MB PNG each).
const FOOTER = {
  morning: "newimages/morningfoot.png",
  afternoon: "newimages/afternoonfoot.png",
  evening: "newimages/nightfoot.png",
  night: "newimages/footer-4.png",
};
for (const [phase, src] of Object.entries(FOOTER)) {
  const base = () => sharp(path.join(PUB, src)).resize({ width: 1280, withoutEnlargement: true });
  await write(base().avif({ quality: 44, effort: 6 }), path.join(OUT, "footer", `${phase}.avif`));
  await write(base().webp({ quality: 68 }), path.join(OUT, "footer", `${phase}.webp`));
}

// 2b) About illustrations + experience icons: pre-sized static WebP (served
//     unoptimized). Sending 1–2 MB PNG sources through the on-demand optimizer
//     stalled `next start` on a cold cache when many were requested at once.
fs.mkdirSync(path.join(OUT, "about"), { recursive: true });
fs.mkdirSync(path.join(OUT, "icons"), { recursive: true });
const ABOUT = {
  cherry: ["newimages/cherry.png", 960],
  coast: ["newimages/coast.png", 1280],
  rooftop: ["newimages/rooftop.png", 960],
  portrait: ["newimages/vedant-profile.jpg", 1080],
};
for (const [name, [src, width]] of Object.entries(ABOUT)) {
  await write(sharp(path.join(PUB, src)).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }), path.join(OUT, "about", `${name}.webp`));
}
for (const name of ["codechef", "ispace", "hackathons", "dandiya"]) {
  await write(sharp(path.join(PUB, "assets", `${name}.png`)).resize({ width: 112, height: 112, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).webp({ quality: 82 }), path.join(OUT, "icons", `${name}.webp`));
}

// 3) Project posters: real frames captured from each project's demo video.
//    (time offsets picked by eye so the frame shows the product, not a fade.)
const POSTERS = [
  ["propertydhundo", "textures/project/project1.mp4", 0.5],
  ["medwe", "textures/project/project2.mp4", 0.5],
  ["chatapp", "textures/project/project3.mp4", 2.5],
  ["pixabay-gallery", "textures/project/project4.mp4", 0.5],
  ["openai-image-generator", "textures/project/project5.mp4", 2.0],
];
const tmp = fs.mkdtempSync(path.join(OUT, ".tmp-"));
for (const [slug, video, at] of POSTERS) {
  const png = path.join(tmp, `${slug}.png`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(at), "-i", path.join(PUB, video), "-frames:v", "1", png]);
  const meta = await sharp(png).metadata();
  // normalise every poster to 16:9 so the layout reserves identical space
  const pipeline = sharp(png).resize({ width: 1280, height: 720, fit: "cover", position: "top", withoutEnlargement: false });
  await write(pipeline.clone().webp({ quality: 88 }), path.join(OUT, "projects", `${slug}.webp`));
  report.push(`  (source frame ${meta.width}x${meta.height} @${at}s of ${video})`);
}
fs.rmSync(tmp, { recursive: true, force: true });

// 4) Share card 1200x630 (metadata previously declared 1200x630 for a 1000x1000 file).
const W = 1200, H = 630;
const card = await sharp(path.join(PUB, HERO.morning)).resize({ width: W, height: H, fit: "cover", position: "top" }).toBuffer();
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#061a33" stop-opacity="0.78"/><stop offset="0.6" stop-color="#061a33" stop-opacity="0.35"/><stop offset="1" stop-color="#061a33" stop-opacity="0"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="72" y="190" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#fff7ef">Vedant Khare</text>
  <text x="74" y="258" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="36" fill="#fff1d6">Full-stack developer · Chennai, India</text>
  <text x="74" y="318" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26" fill="#e2ecf7">kharevedant.is-a.dev</text>
</svg>`);
await write(sharp(card).composite([{ input: overlay }]).jpeg({ quality: 82, mozjpeg: true }), path.join(PUB, "og.jpg"));

console.log(report.join("\n"));
