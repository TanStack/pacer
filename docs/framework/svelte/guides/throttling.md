---
title: Svelte Throttling Guide
id: throttling
---

Throttling limits how often a function can execute while calls continue to arrive. Unlike debouncing, throttling does not wait for activity to stop. It creates a bounded execution interval that works well for continuous events and updates.

With the default settings, the first call executes immediately. Calls received during the wait period are consolidated into one trailing execution that uses the latest arguments.

## How throttling works

The timeline below shows a throttler that allows one execution every three ticks:

```text
Throttling (one execution per 3 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️           ⬇️  ⬇️  ⬇️  ⬇️             ⬇️
Executed:     ✅  ❌  ⏳  ->   ✅  ❌  ❌  ❌  ✅             ✅
             [================================================================]
             ^ At most one execution per interval

             [First burst]    [More calls]              [Spaced calls]
             Execute first    Keep latest trailing      Execute when allowed
```

Calls may be discarded, but execution continues at a predictable interval while activity is ongoing.

## When to use throttling

Choose throttling when:

- Work should continue while events are arriving.
- Executions should be spaced by a minimum interval.
- Intermediate calls may be discarded.
- Immediate feedback from the first call is useful.

Choose another utility when:

- Work should wait until activity stops. Use [debouncing](./debouncing.md).
- A specific number of calls may run within a window. Use [rate limiting](./rate-limiting.md).
- Every operation must eventually run. Use [queuing](./queuing.md).
- Several items should run together. Use [batching](./batching.md).
- You need Promise results, retries, or abort support. Use [async throttling](./async-throttling.md).

## Choose an API

- `createThrottledSignal` or `createThrottledValue` for throttled Svelte state
- `createThrottler` for lifecycle methods and selected state

Use instance methods for event handlers, and state or value helpers for rate-controlled UI state.

## Svelte example

Create the utility during component initialization. Destroying the component runs its cleanup. The example imports application operations from `./api`.

```svelte
<script lang="ts">
  import { createThrottler } from '@tanstack/svelte-pacer'
  import { sendPosition } from './api'

  const throttler = createThrottler(sendPosition, { wait: 250 }, (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
  }))
</script>

<button onclick={() => void throttler.maybeExecute(42)}>Report</button>
<output>{throttler.state.isPending}</output>
```

The focused snippets below use `createThrottler` during component initialization, and instance methods from event handlers.

### Throttled callback

Use `createThrottler(...).maybeExecute` when an event should invoke a throttled side effect:

```ts
import { createThrottler } from '@tanstack/svelte-pacer'

const search = createThrottler(
  (query: string) => updateSearchResults(query),
  { wait: 500 },
).maybeExecute
function onInput(event: Event) {
  search((event.target as HTMLInputElement).value)
}
```

Keep the utility instance when the component also needs `cancel()` or `flush()`. Its bound `maybeExecute` method can be passed directly as an event handler.

### Throttled state and values

Use `createThrottledSignal` when Pacer should own the throttled state, or `createThrottledValue` when a value already changes elsewhere:

```ts
import { createThrottledValue } from '@tanstack/svelte-pacer'

let query = $state('')
const [throttledQuery] = createThrottledValue(() => query, { wait: 500 })
// Read throttledQuery() in the template.
```

## Execution timing

The `leading` and `trailing` options control which edges of the throttle interval may execute.

| `leading` | `trailing` | Behavior                                                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `true`    | `true`     | Execute the first call immediately and the latest blocked call at the trailing edge. This is the default.    |
| `true`    | `false`    | Execute immediately when allowed and discard calls during the interval.                                      |
| `false`   | `true`     | Delay the first execution until the trailing edge and use the latest arguments received during the interval. |
| `false`   | `false`    | Do not execute any calls.                                                                                    |

```ts
const throttler = createThrottler(updateProgress, {
  wait: 1000,
  leading: true,
  trailing: true,
})

throttler.maybeExecute(10) // Executes immediately.
throttler.maybeExecute(20)
throttler.maybeExecute(30) // Executes at the trailing edge with 30.
```

Calls received during an existing interval update the trailing arguments without restarting that interval. This is the central difference from debouncing.

## Controlling pending work

### Flush

`flush()` immediately executes the pending trailing call. It does nothing when no trailing call is pending.

```ts
throttler.maybeExecute(10) // Leading execution.
throttler.maybeExecute(20) // Pending trailing execution.
throttler.flush() // Executes with 20 now.
```

### Cancel

`cancel()` discards the pending trailing call and clears its stored arguments. It does not reset the timing of the most recent completed execution.

```ts
throttler.maybeExecute(20)
throttler.cancel()
```

### Reset

`reset()` restores state counters and timing values to their defaults. It does not clear an already scheduled timeout. Call `cancel()` before `reset()` when pending work must be discarded.

```ts
throttler.cancel()
throttler.reset()
```

## Configuring behavior at runtime

Use `setOptions()` to update options after construction:

```ts
throttler.setOptions({
  wait: 250,
  trailing: false,
})
```

A changed `wait` value does not reschedule an existing trailing timeout. It applies to later scheduling and executions.

The `enabled` and `wait` options may be functions that receive the throttler instance:

```ts
const throttler = createThrottler(updateProgress, {
  enabled: (throttler) => throttler.store.state.executionCount < 100,
  wait: (throttler) => (throttler.store.state.executionCount < 10 ? 100 : 250),
})
```

Disabling a throttler through `setOptions()` cancels a pending trailing execution.

### Observing executions

`onExecute` runs after the wrapped function and receives the executed arguments followed by the throttler instance:

```ts
const throttler = createThrottler(updateProgress, {
  wait: 100,
  onExecute: (args, throttler) => {
    console.log('Rendered value:', args[0])
    console.log('Executions:', throttler.store.state.executionCount)
  },
})
```

## Svelte lifecycle

The adapter cancels pending work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Read selected state from the utility in the template. Imperative methods such as capacity and peek helpers do not create reactive dependencies; derive their readouts from selected state:

```ts
const throttler = createThrottler(updateProgress, { wait: 100 }, (state) => ({
  isPending: state.isPending,
  executionCount: state.executionCount,
}))

console.log(throttler.state.isPending, throttler.state.executionCount)
```

Use `utility.Subscribe` with a selector and a `children` snippet for an independently subscribed child.

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `lastArgs`: The arguments retained for a possible trailing execution.
- `lastExecutionTime`: When the wrapped function last executed.
- `nextExecutionTime`: When another execution can occur.
- `executionCount`: How many times the wrapped function has executed.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [Svelte API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
