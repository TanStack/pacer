---
title: Ember Async Debouncing Guide
id: async-debouncing
---

Async debouncing keeps the timing behavior described in the [Debouncing Guide](./debouncing.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use async debouncing when the debounced operation returns a value you need, can reject, or needs retry and abort support. The synchronous debouncing adapter can call an async function as a side effect, but it does not manage the resulting Promise.

## Choose an API

- `useAsyncDebouncedCallback` for a stable Promise-returning handler
- `useAsyncDebouncer` for lifecycle methods and selected execution state

## Use useAsyncDebouncer

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import type { AsyncDebouncerState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<string> = []
  execute = async (value: string) => { this.history = [...this.history, value] }
  select = (state: AsyncDebouncerState<(value: string) => Promise<void>>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useAsyncDebouncer this.execute this.select wait=this.wait) as |utility|}}
<main>
<h1>Ember useAsyncDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input value={{this.input}} {{on "input" this.updateInput}} /></label><label>Wait (ms) <input value={{this.wait}} {{on "input" this.updateWait}} type="number" min="0" /></label>
<div><button {{on "click" (fn utility.maybeExecute this.input)}}>Schedule</button><button {{on "click" (fn this.burst utility.maybeExecute)}}>Schedule three</button><button {{on "click" utility.flush}}>Flush</button><button {{on "click" utility.cancel}}>Cancel</button><button {{on "click" this.clear}}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{json this.history}}</pre></section>
<section><h2>Utility state</h2><pre>{{json utility.state}}</pre></section>
<p class="caption">Tracked named arguments update the same utility. The helper owns cleanup when it leaves the template.</p>
</main>
{{/let}}
  </template>
}
```

## Options and controls

`maybeExecute` schedules the latest arguments. `wait` resets after each call. `leading` runs the first call immediately and `trailing` controls the deferred call. Use `flush()` to execute pending work, `cancel()` to discard its timer, and `reset()` to reset counters. Select `isPending`, `lastArgs`, or `settleCount` for your UI.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use tracked named arguments to change options. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning helper supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument after the execution callback to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncDebouncedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Ember adapter](../adapter.md)
- [Core async debouncing guide](../../../guides/async-debouncing.md)
- [API reference](../reference/index.md)
