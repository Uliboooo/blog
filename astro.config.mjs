// @ts-check
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import pkg from './package.json' assert { type: 'json' }
import { execSync } from 'node:child_process'

const commit = execSync('git rev-parse --short HEAD')
  .toString()
  .trim()

export default defineConfig({
  site: 'https://blog.uliboooo.dev',

  server: {
    host: true,
    allowedHosts: true,
  },

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          properties: {
            class: 'external-link',
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
