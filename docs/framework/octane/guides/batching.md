---
title: Octane Batching Guide
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

Call hooks at the top level of a compiled Octane component. The compiler assigns each call its own hook slot. The hook retains its utility across renders and commits the current callback and options in a layout effect. Selected state triggers rendering, and unmounting cleans up the utility. Use Octane 0.1.36; this package does not support the 0.2 line yet.

```tsx
import { createRoot, useState } from 'octane';
import { useBatcher } from '@tanstack/octane-pacer';
function Example() @{
  const [input, setInput] = useState('hello');
  const [wait, setWait] = useState(200);
  const [history, setHistory] = useState<Array<Array<string>>>([]);
  const utility = useBatcher((value: Array<string>) => { setHistory((previous) => [...previous, value]); }, { wait: wait, maxSize: 3 }, (state) => state);
  <main>
<h1>Octane useBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
<label>Task <input value={input} onInput={(event) => setInput(event.currentTarget.value)} /></label><label>Wait (ms) <input value={wait} onInput={(event) => setWait(Number(event.currentTarget.value))} type="number" min="0" /></label>
<div><button onClick={() => { void utility.addItem(input); }}>Schedule</button><button onClick={() => { for (let i = 1; i <= 3; i++) void utility.addItem(`${input} ${i}`); }}>Schedule three</button><button onClick={() => { void utility.flush(); }}>Flush</button><button onClick={() => { utility.cancel(); }}>Cancel</button><button onClick={() => setHistory([])}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">The hook retains one utility across renders and commits current options and callbacks.</p>
</main>
}
createRoot(document.getElementById('app')!).render(Example);
```

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `executionCount` with a selector.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Octane adapter](../adapter.md)
- [Core batching guide](../../../guides/batching.md)
- [API reference](../reference/index.md)
