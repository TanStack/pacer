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

### When Not to Use Throttling

Throttling might not be the best choice when:
- You want to wait for activity to stop (use [debouncing](../debouncing.md) instead)
- You can't afford to miss any executions (use [queuing](../queuing.md) instead)

> [!TIP]
> Throttling is often the best choice when you need smooth, consistent execution timing. It provides a more predictable execution pattern than rate limiting and more immediate feedback than debouncing.

## Throttling in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous throttling. This guide covers the synchronous `Throttler` class and `throttle` function. For async throttling, see the [Async Throttling Guide](../async-throttling.md).

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

// Access current state via TanStack Store
console.log(updateThrottler.store.state.executionCount) // Number of successful executions
console.log(updateThrottler.store.state.lastExecutionTime) // Timestamp of last execution
console.log(updateThrottler.store.state.isPending) // Whether execution is pending
console.log(updateThrottler.store.state.status) // Current execution status

// Cancel any pending execution
updateThrottler.cancel()

// Flush pending execution immediately
updateThrottler.flush()
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

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

If you are using a framework adapter where the throttler options are reactive, you can set the `enabled` option to a conditional value to enable/disable the throttler on the fly. However, if you are using the `throttle` function or the `Throttler` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `Throttler` class.

### Dynamic Options

Several options in the Throttler support dynamic values through callback functions that receive the throttler instance:

```ts
const throttler = new Throttler(fn, {
  // Dynamic wait time based on execution count
  wait: (throttler) => {
    return throttler.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (throttler) => {
    return throttler.store.state.executionCount < 50 // Disable after 50 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated throttling behavior that adapts to runtime conditions.

### Callback Options

The synchronous `Throttler` supports the following callback:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  onExecute: (throttler) => {
    // Called after each successful execution
    console.log('Function executed', throttler.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the throttled function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

## State Management

The `Throttler` class uses TanStack Store for reactive state management, providing real-time access to execution state and timing information.

### Accessing State

When using the `Throttler` class directly, access state via the `store.state` property:

```ts
const throttler = new Throttler(fn, { wait: 200 })

// Access current state
console.log(throttler.store.state.isPending)
```

### Framework Adapters

When using framework adapters like React or Solid, the state is exposed directly as a reactive property:

```ts
// React example
const throttler = useThrottler(fn, { wait: 200 })

// Access state directly (reactive)
console.log(throttler.state.executionCount) // Reactive value
console.log(throttler.state.isPending) // Reactive value
```

### Initial State

You can provide initial state values when creating a throttler:

```ts
const throttler = new Throttler(fn, {
  wait: 200,
  initialState: {
    executionCount: 10, // Start with 10 executions
    lastExecutionTime: Date.now() - 1000, // Set last execution to 1 second ago
  }
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const throttler = new Throttler(fn, { wait: 200 })

// Subscribe to state changes
const unsubscribe = throttler.store.subscribe((state) => {
  console.log('Execution count:', state.executionCount)
  console.log('Last execution time:', state.lastExecutionTime)
  console.log('Is pending:', state.isPending)
})

// Unsubscribe when done
unsubscribe()
```

### Available State Properties

The `ThrottlerState` includes:

- `executionCount`: Number of completed function executions
- `lastExecutionTime`: Timestamp of the last function execution (in milliseconds)
- `nextExecutionTime`: Timestamp when the next execution can occur (in milliseconds)
- `isPending`: Whether the throttler is waiting for timeout to trigger execution
- `status`: Current execution status ('idle' | 'pending')
- `lastArgs`: Arguments from the most recent call to `maybeExecute`

### Flushing Pending Executions

The throttler supports flushing pending executions to trigger them immediately:

```ts
const throttler = new Throttler(fn, { wait: 1000 })

throttler.maybeExecute('some-arg')
console.log(throttler.store.state.isPending) // true

// Flush immediately instead of waiting
throttler.flush()
console.log(throttler.store.state.isPending) // false
```

---

For asynchronous throttling (e.g., API calls, async operations), see the [Async Throttling Guide](../async-throttling.md). 