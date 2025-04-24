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

Common use cases include:
- Search input fields where you want to wait for the user to finish typing
- Form validation that shouldn't run on every keystroke
- Window resize calculations that are expensive to compute
- Auto-saving drafts while editing content
- API calls that should only happen after user activity settles
- Any scenario where you only care about the final value after rapid changes

### When Not to Use Debouncing

Debouncing might not be the best choice when:
- You need guaranteed execution over a specific time period (use [throttling](../guides/throttling) instead)
- You can't afford to miss any executions (use [queueing](../guides/queueing) instead)

## Debouncing in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous debouncing through the `Debouncer` and `AsyncDebouncer` classes respectively (and their corresponding `debounce` and `asyncDebounce` functions).

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

// Get information about current state
console.log(searchDebouncer.getExecutionCount()) // Number of successful executions
console.log(searchDebouncer.getIsPending()) // Whether a call is pending

// Update options dynamically
searchDebouncer.setOptions({ wait: 1000 }) // Increase wait time

// Cancel pending execution
searchDebouncer.cancel()
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

The TanStack Pacer Debouncer does NOT have a `maxWait` option like other debouncing libraries. If you need to let executions run over a more spread out period of time, consider using the [throttling](../guides/throttling) technique instead.

### Enabling/Disabling

The `Debouncer` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the debouncer at any time:

```ts
const debouncer = new Debouncer(fn, { wait: 500, enabled: false }) // Disable by default
debouncer.setOptions({ enabled: true }) // Enable at any time
```

If you are using a framework adapter where the debouncer options are reactive, you can set the `enabled` option to a conditional value to enable/disable the debouncer on the fly:

```ts
// React example
const debouncer = useDebouncer(
  setSearch, 
  { wait: 500, enabled: searchInput.value.length > 3 } // Enable/disable based on input length IF using a framework adapter that supports reactive options
)
```

However, if you are using the `debounce` function or the `Debouncer` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `Debouncer` class.

```ts
// Solid example
const debouncer = new Debouncer(fn, { wait: 500, enabled: false }) // Disable by default
createEffect(() => {
  debouncer.setOptions({ enabled: search().length > 3 }) // Enable/disable based on input length
})
```

### Callback Options

Both the synchronous and asynchronous debouncers support callback options to handle different aspects of the debouncing lifecycle:

#### Synchronous Debouncer Callbacks

The synchronous `Debouncer` supports the following callback:

```ts
const debouncer = new Debouncer(fn, {
  wait: 500,
  onExecute: (debouncer) => {
    // Called after each successful execution
    console.log('Function executed', debouncer.getExecutionCount())
  }
})
```

The `onExecute` callback is called after each successful execution of the debounced function, making it useful for tracking executions, updating UI state, or performing cleanup operations.

#### Asynchronous Debouncer Callbacks

The asynchronous `AsyncDebouncer` supports additional callbacks for error handling:

```ts
const asyncDebouncer = new AsyncDebouncer(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onExecute: (debouncer) => {
    // Called after each successful execution
    console.log('Async function executed', debouncer.getExecutionCount())
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

The `onExecute` callback works the same way as in the synchronous debouncer, while the `onError` callback allows you to handle errors gracefully without breaking the debouncing chain. These callbacks are particularly useful for tracking execution counts, updating UI state, handling errors, performing cleanup operations, and logging execution metrics.

### Asynchronous Debouncing

For async functions or when you need error handling, use the `AsyncDebouncer` or `asyncDebounce`:

```ts
import { asyncDebounce } from '@tanstack/pacer'

const debouncedSearch = asyncDebounce(
  async (searchTerm: string) => {
    const results = await fetchSearchResults(searchTerm)
    updateUI(results)
  },
  {
    wait: 500,
    onError: (error) => {
      console.error('Search failed:', error)
    }
  }
)

// Will only make one API call after typing stops
searchInput.addEventListener('input', async (e) => {
  await debouncedSearch(e.target.value)
})
```

The async version provides Promise-based execution tracking, error handling through the `onError` callback, proper cleanup of pending async operations, and an awaitable `maybeExecute` method.

### Framework Adapters

Each framework adapter provides hooks that build on top of the core debouncing functionality to integrate with the framework's state management system. Hooks like `createDebouncer`, `useDebouncedCallback`, `useDebouncedState`, or `useDebouncedValue` are available for each framework.

Here are some examples:

#### React

```tsx
import { useDebouncer, useDebouncedCallback, useDebouncedValue } from '@tanstack/react-pacer'

// Low-level hook for full control
const debouncer = useDebouncer(
  (value: string) => saveToDatabase(value),
  { wait: 500 }
)

// Simple callback hook for basic use cases
const handleSearch = useDebouncedCallback(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
)

// State-based hook for reactive state management
const [instantState, setInstantState] = useState('')
const [debouncedState, setDebouncedState] = useDebouncedValue(
  instantState, // Value to debounce
  { wait: 500 }
)
```

#### Solid

```tsx
import { createDebouncer, createDebouncedSignal } from '@tanstack/solid-pacer'

// Low-level hook for full control
const debouncer = createDebouncer(
  (value: string) => saveToDatabase(value),
  { wait: 500 }
)

// Signal-based hook for state management
const [searchTerm, setSearchTerm, debouncer] = createDebouncedSignal('', {
  wait: 500,
  onExecute: (debouncer) => {
    console.log('Total executions:', debouncer.getExecutionCount())
  }
})
```
