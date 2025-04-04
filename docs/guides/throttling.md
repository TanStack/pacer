---
title: Throttling Guide
id: throttling
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications.

## Throttling Concept

Throttling ensures function executions are evenly spaced over time. While it may allow the same number of total executions as rate limiting, throttling creates a smoother execution pattern by enforcing consistent delays between calls. If you set a throttle of one execution per second, calls will be spaced out evenly regardless of how rapidly they are requested.

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:     ↓ ↓↓  ↓   ↓↓↓    ↓  ↓   ↓    ↓
Executed:   ✓  ✕  ✓    ✕     ✓   ✕   ✓   ✓
           [===|===|===|===|===|===|===|===]
           ^ Only one execution allowed per 3 ticks,
             regardless of how many calls are made
```

## Throttling in TanStack Pacer

TanStack Pacer's `throttle` function is a simple implementation that throttles the execution of a function. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling UI updates or other events.

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