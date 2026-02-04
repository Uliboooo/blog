// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.uliboooo.dev',
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeExternalLinks, { 
        target: '_blank', 
        rel: ['noopener', 'noreferrer'],
        properties: { class: 'external-link' }
      }]
    ]
  },
  integrations: [
    expressiveCode({
      // Configure the theme to match the blog's aesthetic
      themes: ['github-dark', 'github-light'],
    }),
    mdx({
      // Disable built-in syntax highlighting to let expressiveCode handle it
      syntaxHighlight: false,
    })
  ],
});