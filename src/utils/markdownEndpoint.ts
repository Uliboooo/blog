import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCollection } from "astro:content";

const markdownHeaders = {
  "Content-Type": "text/markdown; charset=utf-8",
};

const slugPattern = /^[A-Za-z0-9_-]+$/;

export async function getPublishedMarkdownPaths() {
  const posts = await getCollection("blog");

  return posts
    .filter((post) => post.data.published !== false)
    .map((post) => ({
      params: { slug: post.id.split("/")[0] },
    }));
}

export async function getMarkdownResponse(slug: string) {
  if (!slugPattern.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const markdownPath = join(process.cwd(), "src", "content", slug, `${slug}.md`);
  const source = await readFile(markdownPath, "utf-8");

  return new Response(source, { headers: markdownHeaders });
}
