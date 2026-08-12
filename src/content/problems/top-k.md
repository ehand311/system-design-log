---
title: 'Design a Top K service'
summary: 'TODO — one sentence on the most interesting thing you found. Shows on the homepage.'
# TODO: set to the date you publish. Numbering is by publication order.
date: 2026-01-01
tags: ['streaming', 'abuse']
draft: true
# Uncomment if you follow someone else's breakdown:
# source:
#   label: "Hello Interview's YouTube Top K breakdown"
#   url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube-top-k'
---

<!--
DO THIS ONE LAST. It's the most algorithm-heavy of the five (count-min sketch,
approximation bounds) and lands better once the others have built confidence.

THE REFRAME THAT MAKES IT YOURS: "top K most-viewed videos" is the same machine
as "top K attacking IPs" or "top K abused endpoints." Write it in the security
framing — it's more interesting, and it's the version you can defend.

QUESTIONS AN INTERVIEWER WOULD PUSH ON:
- Why can't you just keep a counter per item? Do the memory math out loud.
- What accuracy are you willing to give up, and what does that buy?
- Top K over the last minute, day, and month — same system or three?
- One item is 30% of all events. Does your scheme still work?
- How do you know your approximation is wrong, and by how much?

THE SENIOR INSTINCT TO SHOW: deliberately accepting bounded inaccuracy to make a
problem affordable. Being explicit about the error bound — rather than pretending
to exactness — is the thing that reads as experienced.
-->

## Requirements

**Functional**

-

**Non-functional**

-

## Estimates

| Metric | Value |
| --- | --- |
| Events/sec | |
| Distinct items | |
| Memory if exact | |

What did the numbers tell you that you didn't expect?

## Approach

## Tradeoffs

**Decision.** What you gave up, and what the alternative would have bought you.

## What I'd do differently

Where the first pass was wrong. Most valuable section — it shows learning rather than recall.
