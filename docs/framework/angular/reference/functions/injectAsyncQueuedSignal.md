---
id: injectAsyncQueuedSignal
title: injectAsyncQueuedSignal
---

# Function: injectAsyncQueuedSignal()

```ts
function injectAsyncQueuedSignal<TValue, TSelected>(
   fn, 
   options, 
selector): AsyncQueuedSignal<TValue, TSelected>;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:60](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L60)

An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or processed in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a callable object:
- `queued()`: Get the current queue items as an array
- `queued.addItem(...)`: Add an item to the queue
- `queued.queue`: The queuer instance with additional control methods

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`value`) => `Promise`\<`any`\>

### options

`AsyncQueuerOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AsyncQueuedSignal`](../type-aliases/AsyncQueuedSignal.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - track items
const queued = injectAsyncQueuedSignal(
  async (item) => {
    const response = await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return response.json();
  },
  { concurrency: 2, wait: 1000 }
);

// Add items
queued.addItem(data1);

// Access items
console.log(queued()); // [data1, ...]

// Control the queue
queued.queuer.start();
queued.queuer.stop();
```
