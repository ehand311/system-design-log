---
title: 'From AI prototype to production system: Family Travel Studio'
summary: 'What changes when a personal AI travel-planning app has to handle real users, real cost, and real failure modes.'
date: 2026-08-13
tags: ['ai', 'queues', 'caching', 'security', 'reliability']
problemType: 'Product case study'
constraint: 'Expensive AI workflow'
scale: 'Thousands of families planning trips concurrently'
lesson: 'Long-running model work should become a job with quotas, retries, validation, and persisted results instead of a synchronous web request.'
diagram:
  - Astro client
  - Cloudflare API Worker
  - Auth and quota check
  - Generation job queue
  - Category AI workers
  - Validate and persist
draft: false
---

I built Family Travel Studio as a practical AI app for planning trips with young children. A user
enters a destination, dates, home airport, kids, budget, trip pace, and family priorities; the
system generates lodging, flight, restaurant, and activity options; the user selects what they
like; then the app turns those choices into an itinerary.

The interesting design question is not how to render the board. It is what changes when a useful
prototype becomes a product with real users, real cost, and real failure modes.

This write-up is a proposed production design, not a claim that every component exists in the
current app.

## Requirements

**Functional**

- Accept a family trip request: destination, dates, origin airport, family composition, budget,
  pace, priorities, and notes.
- Generate travel candidates across lodging, flights, restaurants, and activities.
- Let users select options into a trip board.
- Build a day-by-day itinerary from selected options, arrival and departure timing, nap windows,
  dinner timing, pace, and notes.
- Save and reload trip boards for authenticated users.

**Non-functional**

- Keep ordinary UI and saved-trip flows responsive even when AI generation is slow.
- Avoid letting retries, double-clicks, or anonymous demo users burn unlimited model spend.
- Keep one user's trip data isolated from another user's data.
- Degrade by category: if flights fail, lodging and activities should still be useful.
- Treat generated output as untrusted until it passes schema validation.

## Scale

The first instinct is to ask whether Supabase or Postgres can handle a million registered users.
That is not the scaling variable I would start with.

The better questions are:

| Metric | Why it matters |
| --- | --- |
| Peak generation requests | Drives queue depth, AI provider rate limits, and perceived latency |
| Generations per user per day | Drives model cost more than registered-user count |
| Average tokens per request | Turns product usage directly into spend |
| Saved trips per user | Drives storage, but likely later than AI throughput |
| Cache hit rate | Decides whether repeated destination work gets cheaper over time |

Even with 100,000 daily active users, two trip generations per user per day is about 200,000
generations per day. The database can probably survive that shape before the AI layer does. The
hard part is provider throughput, cost, and failure isolation.

## Approach

At low volume, the simple architecture is the right architecture:

```text
Browser
  -> Astro UI
  -> Cloudflare Worker/API
  -> OpenAI for generation
  -> Supabase for auth and persisted data
```

There is no reason to turn that into twelve services just to sound scalable. I would keep it as a
modular serverless application until one component has meaningfully different scaling or
reliability characteristics.

The first component I would separate is AI generation.

A naive flow looks like this:

```text
POST /generate-trip
  -> call model
  -> wait
  -> parse response
  -> return options
```

That works for a personal app. It breaks when thousands of users hit the same expensive,
long-running path. The request is now coupled to OpenAI latency, provider rate limits, request
timeouts, retries, and model cost.

The production version should accept work quickly and execute it separately:

```text
POST /trip-generation
  -> validate request
  -> check user quota
  -> create generation_job
  -> enqueue work
  -> return job_id

AI worker
  -> run lodging, flights, restaurants, and activities
  -> validate structured output
  -> persist candidates
  -> mark job complete
```

The UI can poll `GET /jobs/:id`, or later subscribe to job completion. The important shift is that
the browser request does not have to stay open while the model thinks.

## Data model

I would stay with relational storage. The core entities have clear ownership and relationships:

```text
User
  -> Trip
      -> TripRequest
      -> CandidateOption
      -> TripSelection
      -> Itinerary
      -> GenerationJob
```

The key design choice is that AI output becomes structured application data. I would not save one
large model paragraph and treat that as the database.

A candidate option should look more like:

```text
option_id
trip_id
category
name
estimated_price
source_url
family_fit_notes
structured_metadata
```

That gives the app something it can filter, select, retry, audit, and rebuild into an itinerary.

## Caching and idempotency

AI calls are expensive, but not everything in travel has the same freshness requirement.

I would cache slow-changing destination knowledge more aggressively:

- family-friendly neighborhoods
- typical logistics
- attraction candidates
- kid-friendly restaurant patterns
- common itinerary constraints

I would be much more careful with fast-changing facts:

- flight prices
- lodging availability
- operating hours
- closures
- restaurant availability

The useful cache is probably not just "the whole trip request." Exact matches across destination,
dates, airport, family size, budget, and preferences may be rare. Destination-level fragments are
more reusable.

I would also make generation idempotent. If a user clicks Generate three times, that should create
one job, not three model calls. The API should key active work by something like:

```text
user_id + normalized_request_hash
```

or by a client-provided idempotency key.

## The part I got wrong

When I built the first version, I naturally thought about AI generation like a normal API request:

```text
request -> model -> response
```

That is reasonable for a prototype. The mistake is carrying that model forward after AI becomes a
real workload.

Model calls are slow, expensive, rate-limited, and dependent on an external provider. Treating them
like ordinary reads couples the user experience directly to every one of those failure modes.

The architecture I would use at scale is:

```text
request -> job -> queue -> AI execution -> validated result
```

The lesson is not "queues are scalable." The lesson is that long-running expensive work has
different system characteristics from ordinary web requests.

## Tradeoff worth arguing about

**How much should the app trust the model versus external structured travel data?**

The fastest architecture is:

```text
user request -> LLM -> travel suggestions
```

But language models are not authoritative sources for current prices, availability, schedules,
hours, or closures.

The more reliable architecture is:

```text
travel APIs/search providers
  -> structured candidates
  -> LLM ranking and synthesis
  -> family-friendly explanation
```

That moves the model into a better role: personalization and reasoning, not source of truth.

The cost is real. Now the product has provider contracts, rate limits, data normalization,
integration failures, and another layer of observability. I would not pay that cost until the
product needs current factual accuracy badly enough to justify it.

## Where I'd push, given my background

The security question I care about most is not just authentication. It is what happens when AI
gains agency.

Today the app recommends and organizes travel. A future version might book restaurants, reserve
hotels, purchase flights, send itinerary messages, or change reservations. At that point prompt
injection or a compromised upstream page is not just capable of producing a bad recommendation. It
may cause an external action.

I would want every tool invocation to have:

- explicit authorization
- narrow permissions
- schema validation
- audit logging
- transaction limits
- human confirmation for consequential actions

The boundary between "AI suggests" and "AI acts" matters more than the model choice.

## What I'd look at next

- How to split generation by category so one failed provider does not fail the whole board.
- What the quota model should be for anonymous demo users, authenticated users, and owner access.
- Which travel facts need authoritative providers, and which can remain model-assisted.
- What observability should exist per generation: queue wait, model latency, token cost, retries,
  schema failures, and user rejection signals.
