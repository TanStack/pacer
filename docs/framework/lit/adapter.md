---
title: Lit Adapter
id: adapter
---

The `lit-pacer` adapter connects Pacer scheduling utilities to Lit state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/lit-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | State and value helpers |
| ------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------- |
| [batching](./guides/batching.md) | `createBatcher` | None |
| [debouncing](./guides/debouncing.md) | `createDebouncer` | `createDebouncedState`, `createDebouncedValue` |
| [queuing](./guides/queuing.md) | `createQueuer` | `createQueuedState`, `createQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `createRateLimiter` | `createRateLimitedState`, `createRateLimitedValue` |
| [throttling](./guides/throttling.md) | `createThrottler` | `createThrottledState`, `createThrottledValue` |
| [async batching](./guides/async-batching.md) | `createAsyncBatcher` | None |
| [async debouncing](./guides/async-debouncing.md) | `createAsyncDebouncer` | None |
| [async queuing](./guides/async-queuing.md) | `createAsyncQueuer` | `createAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `createAsyncRateLimiter` | None |
| [async throttling](./guides/async-throttling.md) | `createAsyncThrottler` | None |

## TypeScript configuration

Set `"useDefineForClassFields": false` when declaring Lit reactive properties with class field initializers, as in these examples. This lets Lit install its reactive property accessors.

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```ts
import { LitElement, html } from 'lit'
import { createDebouncer } from '@tanstack/lit-pacer'

class Counter extends LitElement {
  static properties = {
    count: { state: true },
    debouncedCount: { state: true },
  }
  count = 0
  debouncedCount = 0
  debouncer = createDebouncer(
    this,
    (value: number) => {
      this.debouncedCount = value
    },
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  )
  increment = () => this.debouncer.maybeExecute(++this.count)

  override render() {
    return html`
      <button @click=${this.increment}>Increment</button>
      <p>Count: ${this.count}. Debounced: ${this.debouncedCount}.</p>
      <p>Pending: ${this.debouncer.state.isPending}</p>
      <button @click=${() => this.debouncer.flush()}>Flush</button>
    `
  }
}
customElements.define('pacer-counter', Counter)
```

## Child subscriptions

Call `utility.subscribe(childHost, selector)` during the child host's construction. It returns a getter for selected state and requests a child update only when that selection changes. Disconnecting releases the subscription; reconnecting restores it.

```ts
const selected = debouncer.subscribe(childHost, (state) => ({
  isPending: state.isPending,
}))
// Read selected().isPending in the child host's render method.
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Call `providePacerOptions(host, defaults)` during construction. Defaults apply to utilities on that host and descendant elements, including across shadow roots. The nearest provider wins. Use a factory or getters to read reactive host properties; provider updates notify descendant hosts. Local utility options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Event handlers and value helpers

Use an instance method as the event handler: `maybeExecute` for debouncing, throttling, and rate limiting, or `addItem` for batching. The instance also provides control methods and state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Synchronous queue state helpers return `[itemsAccessor, addItem, utility]`. Async queue state helpers return `[itemsAccessor, utility]`; call `utility.addItem()` to enqueue an item. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/devtools` and `@tanstack/pacer-devtools`. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application and unmount it during cleanup. Give each utility a `key` to make it appear in the Pacer panel.

See the [devtools setup guide](../../devtools.md#lit-alpine-ember-and-octane-setup) for this framework's mount and cleanup code.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
