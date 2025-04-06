---
title: Throttling Guide
id: throttling
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Throttling concepts of TanStack Pacer.

## Throttling Concept

Throttling ensures function executions are evenly spaced over time. Unlike rate limiting which allows bursts of executions up to a limit, or debouncing which waits for activity to stop, throttling creates a smoother execution pattern by enforcing consistent delays between calls. If you set a throttle of one execution per second, calls will be spaced out evenly regardless of how rapidly they are requested.

### Throttling Visualization

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️           ⬇️  ⬇️  ⬇️  ⬇️             ⬇️
Executed:     ✅  ❌  ⏳  ->   ✅  ❌  ❌  ❌  ✅             ✅ 
             [=================================================================]
             ^ Only one execution allowed per 3 ticks,
               regardless of how many calls are made

             [First burst]    [More calls]              [Spaced calls]
             Execute first    Execute after             Execute each time
             then throttle    wait period               wait period passes
```

### When to Use Throttling

Throttling is particularly effective when you need consistent, predictable execution timing. This makes it ideal for handling frequent events or updates where you want smooth, controlled behavior.

Common use cases include:
- UI updates that need consistent timing (e.g., progress indicators)
- Scroll or resize event handlers that shouldn't overwhelm the browser
- Real-time data polling where consistent intervals are desired
- Resource-intensive operations that need steady pacing
- Game loop updates or animation frame handling
- Live search suggestions as users type

### When Not to Use Throttling

Throttling might not be the best choice when:
- You want to wait for activity to stop (use [debouncing](../guides/debouncing) instead)
- You can't afford to miss any executions (use [queueing](../guides/queueing) instead)

> [!TIP]
> Throttling is often the best choice when you need smooth, consistent execution timing. It provides a more predictable execution pattern than rate limiting and more immediate feedback than debouncing.

## Throttling in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous throttling through the `Throttler` and `AsyncThrottler` classes respectively (and their corresponding `throttle` and `asyncThrottle` functions).

### Basic Usage with `throttle`

The `throttle` function is the simplest way to add throttling to any function:

```ts
import { throttle } from '@tanstack/pacer'

// Throttle UI updates to once every 200ms
const throttledUpdate = throttle(
  (value: number) => updateProgressBar(value),
  {
    wait: 200,
  }
)

// In a rapid loop, only executes every 200ms
for (let i = 0; i < 100; i++) {
  throttledUpdate(i) // Many calls get throttled
}
```

### Advanced Usage with `Throttler` Class

For more control over the throttling behavior, you can use the `Throttler` class directly:

```ts
import { Throttler } from '@tanstack/pacer'

const updateThrottler = new Throttler(
  (value: number) => updateProgressBar(value),
  { wait: 200 }
)

// Get information about execution state
console.log(updateThrottler.getExecutionCount()) // Number of successful executions
console.log(updateThrottler.getLastExecutionTime()) // Timestamp of last execution

// Cancel any pending execution
updateThrottler.cancel()
```

### Leading and Trailing Executions

The synchronous throttler supports both leading and trailing edge executions:

```ts
const throttledFn = throttle(fn, {
  wait: 200,
  leading: true,   // Execute on first call (default)
  trailing: true,  // Execute after wait period (default)
})
```

- `leading: true` (default) - Execute immediately on first call
- `leading: false` - Skip first call, wait for trailing execution
- `trailing: true` (default) - Execute last call after wait period
- `trailing: false` - Skip last call if within wait period

Common patterns:
- `{ leading: true, trailing: true }` - Default, most responsive
- `{ leading: false, trailing: true }` - Delay all executions
- `{ leading: true, trailing: false }` - Skip queued executions

### Enabling/Disabling

The `Throttler` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the throttler at any time:

```ts
const throttler = new Throttler(fn, { wait: 200, enabled: false }) // Disable by default
throttler.setOptions({ enabled: true }) // Enable at any time
```

If you are using a framework adapter where the throttler options are reactive, you can set the `enabled` option to a conditional value to enable/disable the throttler on the fly:

```ts
const throttler = useThrottler(
  updateUI, 
  { wait: 200, enabled: isScrolling } // Enable/disable based on scroll state IF using a framework adapter that supports reactive options
)
```

However, if you are using the `throttle` function or the `Throttler` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `Throttler` class.

### Asynchronous Throttling

For async functions or when you need error handling, use the `AsyncThrottler` or `asyncThrottle`:

```ts
import { asyncThrottle } from '@tanstack/pacer'

const throttledFetch = asyncThrottle(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`)
    return response.json()
  },
  {
    wait: 1000,
    onError: (error) => {
      console.error('API call failed:', error)
    }
  }
)

// Will only make one API call per second
await throttledFetch('123')
```

For most use cases, the normal non-async `Throttler` is sufficient, but when you need error handling or want to properly handle Promise-based operations, then the async `AsyncThrottler` is for you.

The async version provides:
- Promise-based execution tracking
- Error handling through `onError` callback
- Proper cleanup of pending async operations
- Awaitable `maybeExecute` method

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the throttler classes. Hooks like `useThrottledCallback`, `useThrottledState`, or `useThrottledValue` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases. 