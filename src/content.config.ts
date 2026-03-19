import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().trim(),
    excerpt: z.string().trim(),
    publishDate: z.date(),
    tags: z.array(z.string().trim().toLowerCase()),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    quickLinks: z.array(z.object({
      title: z.string(),
      link: z.string().url(),
    })).optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
