# System Design Log

Notes from working through system design problems — the approach, the tradeoffs, and what I'd do
differently. Learning notes, not a teaching resource.

Built with [Astro](https://astro.build/), deployed to Cloudflare Workers, scaffolded with
[Claude Code](https://claude.com/claude-code).

## Adding a write-up

1. Copy `src/content/problems/_template.md` to a new file in the same folder.
2. Name the file after the URL you want — `rate-limiter.md` becomes `/problems/rate-limiter`.
3. Fill in the frontmatter and the body.
4. Set `draft: false` when it's ready to publish.

Files starting with `_` are ignored, so the template never shows up on the site. Anything with
`draft: true` is excluded from the build.

### Drafts in progress

Five scaffolded write-ups are sitting in `src/content/problems/` as drafts, in the order I'd
suggest working through them:

1. `ticketmaster.md` — contention, reservations, bot abuse
2. `web-crawler.md` — politeness, dedup, backpressure
3. `ad-click-aggregator.md` — stream aggregation, idempotency, fraud
4. `whatsapp.md` — E2E encryption, delivery guarantees
5. `top-k.md` — approximate counting (most algorithm-heavy; do it last)

Each contains an HTML comment with the questions an interviewer would push on. Comments don't
render, so they're safe to leave in — but delete them once the section is written.

To publish one: fill it in, **set `date` to the real publication date**, and flip `draft: false`.
The date matters because entries are numbered by publication order.

### Frontmatter

```yaml
---
title: 'Design a rate limiter'
summary: 'One sentence — shows on the homepage.'
date: 2026-08-12
tags: ['caching', 'distributed-systems']
draft: false
---
```

The schema is enforced in `src/content.config.ts`, so a typo in a field name fails the build
rather than silently rendering wrong.

## Local development

```bash
npm install
npm run dev
```

Runs at `http://localhost:4321`.

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Serve the built site locally |

## Deploying

Pushing to `main` triggers a Cloudflare Workers build automatically.

- Build command: `npm run build`
- Output directory: `dist`

## Structure

```
src/
├── content/problems/     write-ups (markdown)
├── content.config.ts     frontmatter schema
├── layouts/              page shell
├── pages/                routes
└── styles/global.css     all styling
```
