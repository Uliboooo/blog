#!/usr/bin/env bash
#
# Create (or reuse) the `VIEWS` Workers KV namespaces used by the per-post
# view counter, and write their real ids into wrangler.jsonc.
#
# Run once, from the repo root, after `bunx wrangler login`:
#
#     bun run kv:setup
#
# Re-running is safe: existing namespaces are reused, not duplicated.
# The KV namespace id is not a secret, so committing wrangler.jsonc is fine.
#
# Env:
#   PAGES_PROJECT  Cloudflare Pages project name (default: blog).
#                  Must match your actual Pages project.
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="${PAGES_PROJECT:-blog}"
BINDING="VIEWS"
PROD_TITLE="${PROJECT}-${BINDING}"
PREVIEW_TITLE="${PROD_TITLE}_preview"
CONFIG="wrangler.jsonc"

command -v jq >/dev/null 2>&1 || { echo "error: jq is required." >&2; exit 1; }

# `wrangler whoami` exits 0 even when unauthenticated, so check the output text.
if bunx wrangler whoami 2>&1 | grep -qiE 'not authenticated|not logged in'; then
  echo "Not logged in. Run 'bunx wrangler login' first (or export CLOUDFLARE_API_TOKEN)." >&2
  exit 1
fi

# Print the id of an existing namespace with the given title, if any.
existing_id() {
  bunx wrangler kv namespace list 2>/dev/null \
    | jq -r --arg t "$1" '.[] | select(.title == $t) | .id' \
    | head -n1
}

# Extract a 32-hex namespace id from arbitrary wrangler output.
extract_id() { grep -oE '[0-9a-f]{32}' | head -n1; }

echo "Ensuring KV namespace '${PROD_TITLE}'..."
prod_id="$(existing_id "$PROD_TITLE")"
if [ -z "$prod_id" ]; then
  prod_id="$(bunx wrangler kv namespace create "$BINDING" 2>&1 | tee /dev/stderr | extract_id)"
fi

echo "Ensuring preview KV namespace '${PREVIEW_TITLE}'..."
preview_id="$(existing_id "$PREVIEW_TITLE")"
if [ -z "$preview_id" ]; then
  preview_id="$(bunx wrangler kv namespace create "$BINDING" --preview 2>&1 | tee /dev/stderr | extract_id)"
fi

if [ -z "$prod_id" ] || [ -z "$preview_id" ]; then
  echo "error: failed to obtain namespace ids (prod='${prod_id}' preview='${preview_id}')." >&2
  exit 1
fi

cat > "$CONFIG" <<JSON
{
  // Cloudflare Pages config for the blog.
  // Generated/updated by scripts/setup-kv.sh — the VIEWS binding backs the
  // per-post view counter (functions/api/views/[slug].ts).
  // KV namespace ids are not secrets; committing them is expected.
  "name": "${PROJECT}",
  "pages_build_output_dir": "./dist",
  "kv_namespaces": [
    {
      "binding": "${BINDING}",
      "id": "${prod_id}",
      "preview_id": "${preview_id}"
    }
  ]
}
JSON

echo
echo "Wrote ${CONFIG}:"
echo "  binding=${BINDING}  id=${prod_id}  preview_id=${preview_id}"
echo
echo "Next:"
echo "  git add ${CONFIG} && git commit -m 'chore: bind VIEWS KV' && git push"
