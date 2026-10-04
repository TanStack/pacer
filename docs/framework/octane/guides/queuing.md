---
title: Octane Queuing Guide
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

- `useQueuedState` or `useQueuedValue` for a queue connected to Octane state
- `useQueuer` for direct queue lifecycle and ordering control

Use the queued state or value API when queue contents drive the UI. Use the instance API for ordering, capacity, expiration, pause, resume, flush, and manual processing.

## Use useQueuer

Call hooks at the top level of a compiled Octane component. The compiler assigns each call its own hook slot. The hook retains its utility across renders and commits the current callback and options in a layout effect. Selected state triggers rendering, and unmounting cleans up the utility. Use Octane 0.1.36; this package does not support the 0.2 line yet.

```tsx
import { createRoot, useState } from 'octane';
import { useQueuer } from '@tanstack/octane-pacer';
function Example() @{
  const [input, setInput] = useState('hello');
  const [wait, setWait] = useState(200);
  const [history, setHistory] = useState<Array<string>>([]);
  const utility = useQueuer((value: string) => { setHistory((previous) => [...previous, value]); }, { wait: wait, started: false }, (state) => state);
  <main>
<h1>Octane useQueuer</h1><p>Keep each task in order. Start and stop processing without losing pending items.</p>
<label>Task <input value={input} onInput={(event) => setInput(event.currentTarget.value)} /></label><label>Wait (ms) <input value={wait} onInput={(event) => setWait(Number(event.currentTarget.value))} type="number" min="0" /></label>
<div><button onClick={() => { void utility.addItem(input); }}>Schedule</button><button onClick={() => { for (let i = 1; i <= 3; i++) void utility.addItem(`${input} ${i}`); }}>Schedule three</button><button onClick={() => { void utility.start(); }}>Start queue</button><button onClick={() => { utility.stop(); }}>Stop queue</button><button onClick={() => setHistory([])}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">The hook retains one utility across renders and commits current options and callbacks.</p>
</main>
}
createRoot(document.getElementById('app')!).render(Example);
```

## Options and controls

`addItem` adds a task; `start()` and `stop()` control processing. `wait` spaces executions, `maxSize` limits pending items, and `getPriority` controls priority. `initialItems` supplies initial work. Expiration options remove obsolete items. Select `items`, `size`, `isRunning`, and `executionCount` to display progress. Stopping preserves pending items.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useQueuedState` selects pending items by default. `useQueuedValue` tracks the last processed value from a changing source.

## Related documentation

- [Octane adapter](../adapter.md)
- [Core queuing guide](../../../guides/queuing.md)
- [API reference](../reference/index.md)
