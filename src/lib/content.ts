import { getCollection } from 'astro:content';

/**
 * Drafts are visible while running `npm run dev` so you can see a write-up
 * rendered while working on it, and hidden in production builds so unfinished
 * entries never reach the live site.
 */
export async function getProblems() {
  return getCollection('problems', ({ data }) => !import.meta.env.PROD || !data.draft);
}
