---
id: queue
title: queue
---

# Function: queue()

```ts
function queue<TValue>(fn, initialOptions): (item, position, runOnItemsChange) => boolean;
```

Defined in: [queuer.ts:732](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L732)

Creates a queue that processes items immediately upon addition.
Items are processed sequentially in FIFO order by default.

This synchronous version is lighter weight and often all you need - upgrade to asyncQueue when you need promises, retry support, abort capabilities, concurrent execution, or advanced error handling.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the queuer
- Use `onExecute` callback to react to item execution and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the queue
- Use `onExpire` callback to react to items expiring and implement custom logic
- Use `onReject` callback to react to items being rejected when the queue is full
- The state includes execution count, expiration count, rejection count, and isRunning status
- State can be accessed via the underlying Queuer instance's `store.state` property
- When using framework adapters (React/Solid), state is accessed from the hook's state property

Example usage:
```ts
// Basic sequential processing
const processItems = queue<number>((n) => console.log(n), {
  wait: 1000,
  onItemsChange: (queuer) => console.log(queuer.peekAllItems())
});
processItems(1); // Logs: 1
processItems(2); // Logs: 2 after 1 completes

// Priority queue
const processPriority = queue<number>((n) => console.log(n), {
  getPriority: n => n // Higher numbers processed first
});
processPriority(1);
processPriority(3); // Processed before 1
```

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`item`) => `void`

### initialOptions

[`QueuerOptions`](../interfaces/QueuerOptions.md)\<`TValue`\>

## Returns

```ts
(
   item, 
   position, 
   runOnItemsChange): boolean;
```

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.

Returns true if the item was added, false if the queue is full.

Example usage:
```ts
queuer.addItem('task');
queuer.addItem('task2', 'front');
```

### Parameters

#### item

`TValue`

#### position

[`QueuePosition`](../type-aliases/QueuePosition.md) = `...`

#### runOnItemsChange

`boolean` = `true`

### Returns

`boolean`
