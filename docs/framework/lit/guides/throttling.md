---
title: Lit Throttling Guide
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

- `useThrottledCallback` for a stable throttled event handler
- `useThrottledState` or `useThrottledValue` for throttled Lit state
- `useThrottler` for lifecycle methods and selected state

Use the callback API for event handlers, the state or value API for rate-controlled UI state, and the instance API for lifecycle methods and timing state.

## Use createThrottler

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

```ts
import { LitElement, html } from 'lit'
import { createThrottler } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createThrottler(this, (value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, leading: false }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.maybeExecute(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.maybeExecute(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createThrottler</h1><p>Limit executions to one per interval while retaining the latest trailing call.</p>
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

`maybeExecute` limits executions to one per `wait` interval. `leading` controls the first execution and `trailing` retains the most recent deferred call. Use `flush()` to execute pending work and `cancel()` to discard its timer. Select `isPending`, `lastArgs`, and `executionCount` to render progress.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createThrottledCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

`createThrottledState` owns a delayed value. `createThrottledValue` derives one from an existing reactive input. See the [adapter guide](../adapter.md) for each helper's return shape.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core throttling guide](../../../guides/throttling.md)
- [API reference](../reference/index.md)
