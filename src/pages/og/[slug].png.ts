import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { ogImageResponse } from "../../utils/ogImage";

export const prerender = true;
const BLOG_TITLE = "Compute on Snails";

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

export const GET: APIRoute = async ({ props }) =>
  ogImageResponse(
    (props?.title as string | undefined) ?? BLOG_TITLE,
    props?.description as string | undefined,
  );
