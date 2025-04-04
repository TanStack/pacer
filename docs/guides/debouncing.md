---
title: Debouncing Guide
id: debouncing
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications.

## Debouncing Concept

Debouncing is a technique that delays the execution of a function until a specified period of inactivity has occurred. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling user input events like keystrokes or mouse movements.

```text
Debouncing (wait: 3 ticks)
Timeline: [1 second per tick]
Calls:     ↓↓↓  ↓↓    ↓↓↓↓      ↓        ↓↓↓
Executed:    ✕   ✕      ✕        ✓         ✕    ✓
           [===============================]
                                    ^ Executes here after
                                      3 ticks of no calls

           [Burst of calls]   [Wait.....] [Execute]
                             No execution   After the
                             during burst   waiting period
```

## Debouncing in TanStack Pacer

TanStack Pacer's `debounce` function is a simple implementation that delays the execution of a function until a specified period of inactivity has occurred. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling user input events like keystrokes or mouse movements.

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

If you need every execution request to be processed without dropping any calls, these rate limiting concepts are not the right tools. Instead, consider using [queues](./queueing) (sometimes known as schedulers or task poolers) which can process all requests at a controlled rate without losing any. 