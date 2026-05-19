import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import sharp from "sharp";
import { buildOgSvg } from "../../utils/og";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts
    .filter((post) => post.data.published !== false)
    .map((post) => ({
      params: { slug: post.id.split("/")[0] },
      props: { 
        title: post.data.title,
        description: post.data.description,
      },
    }));
}

export const GET: APIRoute = async ({ props }) => {
  const title = (props?.title as string | undefined) ?? "Uliboooo's blog";
  const description = props?.description as string | undefined;
  const svg = buildOgSvg(title, description);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
