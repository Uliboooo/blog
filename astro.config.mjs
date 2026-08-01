// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import pkg from "./package.json" with { type: "json" };
// import wasm from 'vite-plugin-wasm'
// import topLevelAwait from 'vite-plugin-top-level-await'
import { execSync } from "node:child_process";
import { remarkPlugins, rehypePlugins } from "./src/markdown-pipeline.js";

const commit = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  site: "https://blog.uliboooo.dev",

  redirects: {
    "/blog/[slug]": "/[slug]",
  },

  server: {
    host: true,
    allowedHosts: true,
  },

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },

  markdown: {
    processor: unified({ remarkPlugins, rehypePlugins }),
  },

  vite: {
    optimizeDeps: {
      exclude: [
        "@myriaddreamin/typst.ts",
        "@myriaddreamin/typst-ts-renderer",
        "@myriaddreamin/typst-ts-web-compiler",
      ],
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(commit),
    },
  },
});
