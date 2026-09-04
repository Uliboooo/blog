// Shared markdown pipeline (remark/rehype plugins).
//
// Imported both by `astro.config.mjs` (for the site's own article rendering)
// and by `src/utils/htmlEndpoint.ts` (for the `/html/<slug>` raw-HTML endpoint)
// so the two stay in sync — the raw HTML matches what the site renders.

import rehypeExternalLinks from "rehype-external-links";
import remarkCodeTitle from "./plugins/remark-code-title.js";
import remarkDirective from "remark-directive";
import remarkDirectiveHandler from "./plugins/remark-directive-handler.js";
import remarkMusicLab86Embed from "./plugins/remark-music-lab86-embed.js";
import remarkTwitterEmbed from "./plugins/remark-twitter-embed.js";
import remarkTypst from "./plugins/remark-typst.js";
import remarkYoutubeEmbed from "./plugins/remark-youtube-embed.js";
import rehypeFootnoteBackrefIcon from "./plugins/rehype-footnote-backref-icon.js";

export const remarkPlugins = [
  remarkTypst,
  remarkCodeTitle,
  remarkDirective,
  remarkDirectiveHandler,
  remarkMusicLab86Embed,
  remarkTwitterEmbed,
  remarkYoutubeEmbed,
];

export const rehypePlugins = [
  rehypeFootnoteBackrefIcon,
  [
    rehypeExternalLinks,
    {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      properties: {
        class: "link--underline link--external",
      },
    },
  ],
];
