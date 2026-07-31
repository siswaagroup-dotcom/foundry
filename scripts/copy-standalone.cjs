/**
 * copy-standalone.cjs
 *
 * Next.js standalone output does NOT automatically copy:
 *   - .next/static   → needed to serve CSS, JS chunks, images
 *   - public/        → needed to serve favicon, robots.txt, etc.
 *
 * This script copies both into .next/standalone/ so the standalone
 * server can serve them correctly in production (Railway/Docker).
 *
 * Run automatically after `next build` via the "build" npm script.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const standaloneDir = path.join(ROOT, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error("ERROR: .next/standalone does not exist. Did next build run with output: 'standalone'?");
  process.exit(1);
}

// Copy .next/static → .next/standalone/.next/static
const staticSrc  = path.join(ROOT, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
copyDir(staticSrc, staticDest);
console.log("✓ Copied .next/static → .next/standalone/.next/static");

// Copy public/ → .next/standalone/public
const publicSrc  = path.join(ROOT, "public");
const publicDest = path.join(standaloneDir, "public");
copyDir(publicSrc, publicDest);
console.log("✓ Copied public/ → .next/standalone/public");

console.log("✓ Standalone build complete.");
