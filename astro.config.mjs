// @ts-check
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import pkg from './package.json' assert { type: 'json' }
import { execSync } from 'node:child_process'
import remarkCodeTitle from './src/plugins/remark-code-title.js'
import remarkDirective from 'remark-directive'
import remarkDirectiveHandler from './src/plugins/remark-directive-handler.js'

const commit = execSync('git rev-parse --short HEAD')
  .toString()
  .trim()

export default defineConfig({
  site: 'https://blog.uliboooo.dev',

  redirects: {
    '/blog/[slug]': '/[slug]',
  },

  server: {
    host: true,
    allowedHosts: true,
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  markdown: {
    remarkPlugins: [remarkCodeTitle, remarkDirective, remarkDirectiveHandler],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          properties: {
            class: 'link--underline link--external',
          },
        },
      ],
    ],
  },

  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(commit),
    },
  },
})
