---
id: injectQueuedValue
title: injectQueuedValue
---

# Function: injectQueuedValue()

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value, 
   options?, 
selector?): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L38)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The function returns a callable object containing:
- `queued()`: A signal-like function that provides the current queued value
- `queued.addItem(...)`: A method to enqueue additional values
- `queued.queuer`: The queuer instance with control methods and state

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### options?

`QueuerOptions`\<`TValue`\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../interfaces/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```

## Call Signature

```ts
function injectQueuedValue<TValue, TSelected>(
   value, 
   initialValue, 
   options?, 
selector?): QueuedValueSignal<TValue, TSelected>;
```

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:49](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L49)

An Angular function that creates a queued value that processes state changes in order with an optional delay.
This function uses injectQueuedSignal internally to manage a queue of state changes and apply them sequentially.

The queued value will process changes in the order they are received, with optional delays between
processing each change. This is useful for handling state updates that need to be processed
in a specific order, like animations or sequential UI updates.

The function returns a callable object containing:
- `queued()`: A signal-like function that provides the current queued value
- `queued.addItem(...)`: A method to enqueue additional values
- `queued.queuer`: The queuer instance with control methods and state

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`TValue`

#### options?

`QueuerOptions`\<`TValue`\>

#### selector?

(`state`) => `TSelected`

### Returns

[`QueuedValueSignal`](../interfaces/QueuedValueSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
const initialValue = signal('initial')
const queued = injectQueuedValue(initialValue, {
  wait: 500,
  started: true,
})

// Add changes to the queue
queued.addItem('new value')
```
