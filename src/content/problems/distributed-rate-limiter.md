---
title: 'Design a distributed rate limiter'
summary: 'Notes from working through the token bucket approach — why atomicity, not algorithm choice, turns out to be the hard part.'
date: 2026-08-12
tags: ['caching', 'contention', 'abuse']
draft: false
source:
  label: "Hello Interview's distributed rate limiter breakdown"
  url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter'
---

I picked this one first because it's adjacent to what I work on. I expected the interesting
decision to be *which algorithm* — it isn't.

## Requirements

**Functional**

- Identify who is making a request: user ID for authenticated traffic, IP for anonymous, API key
  for developer traffic.
- Enforce a configurable limit per client.
- Reject over-limit requests with a 429, and tell the caller when they can retry.

**Non-functional**

- This sits in the request path for *every* call, so latency has to be near-invisible — single-digit
  milliseconds.
- Availability matters more than perfect accuracy. Occasionally allowing a few extra requests is
  cheaper than adding an outage.

## Scale

At roughly 1M requests/sec, the limiter is doing a read-modify-write per request. That number is
what rules out several otherwise-reasonable designs — anything storing per-request timestamps, in
particular.

## Approach

Put the check at the API gateway rather than inside each service. Every request already passes
through it, so there's no extra network hop, and the policy lives in one place instead of being
reimplemented per service.

For the algorithm, four options came up:

| Algorithm | Problem with it |
| --- | --- |
| Fixed window | Boundary abuse — a client can spend a full quota at the end of one window and again at the start of the next |
| Sliding window log | Accurate, but stores a timestamp per request. Too much memory at this scale |
| Sliding window counter | Approximates the log with two counters. Reasonable compromise |
| Token bucket | Handles sustained load and bursts naturally; small fixed state per client |

Token bucket wins mostly on state size: a token count and a last-refill timestamp per client,
regardless of traffic volume.

That state goes in Redis so every gateway instance sees the same counters, sharded by client
identifier so a given client always lands on the same shard. Split state across shards would mean
a client's effective limit silently multiplies by the shard count.

## The part I got wrong

I assumed reading the bucket, computing the refill, and writing it back could be done with a
regular transaction. It can't — not safely. Between the read and the write, another gateway
instance handling the same client can interleave, and both see enough tokens. Under concurrency,
that's the common case, not the rare one.

The fix is to make the whole read-calculate-write sequence execute as one atomic unit on the Redis
side, via a Lua script. The algorithm choice was the easy part; making the update atomic is the
actual design work.

## Tradeoff worth arguing about

**Fail open or fail closed when Redis is unreachable?**

The instinct is fail open — don't let the rate limiter take down the API. The counterargument is
that the limiter is most likely to fail *precisely when traffic is spiking*, which is exactly when
you need it. Failing open then removes the protection at the moment it matters and can cascade into
the services behind it.

I don't think this has a universal answer. It depends on whether the limiter is primarily there for
abuse prevention or for capacity protection, and those pull in opposite directions.

## What I'd look at next

- Hot keys — a single legitimate high-volume client concentrating load on one shard.
- Pushing rule changes out without a restart, and how stale a config is allowed to get.
- Whether any of this changes when the limiter runs at the edge rather than in one region.
