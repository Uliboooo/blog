import { getCollection } from "astro:content";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

export async function GET({ site }: { site: URL }) {
  const posts = await getCollection("blog");
  const urls = [
    {
      loc: new URL("/", site).href,
    },
    ...posts
      .filter((post) => post.data.published !== false)
      .map((post) => {
        const slug = post.id.split("/")[0];
        return {
          loc: new URL(`/${slug}/`, site).href,
          lastmod: toDateString(post.data.latest_edit_at ?? post.data.date),
        };
      }),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        [
          "  <url>",
          `    <loc>${escapeXml(url.loc)}</loc>`,
          url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : undefined,
          "  </url>",
        ]
          .filter(Boolean)
          .join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
