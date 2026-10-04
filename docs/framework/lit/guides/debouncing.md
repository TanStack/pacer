---
title: Lit Debouncing Guide
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

## Use createDebouncer

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

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

## Options and controls

`maybeExecute` schedules the latest arguments. `wait` resets after each call. `leading` runs the first call immediately and `trailing` controls the deferred call. Use `flush()` to execute pending work, `cancel()` to discard its timer, and `reset()` to reset counters. Select `isPending`, `lastArgs`, or `executionCount` for your UI.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createDebouncedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

`createDebouncedState` owns a delayed value. `createDebouncedValue` derives one from an existing reactive input. See the [adapter guide](../adapter.md) for each helper's return shape.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core debouncing guide](../../../guides/debouncing.md)
- [API reference](../reference/index.md)
