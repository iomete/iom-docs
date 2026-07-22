#!/usr/bin/env node

/**
 * Batch-compress raster images in place via the TinyPNG API.
 *
 * Usage:
 *   TINYPNG_API_KEY=<key> node scripts/tinypng-compress.mjs --list files.txt
 *   TINYPNG_API_KEY=<key> node scripts/tinypng-compress.mjs static/img/a.png static/img/b.jpg
 *
 * - Only writes the result back when it's at least 5% smaller.
 * - Processes largest files first so quota (500 free compressions/month)
 *   goes to the biggest wins; prints the API's running compression count.
 * - Exits non-zero if any file failed for a reason other than "not smaller".
 */

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { parseArgs } from "node:util";

const KEY = process.env.TINYPNG_API_KEY;
if (!KEY) {
  console.error("TINYPNG_API_KEY env var is required");
  process.exit(1);
}
const AUTH = "Basic " + Buffer.from("api:" + KEY).toString("base64");
const CONCURRENCY = 5;

const { values: args, positionals } = parseArgs({
  options: { list: { type: "string" } },
  allowPositionals: true,
});

let files = positionals;
if (args.list) {
  files = readFileSync(args.list, "utf8").split("\n").filter(Boolean);
}
files = files
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .map((f) => ({ path: f, size: statSync(f).size }))
  .sort((a, b) => b.size - a.size);

let saved = 0;
let done = 0;
let quotaExhausted = false;
let compressionCount = "?";
const failed = [];

async function compressOne({ path, size }) {
  if (quotaExhausted) {
    failed.push({ path, reason: "quota" });
    return;
  }
  try {
    const input = readFileSync(path);
    const res = await fetch("https://api.tinify.com/shrink", {
      method: "POST",
      headers: { Authorization: AUTH },
      body: input,
    });
    compressionCount = res.headers.get("compression-count") ?? compressionCount;
    if (res.status === 429 || res.status === 403) {
      quotaExhausted = true;
      failed.push({ path, reason: "quota" });
      return;
    }
    if (!res.ok) {
      failed.push({ path, reason: `HTTP ${res.status}` });
      return;
    }
    const out = await res.json();
    if (out.output.size >= size * 0.95) {
      done++;
      return; // not enough gain; keep original byte-for-byte
    }
    const dl = await fetch(out.output.url, { headers: { Authorization: AUTH } });
    if (!dl.ok) {
      failed.push({ path, reason: `download HTTP ${dl.status}` });
      return;
    }
    const buf = Buffer.from(await dl.arrayBuffer());
    writeFileSync(path, buf);
    saved += size - buf.length;
    done++;
    console.log(
      `${path}  ${(size / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`
    );
  } catch (e) {
    failed.push({ path, reason: e.message });
  }
}

const queue = [...files];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await compressOne(queue.shift());
  })
);

console.log(
  `\ndone: ${done}/${files.length}, saved ${(saved / 1e6).toFixed(1)} MB, ` +
    `API compression count this month: ${compressionCount}`
);
if (failed.length) {
  console.log(`failed (${failed.length}):`);
  for (const f of failed) console.log(`  ${f.path}: ${f.reason}`);
  process.exit(2);
}
