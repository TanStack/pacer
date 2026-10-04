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

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `createBatcher` | `createBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `createDebouncer` | `createDebouncedCallback`, `createDebouncedState`, `createDebouncedValue` |
| [queuing](./guides/queuing.md) | `createQueuer` | `createQueuedState`, `createQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `createRateLimiter` | `createRateLimitedCallback`, `createRateLimitedState`, `createRateLimitedValue` |
| [throttling](./guides/throttling.md) | `createThrottler` | `createThrottledCallback`, `createThrottledState`, `createThrottledValue` |
| [async batching](./guides/async-batching.md) | `createAsyncBatcher` | `createAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `createAsyncDebouncer` | `createAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `createAsyncQueuer` | `createAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `createAsyncRateLimiter` | `createAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `createAsyncThrottler` | `createAsyncThrottledCallback` |

## TypeScript configuration

Set `"useDefineForClassFields": false` when declaring Lit reactive properties with class field initializers, as in these examples. This lets Lit install its reactive property accessors.

## Example

```ts
import { LitElement, html } from 'lit'
import { createDebouncer } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createDebouncer(this, (value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.maybeExecute(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.maybeExecute(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input .value=${this.input} @input=${(event: Event) => { this.input = (event.target as HTMLInputElement).value }} /></label><label>Wait (ms) <input .value=${String(this.wait)} @input=${(event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }} type="number" min="0" /></label>
<div><button @click=${this.schedule}>Schedule</button><button @click=${this.burst}>Schedule three</button><button @click=${() => this.utility.flush()}>Flush</button><button @click=${() => this.utility.cancel()}>Cancel</button><button @click=${() => { this.history = [] }}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">${JSON.stringify(this.history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>${JSON.stringify(this.utility.state, null, 2)}</pre></section>
<p class="caption">Host updates refresh options. Disconnecting the element cleans up its utility.</p>
</main>` }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Call `providePacerOptions(this, () => defaults)` before creating utilities. Defaults belong to that host and use utility keys such as `debouncer` and `asyncQueuer`. Share the defaults source explicitly when multiple hosts need the same configuration.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Queue state helpers return `[itemsAccessor, addItem, utility]`. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

The utilities emit the same Pacer devtools events as the other adapters. Use the framework-independent `@tanstack/pacer-devtools` panel when your application supplies a devtools host.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
