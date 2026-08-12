---
title: 'Design Ticketmaster'
summary: 'TODO — one sentence on the most interesting thing you found. Shows on the homepage.'
# TODO: set to the date you publish. Numbering is by publication order.
date: 2026-01-01
tags: ['contention', 'locking', 'bot-abuse']
draft: true
# Uncomment if you follow someone else's breakdown:
# source:
#   label: "Hello Interview's Ticketmaster breakdown"
#   url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster'
---

<!--
WHY THIS ONE FIRST: it's mostly contention and business logic, which you can
reason about from experience rather than recall. Cloudflare Waiting Room exists
precisely because of this problem — use that.

QUESTIONS AN INTERVIEWER WOULD PUSH ON:
- What exactly is the shared resource under contention? (a seat, not "the site")
- How long do you hold a reservation, and what releases it if the user vanishes?
- Two people click the same seat in the same millisecond. What guarantees one loses?
- 50,000 people arrive when tickets drop. Where does the queue live?
- How do you tell a scalper bot from a determined fan? What do you do when unsure?
- Would you rather oversell by 1% or reject 1% of legitimate buyers? Defend it.

YOUR ANGLE: the bot/abuse dimension is your home turf. Most write-ups treat it as
an afterthought. Don't.
-->

## Requirements

**Functional**

-

**Non-functional**

-

## Estimates

| Metric | Value |
| --- | --- |
| Writes | |
| Reads | |
| Storage | |

What did the numbers tell you that you didn't expect?

## Approach

## Tradeoffs

**Decision.** What you gave up, and what the alternative would have bought you.

## What I'd do differently

Where the first pass was wrong. Most valuable section — it shows learning rather than recall.
