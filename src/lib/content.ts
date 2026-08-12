import { getCollection } from 'astro:content';

/**
 * Drafts are visible while running `npm run dev` so you can see a write-up
 * rendered while working on it, and hidden in production builds so unfinished
 * entries never reach the live site.
 */
export async function getProblems() {
  return getCollection('problems', ({ data }) => !import.meta.env.PROD || !data.draft);
}

type Problem = Awaited<ReturnType<typeof getProblems>>[number];

/**
 * Oldest first. The id tiebreak keeps ordering deterministic when several
 * entries share a date — without it, same-day entries could be numbered in one
 * order and displayed in another.
 */
export function byPublicationOrder(a: Problem, b: Problem) {
  return a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id);
}
