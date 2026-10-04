---
title: Lit Rate Limiting Guide
id: rate-limiting
---

Rate limiting allows a configured number of executions within a time window. Calls run immediately while capacity remains. Once the limit is reached, later calls are rejected until capacity becomes available again.

TanStack Pacer provides an in-memory rate limiter intended primarily for client-side operations. It can run in server-side JavaScript, but it is not a distributed quota or enforcement system.

## How rate limiting works

This example allows three executions per window:

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  | Window 2
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                       ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                       ✅     ✅
             [=== 3 allowed ===][=== blocked until reset ===][=== new window ===]
```

Rate limiting permits bursts. It does not space accepted calls evenly.

## When to use rate limiting

Choose rate limiting when:

- A client operation should follow a fixed quota.
- Calls may run immediately until the quota is exhausted.
- Rejected calls may be discarded or handled separately.
- You need to measure remaining capacity or time until capacity returns.

Choose another utility when:

- Executions should be evenly spaced. Use [throttling](./throttling.md).
- Only the final call matters. Use [debouncing](./debouncing.md).
- Every operation must eventually run. Use [queuing](./queuing.md).
- Items should run together. Use [batching](./batching.md).
- You need Promise results, retries, or abort support. Use [async rate limiting](./async-rate-limiting.md).

## Window types

The `windowType` option controls when capacity returns.

### Fixed window

A fixed window starts when its first execution is accepted. All accepted executions remain counted until that window ends. Capacity then resets together.

```ts
const limiter = useRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'fixed',
})
```

Fixed windows can allow bursts near a boundary because a full quota becomes available when the window resets.

### Sliding window

A sliding window tracks each accepted execution separately. Capacity returns one execution at a time as old timestamps leave the window.

```text
Sliding Window (limit: 3 calls per window)
Timeline: [1 second per tick]
Calls:        ⬇️     ⬇️     ⬇️     ⬇️           ⬇️
Executed:     ✅     ✅     ✅     ❌           ✅
             [=== full ===][oldest execution expires][=== one available ===]
```

```ts
const limiter = useRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'sliding',
})
```

Use a sliding window when capacity should return gradually rather than all at once.

## Choose an API

- `useRateLimitedCallback` for a quota-controlled event handler
- `useRateLimitedState` or `useRateLimitedValue` for Lit state
- `useRateLimiter` for capacity helpers and selected state

Use the callback API for operations, the state or value API for quota-controlled UI updates, and the instance API when you need capacity helpers or rejection state.

## Use createRateLimiter

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

```ts
import { LitElement, html } from 'lit'
import { createRateLimiter } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createRateLimiter(this, (value: string) => { this.history = [...this.history, value] }, () => ({ limit: 2, window: this.wait }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.maybeExecute(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.maybeExecute(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createRateLimiter</h1><p>Accept up to two executions per time window and track rejected calls.</p>
<label>Task <input .value=${this.input} @input=${(event: Event) => { this.input = (event.target as HTMLInputElement).value }} /></label><label>Wait (ms) <input .value=${String(this.wait)} @input=${(event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }} type="number" min="0" /></label>
<div><button @click=${this.schedule}>Schedule</button><button @click=${this.burst}>Schedule three</button><button @click=${() => this.utility.reset()}>Reset window</button><button @click=${() => this.utility.reset()}>Reset</button><button @click=${() => { this.history = [] }}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">${JSON.stringify(this.history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>${JSON.stringify(this.utility.state, null, 2)}</pre></section>
<p class="caption">Host updates refresh options. Disconnecting the element cleans up its utility.</p>
</main>` }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
```

## Options and controls

`maybeExecute` accepts or rejects each call based on `limit` and `window`. Rejected calls are not queued for later. `reset()` clears the window and state. Function-valued limits can inspect the limiter at execution time. Select `executionCount` and `rejectionCount` to show accepted and rejected attempts.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

`createRateLimitedState` owns a delayed value. `createRateLimitedValue` derives one from an existing reactive input. See the [adapter guide](../adapter.md) for each helper's return shape.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core rate limiting guide](../../../guides/rate-limiting.md)
- [API reference](../reference/index.md)
