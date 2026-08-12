import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const problems = (await getCollection('problems', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'System Design Log — Eric Handal',
    description:
      'Notes from working through system design problems — approach, tradeoffs, and what I would do differently.',
    site: context.site ?? 'https://system-design-log.erichandal.workers.dev',
    items: problems.map((problem) => ({
      title: problem.data.title,
      description: problem.data.summary,
      pubDate: problem.data.date,
      link: `/problems/${problem.id}/`,
      categories: problem.data.tags,
    })),
  });
}
