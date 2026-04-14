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
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: "https://pavi2410.com",
  trailingSlash: 'ignore',

  redirects: {
    '/gsoc-2020-appinventor-project-vce': '/blog/gsoc-2020-appinventor-project-vce',
    '/tools': 'https://toolkit.pavi2410.com',
    '/tools/diff-checker': 'https://toolkit.pavi2410.com/diff-checker',
    '/tools/image-editor': 'https://toolkit.pavi2410.com/image-editor',
    '/tools/name-checker': 'https://toolkit.pavi2410.com/name-checker',
    '/tools/pdf-editor': 'https://toolkit.pavi2410.com/pdf-editor',
  },

  integrations: [
    icon(),
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/blog/tag/'),
    }),
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
    ssr: {
      external: ['@resvg/resvg-js'],
      optimizeDeps: {
        exclude: ['@resvg/resvg-js']
      }
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
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: {
          className: ['heading-anchor'],
          ariaHidden: true,
          tabIndex: -1,
        },
        content: {
          type: 'element',
          tagName: 'span',
          properties: {
            className: ['icon', 'icon-link'],
          },
          children: [{ type: 'text', value: '#' }],
        },
      }],
    ],
  },

  adapter: cloudflare({
    prerenderEnvironment: 'node',
  }),
});