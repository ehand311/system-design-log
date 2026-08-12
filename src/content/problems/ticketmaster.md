---
title: 'Design Ticketmaster'
summary: 'Why holding a database transaction open while a human picks a seat is the wrong instinct, and what replaces it.'
date: 2026-08-13
tags: ['contention', 'locking', 'bot-abuse']
draft: false
source:
  label: "Hello Interview's Ticketmaster breakdown"
  url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster'
---

I picked this one because the contention problem is close to work I've actually seen: a fixed,
scarce resource, a flood of demand arriving in the same second, and a meaningful share of that
demand automated.

## Requirements

**Functional**

- Browse and search events.
- View an event's seat map with current availability.
- Book one or more specific seats.

**Non-functional**

- Never double-sell a seat. This is the one hard constraint.
- Search should feel instant — a few hundred milliseconds.
- Survive a demand spike of millions of users hitting one event the moment tickets drop.
- Read-heavy overall, roughly 100:1, but the writes are the dangerous part.

## Scale

The traffic shape matters more than the totals here. Ticket sales aren't steady load; they're a
near-vertical spike against a *fixed* inventory. A venue has 20,000 seats and 10 million people
may want them. The system's job in that moment is mostly to say no, quickly and fairly.

## Approach

Three services, split because they scale differently: browsing/search (heavy read, tolerant of
staleness), and booking (low volume, zero tolerance for error).

The booking flow splits into two phases, and that split is the whole design:

1. **Reserve** — the user picks seats and gets a short hold, on the order of ten minutes.
2. **Purchase** — payment completes and the hold converts to a real booking.

The reservation lives in Redis with a TTL rather than in a database transaction. A user staring at
a seat map, deciding, entering a card number, is a human-length pause — the TTL releases the seat
automatically if they wander off, with no cleanup job.

The final purchase still goes through a database transaction with optimistic concurrency control.
Redis prevents most collisions; the database is what makes "never double-sell" actually true.

For the spike, a virtual waiting room sits *in front of* the booking page. Users are admitted in
order, and the booking service only accepts requests from users it has admitted. That converts an
uncontrolled stampede into a throttled stream.

## The part I got wrong

My first instinct was to hold a database transaction open for the duration of seat selection —
lock the row, let the user decide, commit on purchase. That's wrong in a way I'd have found the
hard way.

A transaction held open across a human decision is held open for *minutes*. With thousands of
concurrent users you exhaust the connection pool, and locks that live that long turn ordinary
contention into cascading timeouts. The database becomes the bottleneck precisely when it's most
needed.

The fix is to move the human-length wait out of the database entirely. Redis holds the intent; the
database only arbitrates the final, fast commit.

## Tradeoff worth arguing about

**How long should a hold last, and what happens when it expires mid-checkout?**

Ten minutes is generous for the user and expensive for everyone else — for a sold-out show, every
held seat is a seat nobody else can buy, and abandoned holds are pure loss. Shorten it and you
start expiring holds while people are legitimately entering payment details.

There's no clean answer. It's a conversion-versus-utilization tradeoff, and I'd expect the right
number to differ between a stadium tour and a local venue.

## Where I'd push, given my background

Most write-ups treat bots as an afterthought. For this problem they're a primary requirement.

A virtual waiting room is only fair if positions in it are hard to acquire in bulk — otherwise
it's a queue that scalpers enter ten thousand times and real fans enter once. The interesting
question isn't the queue data structure, it's what identity the queue position is bound to, and
how much friction you're willing to impose on legitimate users to make that binding meaningful.

I'd also want to know what the system does when it's *unsure* whether a request is automated.
Blocking a real fan out of a sold-out show is a different kind of failure than letting a scalper
through, and the system should be explicit about which error it prefers.

## What I'd look at next

- How search stays consistent with inventory that changes by the second.
- Whether the waiting room should live at the edge rather than in the application tier.
- What the seat map shows when availability is changing faster than it can be rendered.
