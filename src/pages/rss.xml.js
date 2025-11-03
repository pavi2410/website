import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection('posts', (post) => !post.data.draft))
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());

  return rss({
    title: "pavi2410's Blog",
    description: 'Web development, programming, performance optimization, CSS, JavaScript, and technology insights by Pavitra Golchha',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
      author: 'hello@pavi2410.com (Pavitra Golchha)',
    })),
    customData: `
      <language>en-us</language>
      <copyright>Copyright ${new Date().getFullYear()} Pavitra Golchha</copyright>
      <managingEditor>hello@pavi2410.com (Pavitra Golchha)</managingEditor>
      <webMaster>hello@pavi2410.com (Pavitra Golchha)</webMaster>
    `,
  });
}
