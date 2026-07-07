/// <reference types="@cloudflare/workers-types" />
// functions/api/views/[slug].ts
//
// Per-post view counter backed by Workers KV, with server-side dedup.
//   GET  /api/views/:slug  -> read the current count (no increment)
//   POST /api/views/:slug  -> count a unique visit and return the count
//
// A visit is deduped per (IP + User-Agent + UTC day): a given visitor
// increments a post at most once per calendar day (Plausible/GoatCounter
// style). Raw IP/UA are never stored — only a salted SHA-256 hash.
//
// The KV namespace is bound as `VIEWS`, declared in wrangler.jsonc under
// `kv_namespaces` (generate it with `bun run kv:setup`). Optional secret
// `VIEWS_SALT` hardens the visitor hash.

interface Env {
  VIEWS: KVNamespace;
  VIEWS_SALT?: string;
}

const SLUG_RE = /^[a-z0-9_-]{1,100}$/;

// Keep the dedup marker a bit longer than a day so day-boundary races don't
// double count; the UTC day is already baked into the hash.
const DEDUP_TTL_SECONDS = 60 * 60 * 48;

const countKey = (slug: string) => `count:${slug}`;
const seenKey = (slug: string, visitor: string) => `seen:${slug}:${visitor}`;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Never let the edge cache serve a stale count or suppress the POST.
      "Cache-Control": "no-store",
    },
  });

const normalizeSlug = (raw: string | string[] | undefined): string | null => {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug || !SLUG_RE.test(slug)) return null;
  return slug;
};

const readCount = async (env: Env, slug: string): Promise<number> => {
  const value = await env.VIEWS.get(countKey(slug));
  const n = value ? Number.parseInt(value, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const sha256hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Per-day, per-visitor fingerprint. Includes the UTC date so the hash rotates
// daily (calendar-day unique); stores only the hash, never the raw IP/UA.
const visitorHash = async (
  request: Request,
  env: Env,
  slug: string,
): Promise<string> => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ua = request.headers.get('User-Agent') || '';
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const salt = env.VIEWS_SALT ?? '';
  return sha256hex(`${day}|${ip}|${ua}|${slug}|${salt}`);
};

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = normalizeSlug(params.slug);
  if (!slug) return json({ error: "invalid slug" }, 400);

  const count = await readCount(env, slug);
  return json({ count });
};

export const onRequestPost: PagesFunction<Env> = async ({
  params,
  env,
  request,
}) => {
  const slug = normalizeSlug(params.slug);
  if (!slug) return json({ error: "invalid slug" }, 400);

  const marker = seenKey(slug, await visitorHash(request, env, slug));

  // Already counted this visitor today → return the current value unchanged.
  if (await env.VIEWS.get(marker)) {
    return json({ count: await readCount(env, slug), counted: false });
  }

  // First view today: record the marker (auto-expires), then increment.
  // Read-modify-write is not atomic, so a few counts can be lost under heavy
  // concurrency — acceptable here, and dedup keeps write volume low.
  await env.VIEWS.put(marker, '1', { expirationTtl: DEDUP_TTL_SECONDS });
  const count = (await readCount(env, slug)) + 1;
  await env.VIEWS.put(countKey(slug), String(count));
  return json({ count, counted: true });
};
