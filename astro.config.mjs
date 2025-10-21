import { defineConfig } from 'astro/config';

import icon from "astro-icon";

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [icon()],
  site: 'https://pavi2410.com',

  redirects: {
    '/gsoc-2020-appinventor-project-vce': '/blog/gsoc-2020-appinventor-project-vce',
  },

  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});