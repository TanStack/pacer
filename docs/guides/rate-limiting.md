---
title: Rate Limiting Guide
id: rate-limiting
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications.

## Rate Limiting Concept

Rate Limiting is a technique that limits the rate at which a function can execute. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls. It is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                    Window 1                    |        Window 2        
Calls:     ↓   ↓   ↓   ↓   ↓                                  ↓   ↓
Executed:   ✓   ✓   ✓   ✕   ✕                                  ✓   ✓
           [=== 3 allowed ===][=== blocked until window ends ===][=== new window ===]
```

## Rate Limiting in TanStack Pacer

TanStack Pacer's `rateLimit` function is a simple implementation that limits the rate at which a function can execute. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls.

For example, if you set a limit of 5 calls per minute:
- The first 5 calls within the minute will execute immediately
- Any subsequent calls within that same minute window will be blocked
- Once the minute window resets, 5 more calls can be made

```ts
import { rateLimit } from '@tanstack/pacer'

// Rate limit API calls to 5 per minute
const rateLimitedApi = rateLimit(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000, // 1 minute in milliseconds
    onReject: ({ msUntilNextWindow }) => {
      console.log(`Rate limit exceeded. Try again in ${msUntilNextWindow}ms`)
    }
  }
)

// First 5 calls will execute immediately
rateLimitedApi('user-1') // ✅ Executes
rateLimitedApi('user-2') // ✅ Executes
rateLimitedApi('user-3') // ✅ Executes
rateLimitedApi('user-4') // ✅ Executes
rateLimitedApi('user-5') // ✅ Executes
rateLimitedApi('user-6') // ❌ Rejected until window resets
```

Rate Limiting is best suited for:
- Enforcing hard API rate limits (e.g., limiting users to 100 requests per hour)
- Managing resource constraints (e.g., database connections or external service calls)
- Scenarios where bursty behavior is acceptable
- Protection against DoS attacks or abuse

> [!TIP]
> You most likely don't want to use "rate limiting". Consider using [throttling](../guides/throttling) or [debouncing](../guides/debouncing) instead. 