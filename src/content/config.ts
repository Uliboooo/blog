import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    writer: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    thumbnail: image().optional(),
  }),
});

export const collections = {
  articles,
};
