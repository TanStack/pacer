---
title: Ember Async Queuing Guide
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

## Use useAsyncQueuer

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncQueuer } from '@tanstack/ember-pacer'
import type { AsyncQueuerState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<string> = []
  execute = async (value: string) => { this.history = [...this.history, value] }
  select = (state: AsyncQueuerState<string>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  schedule = (add: (value: string) => unknown, value: string) => () => { void add(value) }
  start = (utility: { start: () => unknown }) => () => { utility.start() }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useAsyncQueuer this.execute this.select wait=this.wait started=false) as |utility|}}
<main>
<h1>Ember useAsyncQueuer</h1><p>Keep each task in order. Start and stop processing without losing pending items.</p>
<label>Task <input value={{this.input}} {{on "input" this.updateInput}} /></label><label>Wait (ms) <input value={{this.wait}} {{on "input" this.updateWait}} type="number" min="0" /></label>
<div><button {{on "click" (this.schedule utility.addItem this.input)}}>Schedule</button><button {{on "click" (fn this.burst utility.addItem)}}>Schedule three</button><button {{on "click" (this.start utility)}}>Start queue</button><button {{on "click" utility.stop}}>Stop queue</button><button {{on "click" this.clear}}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{json this.history}}</pre></section>
<section><h2>Utility state</h2><pre>{{json utility.state}}</pre></section>
<p class="caption">Tracked named arguments update the same utility. The helper owns cleanup when it leaves the template.</p>
</main>
{{/let}}
  </template>
}
```

## Options and controls

`addItem` adds a task; `start()` and `stop()` control processing. `wait` spaces executions, `maxSize` limits pending items, and `getPriority` controls priority. `initialItems` supplies initial work. Expiration options remove obsolete items. Select `items`, `size`, `isRunning`, and `settleCount` to display progress. Stopping preserves pending items.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

Use `concurrency` to bound active tasks. `items` contains pending work; use `activeItems` and `isRunning` when presenting task status. Stopping prevents new tasks from starting; aborting signals active tasks to stop.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use tracked named arguments to change options. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning helper supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument after the execution callback to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncQueuedState` selects pending items by default. It retains the async queue controls, including concurrency and abort.

## Related documentation

- [Ember adapter](../adapter.md)
- [Core async queuing guide](../../../guides/async-queuing.md)
- [API reference](../reference/index.md)
