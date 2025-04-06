---
title: Rate Limiting Guide
id: rate-limiting
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Rate Limiting concepts of TanStack Pacer.

## Rate Limiting Concept

Rate Limiting is a technique that limits the rate at which a function can execute over a specific time window. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls. It is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

### Rate Limiting Visualization

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2            
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                             ✅     ✅
             [=== 3 allowed ===][=== blocked until window ends ===][=== new window =======]
```

### When to Use Rate Limiting

Rate Limiting is particularly important when dealing with external services, API quotas, or resource-intensive operations where you need to prevent overload.

Common use cases include:
- Enforcing hard API rate limits (e.g., limiting users to 100 requests per hour)
- Managing resource constraints (e.g., database connections or external service calls)
- Scenarios where bursty behavior is acceptable
- Protection against DoS attacks or abuse
- Implementing fair usage policies in multi-tenant systems

### When Not to Use Rate Limiting

Rate Limiting is the most naive approach to controlling function execution frequency. It is the least flexible and most restrictive of the three techniques. Consider using [throttling](../guides/throttling) or [debouncing](../guides/debouncing) instead for more spaced out executions.

> [!TIP]
> You most likely don't want to use "rate limiting" for most use cases. Consider using [throttling](../guides/throttling) or [debouncing](../guides/debouncing) instead. 

Rate Limiting's "lossy" nature also means that some executions will be rejected and lost. This can be a problem if you need to ensure that all executions are always successful. Consider using [queueing](../guides/queueing) if you need to ensure that all executions are queued up to be executed, but with a throttled delay to slow down the rate of execution.

## Rate Limiting in TanStack Pacer

TanStack Pacer provides a few ways to implement rate limiting. There is the simple `rateLimit` function for basic usage, the `RateLimiter` class for more advanced control, and each framework adapter further builds convenient hooks and functions around the `RateLimiter` class.

### Basic Usage with `rateLimit`

The `rateLimit` function is the simplest way to add rate limiting to any function. It's perfect for most use cases where you just need to enforce a simple limit.

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

### Advanced Usage with `RateLimiter` Class

For more complex scenarios where you need additional control over the rate limiting behavior, you can use the `RateLimiter` class directly. This gives you access to additional methods and state information.

```ts
import { RateLimiter } from '@tanstack/pacer'

// Create a rate limiter instance
const limiter = new RateLimiter(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000,
    onReject: ({ msUntilNextWindow }) => {
      console.log(`Rate limit exceeded. Try again in ${msUntilNextWindow}ms`)
    }
  }
)

// Get information about current state
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.getExecutionCount()) // Total number of successful executions
console.log(limiter.getRejectionCount()) // Total number of rejected executions

// Attempt to execute (returns boolean indicating success)
limiter.maybeExecute('user-1')

// Update options dynamically
limiter.setOptions({ limit: 10 }) // Increase the limit

// Reset all counters and state
limiter.reset()
```

### Enabling/Disabling

The `RateLimiter` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the rate limiter at any time:

```ts
const limiter = new RateLimiter(fn, { 
  limit: 5, 
  window: 1000,
  enabled: false // Disable by default
})
limiter.setOptions({ enabled: true }) // Enable at any time
```

If you are using a framework adapter where the rate limiter options are reactive, you can set the `enabled` option to a conditional value to enable/disable the rate limiter on the fly:

```ts
const limiter = useRateLimiter(
  makeApiCall, 
  { 
    limit: 5,
    window: 1000,
    enabled: isUserPremium // Enable/disable based on user status IF using a framework adapter that supports reactive options
  }
)
```

However, if you are using the `rateLimit` function or the `RateLimiter` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `RateLimiter` class.

## Synchronous vs Asynchronous Rate Limiting

TanStack Pacer provides both synchronous and asynchronous rate limiting through the `RateLimiter` and `AsyncRateLimiter` classes respectively (and their corresponding `rateLimit` and `asyncRateLimit` functions). Understanding when to use each is important for proper rate limiting behavior.

### Synchronous Rate Limiting

Use the synchronous `RateLimiter` when:
- Your rate-limited function is synchronous (doesn't return a Promise)
- You don't need to wait for the function to complete before counting it as executed
- You want immediate feedback on whether the execution was allowed or rejected

```ts
import { rateLimit } from '@tanstack/pacer'

const rateLimited = rateLimit(
  (data: string) => processData(data),
  {
    limit: 5,
    window: 1000, // 1 second
  }
)

// Returns true if executed, false if rejected
const wasExecuted = rateLimited('some data')
```

### Asynchronous Rate Limiting

Use the `AsyncRateLimiter` when:
- Your rate-limited function returns a Promise
- You need to handle errors from the async function
- You want to ensure proper rate limiting even if the async function takes time to complete

```ts
import { asyncRateLimit } from '@tanstack/pacer'

const rateLimited = asyncRateLimit(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`)
    return response.json()
  },
  {
    limit: 5,
    window: 1000,
    onError: (error) => {
      console.error('API call failed:', error)
    }
  }
)

// Returns a Promise<boolean> - resolves to true if executed, false if rejected
const wasExecuted = await rateLimited('123')
```

The `AsyncRateLimiter` provides additional features specific to async functions:
- Error handling through the `onError` callback
- Proper async execution tracking
- Returns Promises that resolve to boolean values indicating execution success

For most use cases, the normal non-async `RateLimiter` can be sufficient, but when you need extra error handling, or you want to make sure that each execution finishes before the next one starts, then the async `AsyncRateLimiter` is for you.

### Framework Adapters

Each framework adapter further builds convenient hooks and functions around the `RateLimiter` class. Hooks like `useRateLimitedCallback`, `useRateLimitedState`, or `useRateLimitedValue` are small wrappers around the `RateLimiter` class that can cut down on the boilerplate needed in your own code for some common use cases.