---
title: 'Design a web crawler'
summary: 'TODO — one sentence on the most interesting thing you found. Shows on the homepage.'
# TODO: set to the date you publish. Numbering is by publication order.
date: 2026-01-01
tags: ['crawling', 'queues', 'backpressure', 'ai']
draft: true
# Uncomment if you follow someone else's breakdown:
# source:
#   label: "Hello Interview's web crawler breakdown"
#   url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler'
---

<!--
WHY THIS ONE MATTERS MOST FOR YOUR POSITIONING: this is how LLM training corpora
get built, and it's the exact problem Cloudflare sells products against (bot
management, AI crawler controls, pay-per-crawl). It's your clearest bridge
between "I understand systems" and "I understand AI."

QUESTIONS AN INTERVIEWER WOULD PUSH ON:
- How do you avoid crawling the same URL twice? At what scale does that set stop
  fitting in memory?
- What's your politeness policy, and how is it enforced across many workers
  hitting the same domain?
- One domain has 100M URLs and another has 12. How do you stop the big one from
  starving everything else?
- A page 404s, or hangs for 60 seconds. What happens to that worker?
- How do you know when to re-crawl something?

THE ANGLE ONLY YOU HAVE: flip the perspective. You work for the company on the
*receiving* end. What does this crawler look like from the site being crawled,
and what would you do to identify or throttle it? Almost nobody writes that,
and it's the part that proves you've seen this in production.
-->

## Requirements

**Functional**

-

**Non-functional**

-

## Estimates

| Metric | Value |
| --- | --- |
| Pages/sec | |
| Storage | |
| Bandwidth | |

What did the numbers tell you that you didn't expect?

## Approach

## Tradeoffs

**Decision.** What you gave up, and what the alternative would have bought you.

## What I'd do differently

Where the first pass was wrong. Most valuable section — it shows learning rather than recall.
