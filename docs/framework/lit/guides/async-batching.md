---
title: Lit Async Batching Guide
id: async-batching
---

Async batching keeps the collection and trigger behavior described in the [Batching Guide](./batching.md), while adding Promise results, retries, error callbacks, failed-item tracking, and control over in-flight work.

Use it when one async operation should process several collected items together. Use an [Async Queue](./async-queuing.md) when each item needs its own execution or when you need to limit concurrency.

## How async batching works

Items collect until any configured trigger fires:

```text
add A ─── add B ─── add C
  │         │         │
  └─ wait reset       └─ maxSize reached
                            │
                            └─ execute [A, B, C]
```

A batch executes when:

- its length reaches `maxSize`,
- `getShouldExecute(items, batcher)` returns `true`, or
- no new item arrives for `wait` milliseconds.

Both `maxSize` and `wait` default to `Infinity`, so configure at least one trigger or call `flush()` manually. The wait timer restarts on every addition. It measures a quiet period, not a maximum age for the oldest item.

## Choose an API

- `useAsyncBatchedCallback` for adding items
- `useAsyncBatcher` for flush, failed items, and selected execution state

## Use createAsyncBatcher

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

```ts
import { LitElement, html } from 'lit'
import { createAsyncBatcher } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<Array<string>> = []
  utility = createAsyncBatcher(this, async (value: Array<string>) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, maxSize: 3 }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.addItem(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.addItem(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createAsyncBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
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

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `settleCount` with a selector.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core async batching guide](../../../guides/async-batching.md)
- [API reference](../reference/index.md)
