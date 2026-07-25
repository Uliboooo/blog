// Raw markdown endpoint, served at both /md/<slug> and /md/<slug>.md.
// The two routes under src/pages/md/ are one-line re-exports of what follows.

import {
  getPublishedArticlePaths,
  notFound,
  readArticleSource,
} from "./articleSource";

const markdownHeaders = {
  // text/plain so the source is shown rather than downloaded or rendered.
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

export const getStaticPaths = getPublishedArticlePaths;

export async function GET({ params }: { params: { slug: string } }) {
  const source = await readArticleSource(params.slug);
  if (source === null) return notFound();

  return new Response(source, { headers: markdownHeaders });
}
