---
id: createAsyncQueuedSignal
title: createAsyncQueuedSignal
---

# Function: createAsyncQueuedSignal()

```ts
function createAsyncQueuedSignal<TValue, TSelected>(
   fn, 
   options, 
selector): AsyncQueuedSignal<TValue, TSelected>;
```

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts:65](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L65)

An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or processed in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns an object containing:
- `items`: A Signal that provides the current queue items as an array
- `addItem`: The queuer's addItem method
- `queuer`: The queuer instance with additional control methods

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

[`AsyncQueuedSignal`](../interfaces/AsyncQueuedSignal.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - track items
const queue = createAsyncQueuedSignal(
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
queue.addItem(data1);

// Access items
console.log(queue.items()); // [data1, ...]

// Control the queue
queue.queuer.start();
queue.queuer.stop();
```
