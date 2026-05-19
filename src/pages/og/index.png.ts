import type { APIRoute } from "astro";
import sharp from "sharp";
import { buildOgSvg } from "../../utils/og";

export const prerender = true;

export const GET: APIRoute = async () => {
  const svg = buildOgSvg("Uliboooo's blog");
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
