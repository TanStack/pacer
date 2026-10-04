---
title: Lit Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## Use createAsyncRateLimiter

Pass the owning `ReactiveControllerHost` as the first argument. The factory registers its controller automatically. Host updates refresh options, store updates request a render, and disconnecting cleans up pending work. Reconnecting subscribes again to the same utility. `DebouncerController` and the other controller classes expose the utility through `.pacer` and selected state through `.state`.

```ts
import { LitElement, html } from 'lit'
import { createAsyncRateLimiter } from '@tanstack/lit-pacer'
class Example extends LitElement {
  static properties = { input: { state: true }, wait: { state: true }, history: { state: true } }
  input = 'hello'
  wait = 200
  history: Array<string> = []
  utility = createAsyncRateLimiter(this, async (value: string) => { this.history = [...this.history, value] }, () => ({ limit: 2, window: this.wait }), (state) => state)
  override createRenderRoot() { return this }
  schedule = () => { void this.utility.maybeExecute(this.input) }
  burst = () => { for (let i = 1; i <= 3; i++) void this.utility.maybeExecute(`${this.input} ${i}`) }
  override render() { return html`
<main>
<h1>Lit createAsyncRateLimiter</h1><p>Accept up to two executions per time window and track rejected calls.</p>
<label>Task <input .value=${this.input} @input=${(event: Event) => { this.input = (event.target as HTMLInputElement).value }} /></label><label>Wait (ms) <input .value=${String(this.wait)} @input=${(event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }} type="number" min="0" /></label>
<div><button @click=${this.schedule}>Schedule</button><button @click=${this.burst}>Schedule three</button><button @click=${() => this.utility.reset()}>Reset window</button><button @click=${() => this.utility.abort()}>Reset</button><button @click=${() => { this.history = [] }}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">${JSON.stringify(this.history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>${JSON.stringify(this.utility.state, null, 2)}</pre></section>
<p class="caption">Host updates refresh options. Disconnecting the element cleans up its utility.</p>
</main>` }
}
customElements.define('pacer-example', Example)
document.getElementById('app')!.append(document.createElement('pacer-example'))
```

## Options and controls

`maybeExecute` accepts or rejects each call based on `limit` and `window`. Rejected calls are not queued for later. `reset()` clears the window and state. Function-valued limits can inspect the limiter at execution time. Select `settleCount` and `rejectionCount` to show accepted and rejected attempts.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Lit adapter](../adapter.md)
- [Core async rate limiting guide](../../../guides/async-rate-limiting.md)
- [API reference](../reference/index.md)
