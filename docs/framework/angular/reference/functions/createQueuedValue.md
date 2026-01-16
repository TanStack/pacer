---
id: createQueuedValue
title: createQueuedValue
---

# Function: createQueuedValue()

```ts
function createQueuedValue<TValue, TSelected>(
   initialValue, 
   options, 
   selector?): [Signal<TValue>, AngularQueuer<TValue, TSelected>];
```

Defined in: [angular-pacer/src/queuer/createQueuedValue.ts:31](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/createQueuedValue.ts#L31)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses createQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The function returns a tuple containing:
- A Signal that provides the current queued value
- The queuer instance with control methods

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### initialValue

`Signal`\<`TValue`\>

### options

`QueuerOptions`\<`TValue`\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`Signal`\<`TValue`\>, [`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
const initialValue = signal('initial');
const [value, queuer] = createQueuedValue(initialValue, {
  wait: 500,
  started: true
});

// Add changes to the queue
queuer.addItem('new value');
```
