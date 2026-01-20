import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    repos: z.array(
      z.object({
        owner: z.string(),
        name: z.string(),
        featured: z.boolean().default(false),
        description: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
};
