---
title: Vanilla Debouncing Guide
id: debouncing
---

Debouncing delays a function until calls have stopped for a configured amount of time. Each new call restarts the timer. With the default settings, only the most recent call executes, using its arguments.

Use debouncing when intermediate calls can be discarded and the final value is what matters. Search inputs, form validation, autosave, and resize handling are common examples.

## How debouncing works

The timeline below shows calls arriving in bursts. Every call resets the timer. The final call in each burst executes after three ticks of inactivity.

```text
Debouncing (wait: 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️  ⬇️  ⬇️               ⬇️  ⬇️
Executed:     ❌  ❌  ❌  ❌  ❌     ❌  ❌  ❌  ⏳   ->   ✅     ❌  ⏳   ->   ✅
             [================================================================]
                                                       ^ Executes here after
                                                         3 ticks of no calls

             [Burst of calls]     [More calls]   [Wait]      [New burst]
             No execution         Resets timer   Execute     Reset and execute
```

Only the latest call in each burst executes. All earlier calls are discarded.

Debouncing is intentionally lossy. If every operation must run, use [queuing](./queuing.md) instead.

## When to use debouncing

Choose debouncing when:

- You want to wait until activity stops.
- Only the latest arguments matter.
- Repeating the operation for every event would waste work.
- A short delay is acceptable.

Choose another utility when:

- Work should run at a steady interval while activity continues. Use [throttling](./throttling.md).
- A fixed number of calls may run within a time window. Use [rate limiting](./rate-limiting.md).
- Every operation must eventually run. Use [queuing](./queuing.md).
- Several items should be processed together. Use [batching](./batching.md).
- You need to await a result, handle errors, retry, or abort in-flight work. Use [async debouncing](./async-debouncing.md).

## Using debouncing in TanStack Pacer

TanStack Pacer provides two core debouncing APIs:

- `debounce` returns a debounced function.
- `Debouncer` exposes the debounced function plus lifecycle methods and observable state.

### Convenience function

Use `debounce` when you only need to invoke the debounced function:

```ts
import { debounce } from '@tanstack/pacer'

const search = debounce(
  (query: string) => {
    updateSearchResults(query)
  },
  { wait: 500 },
)

search('t')
search('ta')
search('tanstack')

// After 500ms without another call:
// updateSearchResults('tanstack')
```

The returned function does not expose methods such as `cancel()` or `flush()`. Use the class API when you need that control.

### Class API

Use `Debouncer` when you need lifecycle methods, dynamic options, callbacks, or state:

```ts
import { Debouncer } from '@tanstack/pacer'

const searchDebouncer = new Debouncer(
  (query: string) => {
    updateSearchResults(query)
  },
  { wait: 500 },
)

searchDebouncer.maybeExecute('tanstack')

console.log(searchDebouncer.store.state.isPending) // true

// Execute the pending call now instead of waiting.
searchDebouncer.flush()
```

Both the function returned by `debounce` and `Debouncer.maybeExecute()` return `void`. Use `AsyncDebouncer` when the caller needs to await the wrapped function's result.

### Results and errors

The synchronous debouncer does not retain the wrapped function's return value or catch its errors. An error from a leading execution propagates from `maybeExecute()`. A trailing execution runs later from a timer, so its errors cannot be caught around the earlier `maybeExecute()` call.

Handle synchronous errors inside the wrapped function. Use [async debouncing](./async-debouncing.md) for Promise results and configurable async error handling.

## Execution timing

The `leading` and `trailing` options control which edge of the wait period may execute.

| `leading` | `trailing` | Behavior |
| --- | --- | --- |
| `false` | `true` | Wait for inactivity, then execute the most recent call. This is the default. |
| `true` | `false` | Execute the first call immediately. Later calls do not execute and restart the wait period. |
| `true` | `true` | Execute the first call immediately. If another call arrives during the wait period, execute the most recent call at the trailing edge. |
| `false` | `false` | Do not execute any calls. |

```ts
const debouncer = new Debouncer(saveDraft, {
  wait: 1000,
  leading: true,
  trailing: true,
})

debouncer.maybeExecute('first') // Executes immediately.
debouncer.maybeExecute('second')
debouncer.maybeExecute('latest') // Executes after 1 second of inactivity.
```

With both edges enabled, a single call executes only on the leading edge. A trailing execution occurs only when another call arrives during the wait period.

### No maximum wait

`Debouncer` does not provide a `maxWait` option. A continuous stream of calls can keep postponing a trailing execution indefinitely. Use [throttling](./throttling.md) when work must continue at a bounded interval while calls are still arriving.

## Controlling pending work

The class API distinguishes between executing, canceling, and resetting pending work.

### Flush

`flush()` immediately executes the pending trailing call with the most recent arguments. It does nothing when no trailing call is pending.

```ts
const debouncer = new Debouncer(saveDraft, { wait: 1000 })

debouncer.maybeExecute('draft')
debouncer.flush() // Executes saveDraft('draft') now.
```

### Cancel

`cancel()` clears the pending timeout without executing the function. It also allows a leading call to execute immediately the next time `maybeExecute()` is called.

```ts
debouncer.maybeExecute('discarded draft')
debouncer.cancel()
```

### Reset

`reset()` restores the debouncer's state counters and flags to their defaults. It does not clear an already scheduled timeout. Call `cancel()` first when you need to discard pending work and reset state.

```ts
debouncer.cancel()
debouncer.reset()
```

## Configuring behavior at runtime

Use `setOptions()` to change options after construction:

```ts
debouncer.setOptions({
  wait: 1000,
  leading: true,
  trailing: false,
})
```

A new `wait` value applies when the next call schedules a timeout. It does not reschedule a timeout that is already pending. Calling `maybeExecute()` again clears the old timeout and schedules a new one using the current options.

### Enabling and disabling

Set `enabled` to `false` to prevent execution. Disabling a debouncer through `setOptions()` also cancels its pending call.

```ts
const debouncer = new Debouncer(saveDraft, {
  wait: 500,
  enabled: false,
})

debouncer.maybeExecute('ignored')
debouncer.setOptions({ enabled: true })
debouncer.maybeExecute('saved')
```

The `enabled` and `wait` options may also be functions that receive the debouncer instance:

```ts
const debouncer = new Debouncer(saveDraft, {
  enabled: (debouncer) => debouncer.store.state.executionCount < 10,
  wait: (debouncer) =>
    debouncer.store.state.executionCount === 0 ? 300 : 500,
})
```

### Observing executions

Use `onExecute` for a side effect after the wrapped function runs. The callback receives the executed arguments followed by the debouncer instance.

```ts
const debouncer = new Debouncer(saveDraft, {
  wait: 500,
  onExecute: (args, debouncer) => {
    console.log('Saved arguments:', args)
    console.log('Execution count:', debouncer.store.state.executionCount)
  },
})
```

To share a type-checked configuration across instances, define it with `debouncerOptions()`.

## State

The class stores its state in a TanStack Store at `debouncer.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

The properties most commonly used in application code are:

- `isPending`: Whether a trailing execution is waiting.
- `executionCount`: How many times the wrapped function has executed.
- `lastArgs`: The arguments recorded by the most recent trailing-enabled call. Check `isPending` before treating them as pending work.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

```ts
const unsubscribe = debouncer.store.subscribe((state) => {
  console.log(state.isPending, state.executionCount)
})

unsubscribe()
```

See the [`Debouncer` API reference](../../../reference/classes/Debouncer.md) for the complete state and option types.
