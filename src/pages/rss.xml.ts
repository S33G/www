import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }: { data: CollectionEntry<'blog'>['data'] }) => !data.draft);

  return rss({
    title: 's33g',
    description: 'A developer blog with ASCII aesthetics',
    site: context.site!,
    items: posts
      .sort((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post: CollectionEntry<'blog'>) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
      })),
    customData: `<language>en-us</language>`,
  });
}
