---
title: 'Design WhatsApp'
summary: 'TODO — one sentence on the most interesting thing you found. Shows on the homepage.'
# TODO: set to the date you publish. Numbering is by publication order.
date: 2026-01-01
tags: ['messaging', 'encryption', 'delivery-guarantees']
draft: true
# Uncomment if you follow someone else's breakdown:
# source:
#   label: "Hello Interview's WhatsApp breakdown"
#   url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp'
---

<!--
WHY THIS ONE: the clearest place to show you understand what security actually
COSTS in a distributed system, rather than treating encryption as a checkbox.

QUESTIONS AN INTERVIEWER WOULD PUSH ON:
- With true end-to-end encryption, what can the server do, and what becomes
  impossible? (search, moderation, multi-device history — be specific)
- A user has 4 devices. Where do keys live and what happens when they add a 5th?
- Recipient is offline for a week. Where does the message sit, and for how long?
- Group of 500. Fan out on write or on read? Does E2E change that answer?
- What does "delivered" mean, and who is allowed to be wrong about it?

YOUR ANGLE: most write-ups say "use the Signal protocol" and move on. The
interesting material for you is the tension between E2E and everything an
operator needs — abuse detection, spam, lawful requests, multi-device sync.
That tension is a security-program conversation, not just an architecture one.
-->

## Requirements

**Functional**

-

**Non-functional**

-

## Estimates

| Metric | Value |
| --- | --- |
| Messages/sec | |
| Connections | |
| Storage | |

What did the numbers tell you that you didn't expect?

## Approach

## Tradeoffs

**Decision.** What you gave up, and what the alternative would have bought you.

## What I'd do differently

Where the first pass was wrong. Most valuable section — it shows learning rather than recall.
