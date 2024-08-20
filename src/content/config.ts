import { z, defineCollection } from "astro:content";

const postsCollection = defineCollection({
  type: 'content',
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
