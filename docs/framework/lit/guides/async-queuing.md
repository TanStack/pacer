---
title: Lit Async Queuing Guide
id: async-queuing
---

Async queuing keeps the ordering, capacity, priority, expiration, and start or stop controls described in the [Queuing Guide](./queuing.md). It adds controlled concurrency, Promise-aware processing, per-item retries, result callbacks, and control over active work.

Use it when every accepted item should eventually run, but only a limited number of async operations should be active at once. Use [Async Rate Limiting](./async-rate-limiting.md) when excess calls should be rejected by a time window instead of waiting.

## How async queuing works

Items move through two stages:

```text
pending queue                 active work, concurrency: 2

[ A, B, C, D ]    start A    [ A ]
[ B, C, D ]       start B    [ A, B ]
[ B, C, D ]    B finishes    [ A ]
[ C, D ]          wait, C    [ A, C ]
```

`concurrency` limits automatically scheduled active items. Its default is `1`. With `wait: 0`, a free slot is filled after an item settles. With a positive `wait`, the queue waits that long after a settled item before checking for more work.

The queue controls start order. With concurrency greater than `1`, completion order depends on the work itself.

## Choose an API

- `useAsyncQueuedState` for reactive pending items
- `useAsyncQueuer` for concurrency, ordering, and lifecycle control

## Use createAsyncQueuer

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

```ts
import { LitElement, html } from 'lit'
import { createAsyncQueuer } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createAsyncQueuer(this, async (value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, started: false }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.addItem(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.addItem(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createAsyncQueuer</h1><p>Keep each task in order. Start and stop processing without losing pending items.</p>
<label>Task <input .value=${this.input} @input=${(event: Event) => { this.input = (event.target as HTMLInputElement).value }} /></label><label>Wait (ms) <input .value=${String(this.wait)} @input=${(event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }} type="number" min="0" /></label>
<div><button @click=${this.schedule}>Schedule</button><button @click=${this.burst}>Schedule three</button><button @click=${() => this.utility.start()}>Start queue</button><button @click=${() => this.utility.stop()}>Stop queue</button><button @click=${() => { this.history = [] }}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">${JSON.stringify(this.history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>${JSON.stringify(this.utility.state, null, 2)}</pre></section>
<p class="caption">Host updates refresh options. Disconnecting the element cleans up its utility.</p>
</main>` }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
```

## Options and controls

`addItem` adds a task; `start()` and `stop()` control processing. `wait` spaces executions, `maxSize` limits pending items, and `getPriority` controls priority. `initialItems` supplies initial work. Expiration options remove obsolete items. Select `items`, `size`, `isRunning`, and `settleCount` to display progress. Stopping preserves pending items.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

Use `concurrency` to bound active tasks. `items` contains pending work; use `activeItems` and `isRunning` when presenting task status. Stopping prevents new tasks from starting; aborting signals active tasks to stop.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncQueuedState` selects pending items by default. It retains the async queue controls, including concurrency and abort.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core async queuing guide](../../../guides/async-queuing.md)
- [API reference](../reference/index.md)
