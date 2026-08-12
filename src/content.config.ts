import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const problems = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/problems' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Set when the write-up follows someone else's breakdown rather than
    // being original analysis. Surfaces a "Study notes" badge on the page.
    source: z
      .object({
        label: z.string(),
        url: z.string().url(),
      })
      .optional(),
  }),
});

export const collections = { problems };
