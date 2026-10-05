---
title: Vue Debouncing Guide
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

## Using debouncing in Vue

The adapter provides two levels of debouncing API:

- `useDebouncedState` and `useDebouncedValue` delay state or a changing value.
- `useDebouncer` exposes lifecycle methods, dynamic options, callbacks, and selected state.

Call composables during component setup or inside an active Vue effect scope. The snippets below belong in that scope. Read returned refs through `.value` in JavaScript; Vue templates unwrap top-level refs.

The snippets use application functions such as `saveDraft` and `updateSearchResults`. Supply those functions in your component.

### Debounced callback

Use `useDebouncer(...).maybeExecute` when an event should invoke a debounced side effect:

```ts
import { useDebouncer } from '@tanstack/vue-pacer'

const search = useDebouncer(
  (query: string) => updateSearchResults(query),
  { wait: 500 },
).maybeExecute
function onInput(event: Event) {
  search((event.target as HTMLInputElement).value)
}
```

Keep the utility instance when the component also needs `cancel()` or `flush()`. Its bound `maybeExecute` method can be passed directly as an event handler.

### Debounced state and values

Use `useDebouncedState` when Pacer should own the delayed state, or `useDebouncedValue` when a value already changes elsewhere:

```ts
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

const query = ref('')
const [debouncedQuery] = useDebouncedValue(query, { wait: 500 })
// Bind debouncedQuery to the results component in the template.
```

### Instance API

```ts
import { useDebouncer } from '@tanstack/vue-pacer'

const debouncer = useDebouncer(saveDraft, { wait: 500 }, (state) => ({
  isPending: state.isPending,
}))
const state = debouncer.state
// Bind !state.isPending to the Save now button's disabled attribute.
function saveNow() {
  debouncer.flush()
}
```

The bound `maybeExecute()` method returns `void`. The synchronous adapter does not retain return values or catch errors. Handle errors inside a trailing callback, or use [async debouncing](./async-debouncing.md) when the caller needs a Promise result.

The following timing and control snippets use the `debouncer` instance created in your component. Run those operations from event handlers or other application code.

## Execution timing

The `leading` and `trailing` options control which edge of the wait period may execute.

| `leading` | `trailing` | Behavior                                                                                                                               |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `false`   | `true`     | Wait for inactivity, then execute the most recent call. This is the default.                                                           |
| `true`    | `false`    | Execute the first call immediately. Later calls do not execute and restart the wait period.                                            |
| `true`    | `true`     | Execute the first call immediately. If another call arrives during the wait period, execute the most recent call at the trailing edge. |
| `false`   | `false`    | Do not execute any calls.                                                                                                              |

```ts
debouncer.setOptions({
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

`useDebouncer` does not provide a `maxWait` option. A continuous stream of calls can keep postponing a trailing execution indefinitely. Use [throttling](./throttling.md) when work must continue at a bounded interval while calls are still arriving.

## Controlling pending work

The instance API distinguishes between executing, canceling, and resetting pending work.

### Flush

`flush()` immediately executes the pending trailing call with the most recent arguments. It does nothing when no trailing call is pending.

```ts
debouncer.setOptions({ wait: 1000 })

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
debouncer.setOptions({
  wait: 500,
  enabled: false,
})

debouncer.maybeExecute('ignored')
debouncer.setOptions({ enabled: true })
debouncer.maybeExecute('saved')
```

The `enabled` and `wait` options may also be functions that receive the debouncer instance:

```ts
debouncer.setOptions({
  enabled: (debouncer) => debouncer.store.state.executionCount < 10,
  wait: (debouncer) => (debouncer.store.state.executionCount === 0 ? 300 : 500),
})
```

### Observing executions

Use `onExecute` for a side effect after the wrapped function runs. The callback receives the executed arguments followed by the debouncer instance.

```ts
debouncer.setOptions({
  wait: 500,
  onExecute: (args, debouncer) => {
    console.log('Saved arguments:', args)
    console.log('Execution count:', debouncer.store.state.executionCount)
  },
})
```

### Reactive options

Pass an options factory or property getters to read reactive settings. Local options override provider defaults, and option changes retain the same utility instance.

```ts
const wait = ref(500)
const debouncer = useDebouncer(saveDraft, () => ({ wait: wait.value }))
```

## Vue lifecycle

Disposing the Vue component or effect scope cancels pending work and stops option watchers and subscriptions. Providing `onUnmount` replaces the default cleanup, so a custom callback must perform every required lifecycle action. Flushing during teardown can run callbacks after the component has begun to be destroyed.

## Reactive state

Pass a selector to subscribe to the state your component reads. Without a selector, selected state is an empty object. Read the selection through `debouncer.state.value`. The core store remains available even when you do not select state for rendering.

Option functions and lifecycle callbacks receive the public utility instance. Reading `.store.state` in those callbacks is supported. Component rendering should read the selected adapter state.

### Child subscriptions

A child can select state without subscribing the utility owner. The child subscription cleans up when its own scope or component is destroyed:

```vue
<debouncer.Subscribe
  :selector="(state) => ({ isPending: state.isPending })"
  v-slot="{ isPending }"
>
  <span>{{ isPending }}</span>
</debouncer.Subscribe>
```

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields; pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `executionCount`: How many times the wrapped function has executed.
- `lastArgs`: The arguments recorded by the most recent trailing-enabled call. Check `isPending` before treating them as pending work.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [Vue API reference](../reference/index.md) for adapter signatures and the [adapter guide](../adapter.md) for provider and helper return shapes.
