---
title: 'Design an ad click aggregator'
summary: 'Counting is easy until money depends on the count — then idempotency, late events, and hot shards decide the design.'
date: 2026-08-13
tags: ['streaming', 'queues', 'abuse']
draft: false
source:
  label: "Hello Interview's ad click aggregator breakdown"
  url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator'
---

I wanted a streaming problem, and this one has a property most don't: the output is an invoice.
Being approximately right is fine for a dashboard and unacceptable for billing, and that tension
drives everything.

## Requirements

**Functional**

- Record a click, then redirect the user to the advertiser.
- Let advertisers query click counts, down to per-minute granularity.

**Non-functional**

- Handle on the order of 10k clicks/second at peak.
- Metrics should appear in near real time.
- Queries over long ranges should still return in under a second.
- Don't lose clicks, and don't count one twice.

## Scale

~10k clicks/second is around 100M events/day. That's not enormous by itself. What makes it awkward
is the query pattern: advertisers want both "the last minute, live" and "last quarter, exact" from
the same data. Those are different systems wearing one interface.

## Approach

The click endpoint redirects server-side, so the click is recorded before the user leaves. Events
go into a log-structured stream partitioned by ad ID, a stream processor does windowed aggregation,
and pre-aggregated counts land in a columnar analytics store.

Pre-aggregation is what makes queries fast. Nobody scans 100M raw rows to answer "how many clicks
yesterday" — the pipeline writes per-ad, per-minute totals, and queries roll those up.

Windowing uses event time rather than processing time. A click that happened at 11:59:58 but
arrives at 12:00:03 belongs to the earlier minute, and only event-time semantics with watermarks
get that right. Otherwise every minute boundary is slightly wrong, always in the same direction.

## The part I got wrong

I assumed "don't count a click twice" meant configuring the pipeline for exactly-once delivery and
moving on. That covers the pipeline. It does not cover the client.

The same click can arrive twice for reasons that have nothing to do with your infrastructure: a
retry, a double-tap, a refresh, or someone deliberately replaying the request. Exactly-once
processing faithfully processes a duplicate exactly once.

The fix is an identity for the click itself — a unique impression ID issued when the ad is
rendered, signed so it can't be forged or replayed, checked against a short-lived cache before the
event is accepted. Exactly-once is about the pipeline; idempotency is about the event. Conflating
them was the mistake.

## Tradeoff worth arguing about

**Fast and approximate, or slow and exact?**

Advertisers want a live dashboard. Finance needs a number that survives audit. Serving both from
one pipeline means either the dashboard is slow or the invoice is a stream processor's best guess.

The common answer is to run both: the streaming layer for real-time, a periodic batch job over the
raw event log for the authoritative number, and reconciliation between them. That's genuinely more
machinery, and it's worth being honest that you're maintaining two systems because the business has
two different tolerances for being wrong.

I'd frame this as a product decision before an architectural one. "How wrong can the live number be,
and for how long?" is a question for the people who sell the product, and the answer determines
whether the second pipeline is justified.

## Hot shards

Partitioning by ad ID is correct until one advertiser is a large share of all traffic — then one
partition is saturated while others idle. Salting the key spreads writes across sub-partitions,
with the processor stripping the salt before persisting. It works, and it adds a layer of
indirection that has to be understood by everyone who touches the pipeline afterward.

## Where I'd push, given my background

The dedup mechanism and the fraud mechanism are the same mechanism.

A signed, single-use impression ID is what stops accidental double-counting *and* what stops
someone manufacturing clicks. That means click fraud isn't a feature bolted on later; it's a
consequence of whether event identity was designed properly at the start. If impression IDs are
guessable, unsigned, or reusable, no downstream analysis fully recovers.

The follow-up I'd want to answer: what happens when you detect fraud *after* invoicing? Clawing
back a charge is a business process, not a query, and the pipeline has to preserve enough raw
history to support it.

## What I'd look at next

- How long raw events are retained, and what that implies for reprocessing.
- Whether fraud scoring belongs inline (blocking) or offline (correcting).
- What advertisers see when the real-time and reconciled numbers disagree.
