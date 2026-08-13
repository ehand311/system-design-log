---
title: 'Design a web crawler'
summary: 'Politeness is the real constraint, not throughput — and the whole design looks different from the receiving end.'
date: 2026-08-13
tags: ['queues', 'abuse', 'ai']
problemType: 'Crawling pipeline'
constraint: 'Per-domain politeness'
scale: 'Billions of pages across many domains'
lesson: 'Partition the frontier by domain so the crawler can be slow to each site while staying busy overall.'
diagram:
  - Seed URLs
  - Domain frontier
  - Politeness scheduler
  - Fetch workers
  - HTML and text storage
  - URL and content dedup
draft: false
source:
  label: "Hello Interview's web crawler breakdown"
  url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler'
---

This is the problem I most wanted to work through, because it's how LLM training corpora get
built and because I spend my working life on the other side of it — at a company whose customers
are the sites being crawled.

## Requirements

**Functional**

- Start from seed URLs, fetch pages, extract links, keep going.
- Store the extracted text for downstream use.
- Don't fetch the same thing twice.

**Non-functional**

- Polite: honor `robots.txt`, and don't hammer any single domain.
- Fault tolerant: a crawler dying shouldn't lose work or re-do it all.
- Fast enough to crawl on the order of billions of pages in days, not months.

## Scale

The headline number — billions of pages — turns out to be the *less* interesting constraint.
A modest number of machines can saturate a lot of bandwidth. The binding constraint is politeness:
if you limit yourself to roughly one request per second per domain, your throughput depends on how
many distinct domains you're working across, not how much hardware you have.

That reframes the whole problem. It's not "how do I fetch fast," it's "how do I stay busy while
being slow to everyone individually."

## Approach

A frontier queue holds URLs waiting to be crawled. Workers pull from it, fetch, extract links,
push new URLs back. Raw HTML goes to blob storage; extracted text is stored separately; a metadata
store tracks what's been seen and each domain's state.

Using a managed queue with visibility timeouts and dead-letter queues gets retries and backoff
without writing them. A message stays invisible while being worked and reappears if the worker
dies — so a crash costs one page, not a batch.

Deduplication happens at two levels, and they catch different things:

- **URL-level**, before enqueueing — cheap, catches the common case.
- **Content-level**, by hashing the fetched page — catches the same content served under many
  URLs, which is extremely common (session IDs, tracking parameters, print views).

Politeness needs per-domain state, not global rate limiting: a lock or sliding window keyed by
domain, so one worker respects a delay that all the others also observe.

## The part I got wrong

I initially treated the frontier as one big queue and assumed workers pulling from it would
naturally spread across domains. They don't. A single large site can dominate the queue, and then
every worker is politely waiting on the *same* domain while thousands of others sit idle.

The queue has to be partitioned by domain, with workers assigned across partitions. Otherwise
politeness and parallelism fight each other and politeness wins — at the cost of nearly all your
throughput.

The related trap is depth. Some sites generate infinite URL space, deliberately or not — calendars
that always have a next month, faceted search with unbounded filter permutations. Without a depth
limit, a crawler can spend forever in one place and never notice.

## Tradeoff worth arguing about

**How aggressively should you re-crawl?**

Never re-crawling means your corpus decays. Re-crawling often is a cost you pay on every site you
touch. The honest version of this decision is that you're spending someone else's bandwidth to
keep your data fresh, and the right frequency is a judgment about how much that's worth.

## The view from the other side

This is the part I care about most, and it's usually missing.

Everything above describes a well-behaved crawler. From the perspective of the site being
crawled, a polite crawler and an abusive one are distinguishable mostly by *claims* — a user
agent string, a published IP range — and claims can be forged. The operator's real questions are:
can I verify this crawler is who it says it is, what do I do about one that ignores `robots.txt`,
and is `robots.txt` even the right mechanism when the value of the content has changed?

That last question is live right now. `robots.txt` was designed for search indexing, where being
crawled meant being sent traffic. Crawling for model training breaks that bargain — the site gives
up content and gets nothing back. The protocol didn't change; the economics did.

I don't think that's a systems design question exactly. But it's the one I'd expect to be asked
about, and "just follow robots.txt" is not an adequate answer to it.

## What I'd look at next

- Verifying crawler identity in a way that can't be spoofed.
- What the design looks like if politeness limits are set by the *destination* rather than the
  crawler.
- Where extraction should happen — inline with fetching, or as a separate stage over stored HTML.
