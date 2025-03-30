---
title: Rate Limiting Concepts
id: rate-limiting-concepts
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications.

## Rate Limiting

Rate Limiting allows a function to execute up to a specified limit within a time window. Once this limit is reached, all subsequent executions are blocked until the window resets. This is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

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
> You most likely don't want to use "rate limiting". Consider using [throttling](#throttling) or [debouncing](#debouncing) instead.

## Throttling

Throttling ensures function executions are evenly spaced over time. While it may allow the same number of total executions as rate limiting, throttling creates a smoother execution pattern by enforcing consistent delays between calls. If you set a throttle of one execution per second, calls will be spaced out evenly regardless of how rapidly they are requested.

```ts
import { throttle } from '@tanstack/pacer'

// Throttle UI updates to once every 200ms
const throttledUpdate = throttle(
  (value: number) => updateProgressBar(value),
  {
    wait: 200,
    leading: true,   // Execute immediately on first call
    trailing: true   // Ensure final value is rendered
  }
)

// In a rapid loop, only executes every 200ms
for (let i = 0; i < 100; i++) {
  throttledUpdate(i) // Many calls get skipped
}
```

Throttling is ideal for:
- UI updates that need consistent timing (e.g., progress indicators)
- Scroll or resize event handlers that shouldn't overwhelm the browser
- Any scenario where smooth, predictable execution timing is important
- Real-time data polling where consistent intervals are desired
- Resource-intensive operations that need steady pacing

## Debouncing

Debouncing waits for a pause in execution requests before allowing the function to run. It typically only executes the last request received during a burst of activity, making it the most conservative approach with the fewest total executions. Think of it like waiting for someone to finish typing before processing their input.

```ts
import { debounce } from '@tanstack/pacer'

// Debounce search input to wait for user to stop typing
const debouncedSearch = debounce(
  (searchTerm: string) => performSearch(searchTerm),
  {
    wait: 500,      // Wait 500ms after last keystroke
    leading: false, // Don't execute on first keystroke
    trailing: true  // Execute after typing pause
  }
)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

Key debouncing concepts:
- Wait time: How long to wait for inactivity before executing
- Leading/trailing execution: Whether to run on the first or last call
- Maximum wait time: Optional cap on how long to wait before forcing execution

Debouncing works best for:
- Search input fields where you want to wait for the user to finish typing
- Form validation that shouldn't run on every keystroke
- Window resize calculations that are expensive to compute
- API calls that should only happen after user activity settles
- Any scenario where you only care about the final value after rapid changes
- Saving draft content while editing

## When Not to Use Rate Limiting/Throttling/Debouncing

If you need every execution request to be processed without dropping any calls, these rate limiting concepts are not the right tools. Instead, consider using queues (sometimes known as schedulers or task poolers) which can process all requests at a controlled rate without losing any.
