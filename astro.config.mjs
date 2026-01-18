import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import Icons from 'unplugin-icons/vite';
import opengraphImages from 'astro-opengraph-images';
import fs from 'fs';
import { blogOgImage } from './src/og-image.tsx';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: "https://pavi2410.com",

  redirects: {
    '/gsoc-2020-appinventor-project-vce': '/blog/gsoc-2020-appinventor-project-vce',
  },

  integrations: [
    icon(),
    mdx(),
    react(),
    sitemap(),
    opengraphImages({
      options: {
        fonts: [
          {
            name: "Inter",
            weight: 400,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
          },
          {
            name: "Inter",
            weight: 700,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
          },
          {
            name: "Bricolage Grotesque",
            weight: 800,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff"),
          },
        ],
      },
      render: blogOgImage,
    }),
  ],

  vite: {
    plugins: [
      tailwindcss(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
    ],
    ssr: { // ssr instead of rollupOptions
      external: ['@resvg/resvg-js']
    },
    build: {
      rollupOptions: {
        external: ['@resvg/resvg-js', 'jsdom', 'cssstyle']
      }
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    },
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },

  adapter: cloudflare(),
});