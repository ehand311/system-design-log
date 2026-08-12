---
title: 'Design an ad click aggregator'
summary: 'TODO — one sentence on the most interesting thing you found. Shows on the homepage.'
# TODO: set to the date you publish. Numbering is by publication order.
date: 2026-01-01
tags: ['streaming', 'idempotency', 'fraud']
draft: true
# Uncomment if you follow someone else's breakdown:
# source:
#   label: "Hello Interview's ad click aggregator breakdown"
#   url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator'
---

<!--
WHY THIS ONE: real-time stream aggregation is the backbone of both analytics and
ML feature pipelines. The dedup problem here IS click-fraud detection — which
connects your PayPal fraud exposure to modern data infrastructure.

QUESTIONS AN INTERVIEWER WOULD PUSH ON:
- Money depends on these counts. Exactly-once, or at-least-once plus idempotency?
  What does each actually cost?
- A click arrives 3 hours late. Does it count? Which window does it land in?
- One advertiser is 40% of your traffic. What happens to that shard?
- Advertisers want live dashboards; finance wants a correct monthly total. Same
  pipeline or two?
- How do you tell a fraudulent click from a real one, and where in the pipeline
  does that judgment happen?

YOUR ANGLE: the "fast and approximate" vs "slow and exact" split is a business
tradeoff before it's a technical one. That framing is squarely TPM territory —
lead with it rather than treating it as a footnote.
-->

## Requirements

**Functional**

-

**Non-functional**

-

## Estimates

| Metric | Value |
| --- | --- |
| Clicks/sec | |
| Storage/day | |
| Query latency | |

What did the numbers tell you that you didn't expect?

## Approach

## Tradeoffs

**Decision.** What you gave up, and what the alternative would have bought you.

## What I'd do differently

Where the first pass was wrong. Most valuable section — it shows learning rather than recall.
