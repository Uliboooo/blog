// Footer content, shared by the site footer component
// (src/components/Footer.astro) and the standalone footer emitted by the
// /html/<slug> endpoint (src/utils/htmlEndpoint.ts). The two render the same
// markup in different ways — Astro template vs. plain string — so the text and
// links they have in common live here to keep them from drifting apart.

export const FOOTER_COPYRIGHT = "© 2026 Uliboooo. All rights reserved.";

export const FOOTER_SOURCE_URL = "https://github.com/Uliboooo/blog";
export const FOOTER_SOURCE_LABEL = "View Source";

export const WHY_SNAILS_HEADING = 'Why "Compute on Snails" ?';
export const WHY_SNAILS_BODY =
  "ハードウェアに依らない抽象化された計算機を、「計算機の要件を満たすのならばカタツムリの上で計算してもいい」という冗談から。";
