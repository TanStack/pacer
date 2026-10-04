---
title: Ember Queuing Guide
id: queuing
---

Queuing stores operations in an ordered buffer and processes them individually. It is the primary Pacer strategy for work that should not be discarded when calls arrive faster than they can run.

Queues are lossless only while they have capacity. A finite `maxSize`, explicit clearing, expiration, or a processing error can still remove or reject work.

## How queuing works

```text
Queuing (process one item every 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Queue:       [ABC]   [BC]    [BCDE]    [DE]    [E]    []
Executed:     ✅     ✅       ✅        ✅      ✅     ✅
             [======================================================]
             ^ Accepted items remain queued until processed

             [Items arrive]    [Process steadily]      [Empty]
```

The queue can process automatically with a delay between items, or remain stopped for manual processing.

## When to use queuing

Choose queuing when:

- Every accepted operation should run individually.
- Processing order matters.
- Incoming work may temporarily exceed processing capacity.
- A maximum buffer size should reject excess work explicitly.
- FIFO, LIFO, or priority ordering is required.

Choose another utility when:

- Only the final call matters. Use [debouncing](./debouncing.md).
- Intermediate calls may be discarded while work runs steadily. Use [throttling](./throttling.md).
- Calls should be rejected after a time-window quota. Use [rate limiting](./rate-limiting.md).
- Items should run together. Use [batching](./batching.md).
- Tasks return Promises or should run concurrently. Use [async queuing](./async-queuing.md).

## Choose an API

- `useQueuedState` or `useQueuedValue` for a queue connected to Ember state
- `useQueuer` for direct queue lifecycle and ordering control

Use the queued state or value API when queue contents drive the UI. Use the instance API for ordering, capacity, expiration, pause, resume, flush, and manual processing.

## Ember example

Invoke the helper in a template. Named arguments supply options, and the second positional argument selects state. Removing the helper invocation runs cleanup. The example imports application operations from `./api`.

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuer } from '@tanstack/ember-pacer'
import type { QueuerState } from '@tanstack/ember-pacer'
import { processJob } from './api'

const select = (state: QueuerState<string>) => ({
  items: state.items,
  isRunning: state.isRunning,
})

export default class Example extends Component {
  <template>
    {{#let (useQueuer processJob select wait=500) as |queue|}}
      <button {{on 'click' (fn queue.addItem 'task')}}>Add job</button>
      <output>{{queue.state.items.length}}</output>
    {{/let}}
  </template>
}
```

The focused TypeScript snippets below demonstrate the core `Queuer` class re-exported by the adapter. In a component, use `useQueuer` as above to own the instance, pass configuration as named arguments, and pass the yielded instance to event handlers. Core class instances require explicit cleanup.

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing begins after the helper's first render unless `started: false` is set. Initial callbacks can safely update tracked component state.

`useQueuedState` yields the queue with `items` selected by default. Read `queue.state.items` and call `queue.addItem()`.

## Ordering items

Automatic processing uses `addItemsTo` to choose where new items enter and `getItemsFrom` to choose where items leave.

### FIFO

FIFO processes the oldest item first. This is the default.

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  addItemsTo: 'back',
  getItemsFrom: 'front',
  started: false,
})

queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)
queuer.start() // Processes 1, 2, 3.
```

### LIFO

LIFO processes the newest item first.

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  addItemsTo: 'back',
  getItemsFrom: 'back',
  started: false,
})

queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)
queuer.start() // Processes 3, 2, 1.
```

### Priority

Provide `getPriority` to process higher numeric priorities first. Priority ordering takes precedence over front and back retrieval.

```ts
type Task = { name: string; priority: number }

const queuer = useQueuer<Task>(processTask, {
  getPriority: (task) => task.priority,
  started: false,
})

queuer.addItem({ name: 'low', priority: 1 })
queuer.addItem({ name: 'high', priority: 3 })
queuer.addItem({ name: 'medium', priority: 2 })
queuer.start() // Processes high, medium, low.
```

## Automatic and manual processing

Queues start automatically by default. The first accepted item processes immediately, then `wait` controls the delay before later items.

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  wait: 1000,
})
```

