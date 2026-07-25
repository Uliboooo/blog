import type { APIRoute } from "astro";
import { ogImageResponse } from "../../utils/ogImage";

export const prerender = true;

export const GET: APIRoute = async () => ogImageResponse("Compute on Snails");
