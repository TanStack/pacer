---
title: Debouncing Guide
id: debouncing
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Debouncing concepts of TanStack Pacer.

## Debouncing Concept

Debouncing is a technique that delays the execution of a function until a specified period of inactivity has occurred. Unlike rate limiting which allows bursts of executions up to a limit, or throttling which ensures evenly spaced executions, debouncing collapses multiple rapid function calls into a single execution that only happens after the calls stop. This makes debouncing ideal for handling bursts of events where you only care about the final state after the activity settles.

### Debouncing Visualization

```text
Debouncing (wait: 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️  ⬇️  ⬇️               ⬇️  ⬇️
Executed:     ❌  ❌  ❌  ❌  ❌     ❌  ❌  ❌  ⏳   ->   ✅     ❌  ⏳   ->    ✅
             [=================================================================]
                                                        ^ Executes here after
                                                         3 ticks of no calls

             [Burst of calls]     [More calls]   [Wait]      [New burst]
             No execution         Resets timer    [Delayed Execute]  [Wait] [Delayed Execute]
```

### When to Use Debouncing

Debouncing is particularly effective when you want to wait for a "pause" in activity before taking action. This makes it ideal for handling user input or other rapidly-firing events where you only care about the final state.

### When Not to Use Debouncing

Debouncing might not be the best choice when:
- You need guaranteed execution over a specific time period (use [throttling](../throttling.md) instead)
- You can't afford to miss any executions (use [queuing](../queuing.md) instead)

## Debouncing in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous debouncing. This guide covers the synchronous `Debouncer` class and `debounce` function. For async debouncing, see the [Async Debouncing Guide](../async-debouncing.md).

### Basic Usage with `debounce`

The `debounce` function is the simplest way to add debouncing to any function:

```ts
import { debounce } from '@tanstack/pacer'

// Debounce search input to wait for user to stop typing
const debouncedSearch = debounce(
  (searchTerm: string) => performSearch(searchTerm),
  {
    wait: 500, // Wait 500ms after last keystroke
  }
)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

### Advanced Usage with `Debouncer` Class

For more control over the debouncing behavior, you can use the `Debouncer` class directly:

```ts
import { Debouncer } from '@tanstack/pacer'

const searchDebouncer = new Debouncer(
  (searchTerm: string) => performSearch(searchTerm),
  { wait: 500 }
)

// Access current state via TanStack Store
console.log(searchDebouncer.store.state.executionCount) // Number of successful executions
console.log(searchDebouncer.store.state.isPending) // Whether a call is pending
console.log(searchDebouncer.store.state.status) // Current execution status

// Update options dynamically
searchDebouncer.setOptions({ wait: 1000 }) // Increase wait time

// Cancel pending execution
searchDebouncer.cancel()

// Flush pending execution immediately
searchDebouncer.flush()
```

### Leading and Trailing Executions

The synchronous debouncer supports both leading and trailing edge executions:

```ts
const debouncedFn = debounce(fn, {
  wait: 500,
  leading: true,   // Execute on first call
  trailing: true,  // Execute after wait period
})
```

- `leading: true` - Function executes immediately on first call
- `leading: false` (default) - First call starts the wait timer
- `trailing: true` (default) - Function executes after wait period
- `trailing: false` - No execution after wait period

Common patterns:
- `{ leading: false, trailing: true }` - Default, execute after wait
- `{ leading: true, trailing: false }` - Execute immediately, ignore subsequent calls
- `{ leading: true, trailing: true }` - Execute on both first call and after wait

### Max Wait Time

The TanStack Pacer Debouncer purposely does NOT have a `maxWait` option like other debouncing libraries. If you need to let executions run over a more spread out period of time, consider using the [throttling](../throttling.md) technique instead.

### Enabling/Disabling

The `Debouncer` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the debouncer at any time:

```ts
const debouncer = new Debouncer(fn, { wait: 500, enabled: false }) // Disable by default
debouncer.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

If you are using a framework adapter where the debouncer options are reactive, you can set the `enabled` option to a conditional value to enable/disable the debouncer on the fly:

```ts
// React example
const debouncer = useDebouncer(
  setSearch, 
  { wait: 500, enabled: searchInput.value.length > 3 } // Enable/disable based on input length IF using a framework adapter that supports reactive options
)
```

### Dynamic Options

Several options in the Debouncer support dynamic values through callback functions that receive the debouncer instance:

```ts
const debouncer = new Debouncer(fn, {
  // Dynamic wait time based on execution count
  wait: (debouncer) => {
    return debouncer.store.state.executionCount * 100 // Increase wait time with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (debouncer) => {
    return debouncer.store.state.executionCount < 10 // Disable after 10 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated debouncing behavior that adapts to runtime conditions.

### Callback Options

The synchronous `Debouncer` supports the following callback:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  onExecute: (debouncer) => {
    // Called after each successful execution
    console.log('Function executed', debouncer.store.state.executionCount)
  }
})
```

The `onExecute` callback is called after each successful execution of the debounced function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

## State Management

The `Debouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state and statistics.

### Accessing State

When using the `Debouncer` class directly, access state via the `store.state` property:

```ts
const debouncer = new Debouncer(fn, { wait: 500 })

// Access current state
console.log(debouncer.store.state.isPending)
```

### Framework Adapters

When using framework adapters like React or Solid, the state is exposed directly as a reactive property:

```ts
// React example
const debouncer = useDebouncer(fn, { wait: 500 })

// Access state directly (reactive)
console.log(debouncer.state.executionCount) // Reactive value
console.log(debouncer.state.isPending) // Reactive value
```

### Initial State

You can provide initial state values when creating a debouncer:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  initialState: {
    executionCount: 5, // Start with 5 executions
    canLeadingExecute: false, // Start with leading execution disabled
  }
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const debouncer = new Debouncer(fn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = debouncer.store.subscribe((state) => {
  console.log('Execution count:', state.executionCount)
  console.log('Is pending:', state.isPending)
})

// Unsubscribe when done
unsubscribe()
```

### Available State Properties

The `DebouncerState` includes:

- `executionCount`: Number of completed function executions
- `isPending`: Whether the debouncer is waiting for timeout to trigger execution
- `status`: Current execution status ('idle' | 'pending')
- `canLeadingExecute`: Whether leading edge execution is allowed
- `lastArgs`: Arguments from the most recent call to `maybeExecute`

### Flushing Pending Executions

The debouncer supports flushing pending executions to trigger them immediately:

```ts
const debouncer = new Debouncer(fn, { wait: 1000 })

debouncer.maybeExecute('some-arg')
console.log(debouncer.store.state.isPending) // true

// Flush immediately instead of waiting
debouncer.flush()
console.log(debouncer.store.state.isPending) // false
```

---

For asynchronous debouncing (e.g., API calls, async operations), see the [Async Debouncing Guide](../async-debouncing.md).