Set `started: false` to collect items before processing:

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, { started: false })

queuer.addItem(1)
queuer.addItem(2)
queuer.start()
queuer.stop()
```

`stop()` cancels the scheduled tick and retains queued items. `start()` resumes automatic processing.

For manual control:

- `execute()` removes and processes the next item immediately.
- `getNextItem()` removes and returns the next item without processing it.
- `peekNextItem()` returns the next item without removing it.
- `peekAllItems()` returns a copy of the current queue.

## Capacity and rejection

Set `maxSize` to bound the number of waiting items. An item added to a full queue is rejected, `addItem()` returns `false`, and `onReject` runs.

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  maxSize: 2,
  started: false,
  onReject: (item, queuer) => {
    console.log('Rejected:', item)
    console.log('Total rejections:', queuer.store.state.rejectionCount)
  },
})

queuer.addItem(1) // true
queuer.addItem(2) // true
queuer.addItem(3) // false
```

The active synchronous execution is not part of `size`; `size` counts items still waiting in the queue.

## Expiring stale items

Use `expirationDuration` to remove items that have waited too long:

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  expirationDuration: 5000,
  onExpire: (item) => {
    console.log('Expired:', item)
  },
})
```

Use `getIsExpired` for custom logic:

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  getIsExpired: (item, addedAt) => Date.now() - addedAt > item.maxAge,
})
```

Expiration is checked while the automatic processing loop runs. A stopped queue evaluates stale items when processing resumes.

## Flushing, clearing, and resetting

### Flush

`flush()` processes waiting items immediately without the configured delay. Pass a count to process only part of the queue.

```ts
queuer.flush() // Process all waiting items.
queuer.flush(2) // Process at most two waiting items.
```

`flushAsBatch()` removes all waiting items and passes them to a separate batch function:

```ts
queuer.flushAsBatch((items) => {
  saveItems(items)
})
```

### Clear

`clear()` removes all waiting items without processing them. It does not change whether the queue is running.

```ts
queuer.clear()
```

### Reset

`reset()` restores state to the default running, empty queue. It does not clear an already scheduled timeout. Call `stop()` before `reset()` when scheduled work must be canceled.

```ts
queuer.stop()
queuer.reset()
```

## Configuring and observing the queue

Use `setOptions()` to update future behavior. Changing `started` through `setOptions()` does not call `start()` or `stop()`.

```ts
queuer.setOptions({ wait: 250, maxSize: 20 })
queuer.start()
```

The `wait` option may be a function that receives the queuer instance:

```ts
import { Queuer } from '@tanstack/ember-pacer'

const queuer = new Queuer(processItem, {
  wait: (queuer) => (queuer.store.state.size > 20 ? 50 : 250),
})
```

Use callbacks for queue events:

- `onItemsChange`: An item was added or removed.
- `onExecute`: An item was processed.
- `onReject`: An item was rejected.
- `onExpire`: An item expired.

## Ember lifecycle

The adapter stops automatic processing when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Use the helper's second positional argument to select fields, as shown above. Read those fields from the yielded instance's `.state` in the template.

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuer } from '@tanstack/ember-pacer'
import type { QueuerState } from '@tanstack/ember-pacer'
import { processJob } from './api'

const select = (state: QueuerState<string>) => ({
  items: state.items,
  isRunning: state.isRunning,
})

export default class Example extends Component {
  <template>
    {{#let (useQueuer processJob select wait=500) as |queue|}}
      <button {{on 'click' (fn queue.addItem 'task')}}>Add job</button>
      <output>{{queue.state.items.length}}</output>
    {{/let}}
  </template>
}
```

The contextual `utility.Subscribe` helper selects state for a child template without subscribing the utility owner.

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items` and `size`: Items still waiting.
- `isRunning`: Whether automatic processing is enabled.
- `isIdle`: Whether a running queue is empty.
- `isFull`: Whether `maxSize` has been reached.
- `executionCount`: Items whose wrapped function returned successfully.
- `rejectionCount` and `expirationCount`: Items removed without processing.
- `status`: `'idle'`, `'running'`, or `'stopped'`.

See the [Ember API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
