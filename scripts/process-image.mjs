#!/usr/bin/env node

/**
 * Image processor for IOMETE docs.
 * Compress PNGs for optimal file size.
 *
 * Usage:
 *   node scripts/process-image.mjs \
 *     --input  static/img/feature/overview.png \
 *     --output static/img/feature/overview-detail.png \
 *     --compress --quality 80
 *
 * Output (stdout JSON):
 *   { "success": true, "output": "path", "size": 12345 }
 *   { "success": false, "error": "..." }
 */

import sharp from "sharp";
import { parseArgs } from "node:util";
import { statSync, renameSync } from "node:fs";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

// ── CLI args ─────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    input: { type: "string" },
    output: { type: "string" },
    compress: { type: "boolean", default: false },
    quality: { type: "string", default: "80" },
  },
  strict: false,
});

if (!args.input) {
  console.log(JSON.stringify({ success: false, error: "Missing --input" }));
  process.exit(1);
}

const outputPath = args.output || args.input;
const inPlace = outputPath === args.input;
const quality = parseInt(args.quality, 10);

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    let pipeline = sharp(args.input);

    // Compress + write
    const dir = dirname(outputPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    if (args.compress) {
      pipeline = pipeline.png({
        quality,
        compressionLevel: 9,
        palette: true,
        colours: 256,
        effort: 10,
        dither: 1.0,
      });
    }

    const writePath = inPlace
      ? join(dirname(outputPath), `._tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.png`)
      : outputPath;

    await pipeline.toFile(writePath);

    if (inPlace) renameSync(writePath, outputPath);

    const size = statSync(outputPath).size;
    console.log(JSON.stringify({ success: true, output: outputPath, size }));
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}

main();
