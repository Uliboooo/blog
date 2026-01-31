// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  integrations: [
    expressiveCode({
      // Configure the theme to match the blog's aesthetic (or use GitHub themes)
      themes: ['github-dark', 'github-light'],
      styleOverrides: {
        // Optional: Customize to match the specific 'light' bg of the blog if needed
        // but default github-light is usually good.
        // We will stick to defaults first.
      }
    }),
    mdx()
  ],
});
