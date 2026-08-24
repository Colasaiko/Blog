import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('匿名'),
    category: z.string().default('通用'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    coverImage: z.string().optional(), video: z.string().optional(),
    keywords: z.string().optional(),
    nextTitle: z.string().optional(),
    nextSlug: z.string().optional(),
  }),
});

export const collections = { blog };
