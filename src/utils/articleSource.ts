// Shared access to the raw article markdown on disk.
//
// Both raw endpoints — /md/<slug> (src/utils/markdownEndpoint.ts) and
// /html/<slug> (src/utils/htmlEndpoint.ts) — resolve a slug to the same
// `src/content/<slug>/<slug>.md` file and expose the same set of published
// slugs, so that lookup lives here rather than being duplicated per endpoint.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCollection } from "astro:content";

const slugPattern = /^[A-Za-z0-9_-]+$/;
const contentRoot = join(process.cwd(), "src", "content");

// Articles live at src/content/<slug>/<slug>.md. Both the directory and the
// file are matched case-insensitively so a slug from the URL resolves even
// when the on-disk name differs in case.
async function resolveMarkdownPath(slug: string) {
  const target = slug.toLowerCase();
  const entries = await readdir(contentRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.toLowerCase() !== target) {
      continue;
    }

    const articleDir = join(contentRoot, entry.name);
    const files = await readdir(articleDir, { withFileTypes: true });
    const markdownFile = files.find(
      (file) => file.isFile() && file.name.toLowerCase() === `${target}.md`,
    );

    if (markdownFile) {
      return join(articleDir, markdownFile.name);
    }
  }

  return null;
}

/** Slugs of every published article, in `getStaticPaths` shape. */
export async function getPublishedArticlePaths() {
  const posts = await getCollection("blog");

  return posts
    .filter((post) => post.data.published !== false)
    .map((post) => ({
      params: { slug: post.id.split("/")[0] },
    }));
}

/**
 * Raw markdown (frontmatter included) for a slug, or null when the slug is
 * malformed or no matching article exists.
 */
export async function readArticleSource(slug: string) {
  if (!slugPattern.test(slug)) return null;

  const markdownPath = await resolveMarkdownPath(slug);
  if (!markdownPath) return null;

  return readFile(markdownPath, "utf-8");
}

export const notFound = () => new Response("Not found", { status: 404 });
