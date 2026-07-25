// OG image rendering with an on-disk cache.
//
// Astro caches optimized images between builds, but nothing caches these — the
// og/ routes re-rendered every PNG on every build, which measured as the single
// most expensive part of `generating static routes`.
//
// The cache is content-addressed on satori's SVG output rather than on the
// slug: satori is the cheap half of the work (~6ms) and sharp's PNG encode is
// the expensive half (~19ms), so paying for the SVG buys a key that is correct
// by construction. Any change to the title, description, theme, layout or font
// in src/utils/og.ts produces a different SVG, hence a different key and a
// fresh render — there is no cache version to remember to bump.
//
// Entries live alongside Astro's own asset cache in node_modules/.astro so that
// whatever preserves one between builds preserves both. The cache is purely an
// optimization: any failure to read or write it falls back to rendering.

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import {
  buildOgVNode,
  loadOgFonts,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "./og";

const cacheDir = join(process.cwd(), "node_modules", ".astro", "og");

const pngHeaders = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=31536000, immutable",
};

async function renderPng(svg: string): Promise<Buffer> {
  // Imported lazily so a fully cached build never pays sharp's startup cost.
  const { default: sharp } = await import("sharp");
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function writeCache(cachePath: string, png: Buffer): Promise<void> {
  await mkdir(cacheDir, { recursive: true });
  // Write to a unique temp file and rename, so a torn file is never observed
  // when several routes render concurrently.
  const tmp = `${cachePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(tmp, png);
  await rename(tmp, cachePath);
}

export async function renderOgPng(
  title: string,
  description?: string,
): Promise<Buffer> {
  const svg = await satori(buildOgVNode(title, description), {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: loadOgFonts(),
  });

  const key = createHash("sha256").update(svg).digest("hex").slice(0, 32);
  const cachePath = join(cacheDir, `${key}.png`);

  try {
    return await readFile(cachePath);
  } catch {
    // Cache miss (or unreadable entry) — render it.
  }

  const png = await renderPng(svg);

  try {
    await writeCache(cachePath, png);
  } catch {
    // A read-only or full cache directory must not fail the build.
  }

  return png;
}

/** Full OG image response, shared by the og/ routes. */
export async function ogImageResponse(title: string, description?: string) {
  const png = await renderOgPng(title, description);
  return new Response(png, { headers: pngHeaders });
}
