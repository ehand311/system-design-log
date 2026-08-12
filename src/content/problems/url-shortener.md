---
title: 'Design a URL shortener'
summary: 'Where the read path actually breaks, and why generating short codes was the least interesting part of the problem.'
date: 2026-08-12
tags: ['caching', 'databases', 'read-heavy']
draft: false
---

I started here because it's the canonical warm-up problem, and because I assumed the hard part
was generating the short codes. It isn't. The code generation is a solved detail; the design
pressure is almost entirely on the read path.

## Requirements

**Functional**

- Given a long URL, return a short one.
- Given a short URL, redirect to the original.
- Links don't expire by default, but should support an optional TTL.

**Non-functional**

- Redirects need to be fast — this sits in front of a user waiting on a page load, so
  low latency matters more than anything else.
- Heavily read-skewed. I assumed roughly 100:1 reads to writes.
- Availability over consistency on reads. A brief window where a brand-new link 404s is
  survivable; the redirect service being down is not.

## Estimates

I sized it at 100M new links per month to force the numbers to mean something.

| Metric | Value |
| --- | --- |
| Writes | ~40/sec |
| Reads (100:1) | ~4,000/sec |
| Storage per record | ~500 bytes |
| Storage per year | ~600 GB |

Two things fell out of this immediately. First, 600 GB/year is not a lot — this fits on a single
well-provisioned database for years, so sharding is not a day-one concern. Second, 4,000
reads/sec against a database doing single-key lookups is the entire problem.

## Approach

The write path is boring, which is the correct outcome:

1. Take the long URL, generate a unique ID, base62-encode it into a ~7 character string.
2. Store the mapping.
3. Return the short URL.

For ID generation I went with a pre-allocated counter range per application server rather than
hashing the URL. Hashing means dealing with collisions on every write; handing each server a
block of IDs to burn through means no coordination in the hot path, and the only cost is gaps
in the sequence when a server dies. Gaps don't matter here.

The read path is where the design actually lives:

1. Request hits the edge.
2. Check cache. On hit, redirect immediately.
3. On miss, read from the database, populate the cache, redirect.

With a 100:1 read ratio and a strong popularity skew — a small fraction of links get most of the
traffic — the cache absorbs nearly all of it. The database ends up serving cold-link misses and
writes, which is a much smaller number than 4,000/sec.

## Tradeoffs

**301 vs. 302 redirect.** This is the decision I initially got wrong. A 301 (permanent) lets the
browser cache the redirect, which cuts load dramatically — but it also means you never see the
request again, so you lose click analytics, and you can't ever change or revoke where that link
points. A 302 keeps every request flowing through you. I'd default to 302 and accept the traffic,
because for a link shortener the analytics and the ability to kill a malicious link are usually
the product, not a nice-to-have.

**Cache invalidation on TTL'd links.** Optional expiry sounds cheap until you realize an expired
link can still be sitting in cache. Setting the cache TTL to match the link TTL handles the simple
case, but early expiry still needs an explicit invalidation path.

**Sharding.** I designed for it but wouldn't build it initially. Given the storage math, this is
years of runway on a single primary with read replicas. Sharding by short code prefix is the
obvious eventual move since every lookup is already a single-key read.

## What I'd do differently

My first pass jumped straight to a sharded database because that's what "design a scalable system"
sounded like it wanted. Doing the storage estimate first would have told me that was premature by
several years. The estimation step isn't ceremony — it's what tells you which parts of the problem
are real.

I also spent too long on the encoding scheme relative to how little it mattered. Base62 versus
base64, 7 characters versus 8 — none of it changed the shape of the system. The read path did.
