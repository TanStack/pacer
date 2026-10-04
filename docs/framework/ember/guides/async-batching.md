---
title: Ember Async Batching Guide
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

## Use useAsyncBatcher

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type { AsyncBatcherState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<Array<string>> = []
  execute = async (value: Array<string>) => { this.history = [...this.history, value] }
  select = (state: AsyncBatcherState<string>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useAsyncBatcher this.execute this.select wait=this.wait maxSize=3) as |utility|}}
<main>
<h1>Ember useAsyncBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
<label>Task <input value={{this.input}} {{on "input" this.updateInput}} /></label><label>Wait (ms) <input value={{this.wait}} {{on "input" this.updateWait}} type="number" min="0" /></label>
<div><button {{on "click" (fn utility.addItem this.input)}}>Schedule</button><button {{on "click" (fn this.burst utility.addItem)}}>Schedule three</button><button {{on "click" utility.flush}}>Flush</button><button {{on "click" utility.cancel}}>Cancel</button><button {{on "click" this.clear}}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{json this.history}}</pre></section>
<section><h2>Utility state</h2><pre>{{json utility.state}}</pre></section>
<p class="caption">Tracked named arguments update the same utility. The helper owns cleanup when it leaves the template.</p>
</main>
{{/let}}
  </template>
}
```

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `settleCount` with a selector.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use tracked named arguments to change options. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning helper supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument after the execution callback to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Ember adapter](../adapter.md)
- [Core async batching guide](../../../guides/async-batching.md)
- [API reference](../reference/index.md)
