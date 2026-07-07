/// <reference types="@cloudflare/workers-types" />
// functions/api/views/[slug].ts
//
// Per-post view counter backed by Workers KV.
//   GET  /api/views/:slug  -> read the current count (no increment)
//   POST /api/views/:slug  -> increment and return the new count
//
// The KV namespace is bound as `VIEWS`, declared in wrangler.jsonc under
// `kv_namespaces` (generate it with `bun run kv:setup`).

interface Env {
  VIEWS: KVNamespace;
}

const SLUG_RE = /^[a-z0-9_-]{1,100}$/;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Never let the edge cache serve a stale count or suppress the POST.
      'Cache-Control': 'no-store',
    },
  });

const normalizeSlug = (raw: string | string[] | undefined): string | null => {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug || !SLUG_RE.test(slug)) return null;
  return slug;
};

const readCount = async (env: Env, slug: string): Promise<number> => {
  const value = await env.VIEWS.get(slug);
  const n = value ? Number.parseInt(value, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = normalizeSlug(params.slug);
  if (!slug) return json({ error: 'invalid slug' }, 400);

  const count = await readCount(env, slug);
  return json({ count });
};

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const slug = normalizeSlug(params.slug);
  if (!slug) return json({ error: 'invalid slug' }, 400);

  // Read-modify-write. KV is eventually consistent and this is not atomic, so a
  // few counts can be lost under heavy concurrency — acceptable for this blog.
  const count = (await readCount(env, slug)) + 1;
  await env.VIEWS.put(slug, String(count));
  return json({ count });
};
