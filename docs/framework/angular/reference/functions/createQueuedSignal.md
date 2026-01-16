---
id: createQueuedSignal
title: createQueuedSignal
---

# Function: createQueuedSignal()

```ts
function createQueuedSignal<TValue, TSelected>(
   fn, 
   options, 
   selector): [Signal<TValue[]>, (item, position?, runOnItemsChange?) => boolean, AngularQueuer<TValue, TSelected>];
```

Defined in: [angular-pacer/src/queuer/createQueuedSignal.ts:38](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/createQueuedSignal.ts#L38)

An Angular function that creates a queuer with managed state, combining Angular's signals with queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a tuple containing:
- A Signal that provides the current queue items as an array
- The queuer's addItem method
- The queuer instance with additional control methods

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

\[`Signal`\<`TValue`[]\>, (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
// Default behavior - track items
const [items, addItem, queue] = createQueuedSignal(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Add items
addItem('task1');

// Access items
console.log(items()); // ['task1']

// Control the queue
queue.start();
queue.stop();
```
