---
id: injectQueuedSignal
title: injectQueuedSignal
---

# Function: injectQueuedSignal()

```ts
function injectQueuedSignal<TValue, TSelected>(
   fn, 
   options, 
selector): QueuedSignal<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedSignal.ts:48](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L48)

An Angular function that creates a queuer with managed state, combining Angular's signals with queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a callable object:
- `queued()`: Get the current queue items as an array
- `queued.addItem(...)`: Add an item to the queue
- `queued.queue`: The queuer instance with additional control methods

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`item`) => `void`

### options

`QueuerOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`QueuedSignal`](../type-aliases/QueuedSignal.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - track items
const queued = injectQueuedSignal(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Add items
queued.addItem('task1');

// Access items
console.log(queued()); // ['task1']

// Control the queue
queued.queuer.start();
queued.queuer.stop();
```
