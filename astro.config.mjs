import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import Icons from 'unplugin-icons/vite';
import { astroTakumiOg } from './scripts/takumi-og-integration.mjs';
import { unified } from '@astrojs/markdown-remark';

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
    astroTakumiOg(),
  ],

  vite: {
    plugins: [
      tailwindcss(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
    ],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    processor: unified({
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
    }),
  },

  adapter: cloudflare({
    prerenderEnvironment: 'node',
  }),

  devToolbar: {
    enabled: false,
  },
});
