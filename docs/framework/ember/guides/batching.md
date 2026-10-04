---
title: Ember Batching Guide
id: batching
---

Batching collects items and passes them to one function as an array. A batch can run when it reaches a configured size, after no new items arrive for a configured wait, or when custom logic says it is ready.

Batching reduces the number of operations by processing several items together. Unlike queuing, it does not call the wrapped function once for each item.

## How batching works

```text
Batching (process every 3 items or after 2 quiet ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️             ⬇️  ⬇️  ⬇️
Batch:       [ABC]   []      [DE]      []        [FGH]  []
Executed:     ✅              ✅                  ✅
             [======================================================]
             ^ Items are grouped and processed together

             [Size reached]   [Wait elapsed]      [Size reached]
```

Each execution receives a copy of the items currently collected. The batcher clears those items before calling the wrapped function.

## When to use batching

Choose batching when:

- A bulk operation is more efficient than individual operations.
- Network requests, database writes, or analytics events can be grouped.
- A maximum batch size or quiet-period trigger matches the workload.
- Individual item results are unnecessary.

Choose another utility when:

- Every item should run individually and in order. Use [queuing](./queuing.md).
- Only the latest value matters. Use [debouncing](./debouncing.md).
- Calls should be spaced over time. Use [throttling](./throttling.md).
- Batch processing returns a Promise or needs retries and abort support. Use [async batching](./async-batching.md).

## Choose an API

- `useBatchedCallback` for a stable item-adder
- `useBatcher` for flush, cancel, collected items, and selected state

Use the callback API when adding items is all the component needs. Use the instance API for `flush()`, `cancel()`, collected items, selected state, and dynamic options.

## Use useBatcher

Call the `use*` template helpers inside a `{{#let}}` block. The execution callback is the first positional argument and the optional state selector is the second. Pass options as named arguments. Ember tracks named arguments and updates the same utility after rendering. Removing the helper from the template releases its subscriptions and cleans up pending work.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatcher } from '@tanstack/ember-pacer'
import type { BatcherState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<Array<string>> = []
  execute = (value: Array<string>) => { this.history = [...this.history, value] }
  select = (state: BatcherState<string>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useBatcher this.execute this.select wait=this.wait maxSize=3) as |utility|}}
<main>
<h1>Ember useBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
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

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `executionCount` with a selector.
## Reactive options and cleanup

Use tracked named arguments to change options. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning helper supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument after the execution callback to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Ember adapter](../adapter.md)
- [Core batching guide](../../../guides/batching.md)
- [API reference](../reference/index.md)
