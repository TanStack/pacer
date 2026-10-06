---
id: injectAsyncQueuedSignal
title: injectAsyncQueuedSignal
---

## Call Signature

```ts
function injectAsyncQueuedSignal<TValue, TSelected>(
   fn,
   options,
selector): AsyncQueuedSignal<TValue, TSelected>;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:55](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L55)

An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or processed in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a callable object:
- `queued()`: Get the current queue items as an array
- `queued.addItem(...)`: Add an item to the queue
- `queued.queue`: The queuer instance with additional control methods

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### fn

(`value`) => `Promise`\<`any`\>

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`AsyncQueuerOptions`\<`TValue`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AsyncQueuedSignal`](../type-aliases/AsyncQueuedSignal.md)\<`TValue`, `TSelected`\>

### Example

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

## Call Signature

```ts
function injectAsyncQueuedSignal<TValue>(
   fn,
   options?,
selector?): AsyncQueuedSignal<TValue, Pick<AsyncQueuerState<TValue>, "items">>;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:63](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L63)

An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or processed in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a callable object:
- `queued()`: Get the current queue items as an array
- `queued.addItem(...)`: Add an item to the queue
- `queued.queue`: The queuer instance with additional control methods

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`value`) => `Promise`\<`any`\>

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`AsyncQueuerOptions`\<`TValue`\>\>

#### selector?

`undefined`

### Returns

[`AsyncQueuedSignal`](../type-aliases/AsyncQueuedSignal.md)\<`TValue`, `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>\>

### Example

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

## Call Signature

```ts
function injectAsyncQueuedSignal<TValue, TSelected>(
   fn,
   options?,
selector?): AsyncQueuedSignal<TValue, TSelected | Pick<AsyncQueuerState<TValue>, "items">>;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:68](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L68)

An Angular function that creates an async queuer with managed state, combining Angular's signals with async queuing functionality.
This function provides both the current queue state and queue control methods.

The queue state is automatically updated whenever items are added, removed, or processed in the queue.
All queue operations are reflected in the state array returned by the function.

The function returns a callable object:
- `queued()`: Get the current queue items as an array
- `queued.addItem(...)`: Add an item to the queue
- `queued.queue`: The queuer instance with additional control methods

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

### Parameters

#### fn

(`value`) => `Promise`\<`any`\>

#### options?

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`AsyncQueuerOptions`\<`TValue`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AsyncQueuedSignal`](../type-aliases/AsyncQueuedSignal.md)\<`TValue`, `TSelected` \| `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>\>

### Example

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
