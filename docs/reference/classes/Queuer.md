---
id: Queuer
title: Queuer
---

# Class: Queuer\<TValue\>

Defined in: [queuer.ts:269](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L269)

A flexible queue that processes items with configurable wait times, expiration, and priority.

This synchronous version is lighter weight and often all you need - upgrade to AsyncQueuer when you need promises, retry support, abort capabilities, concurrent execution, or advanced error handling.

Features:
- Automatic or manual processing of items
- FIFO (First In First Out), LIFO (Last In First Out), or double-ended queue behavior
- Priority-based ordering when getPriority is provided
- Item expiration and removal of stale items
- Callbacks for queue state changes, execution, rejection, and expiration

Running behavior:
- `start()`: Begins automatically processing items in the queue (defaults to isRunning)
- `stop()`: Pauses processing but maintains queue state
- `wait`: Configurable delay between processing items
- `onItemsChange`/`onExecute`: Callbacks for monitoring queue state

Manual processing is also supported when automatic processing is disabled:
- `execute()`: Processes the next item using the provided function
- `getNextItem()`: Removes and returns the next item without processing

Queue behavior defaults to FIFO:
- `addItem(item)`: Adds to the back of the queue
- Items processed from the front of the queue

Priority queue:
- Provide a `getPriority` function; higher values are processed first

Stack (LIFO):
- `addItem(item, 'back')`: Adds to the back
- `getNextItem('back')`: Removes from the back

Double-ended queue:
- `addItem(item, position)`: Adds to specified position ('front'/'back')
- `getNextItem(position)`: Removes from specified position

Item expiration:
- `expirationDuration`: Maximum time items can stay in the queue
- `getIsExpired`: Function to override default expiration
- `onExpire`: Callback for expired items

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the queuer
- Use `onExecute` callback to react to item execution and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the queue
- Use `onExpire` callback to react to items expiring and implement custom logic
- Use `onReject` callback to react to items being rejected when the queue is full
- The state includes execution count, expiration count, rejection count, and isRunning status
- State can be accessed via `queuer.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `queuer.state`

Example usage:
```ts
// Auto-processing queue with wait time
const autoQueue = new Queuer<number>((n) => console.log(n), {
  started: true, // Begin processing immediately
  wait: 1000, // Wait 1s between items
  onExecute: (item, queuer) => console.log(`Processed ${item}`)
});
autoQueue.addItem(1); // Will process after 1s
autoQueue.addItem(2); // Will process 1s after first item

// Manual processing queue
const manualQueue = new Queuer<number>((n) => console.log(n), {
  started: false
});
manualQueue.addItem(1); // [1]
manualQueue.addItem(2); // [1, 2]
manualQueue.execute(); // logs 1, queue is [2]
manualQueue.getNextItem(); // returns 2, queue is empty
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new Queuer<TValue>(fn, initialOptions): Queuer<TValue>;
```

Defined in: [queuer.ts:277](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L277)

#### Parameters

##### fn

(`item`) => `void`

##### initialOptions

[`QueuerOptions`](../interfaces/QueuerOptions.md)\<`TValue`\> = `{}`

#### Returns

`Queuer`\<`TValue`\>

## Properties

### fn()

```ts
fn: (item) => void;
```

Defined in: [queuer.ts:278](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L278)

#### Parameters

##### item

`TValue`

#### Returns

`void`

***

### key

```ts
key: string | undefined;
```

Defined in: [queuer.ts:273](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L273)

***

### options

```ts
options: QueuerOptions<TValue>;
```

Defined in: [queuer.ts:274](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L274)

***

### store

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [queuer.ts:270](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L270)

## Methods

### addItem()

```ts
addItem(
   item, 
   position, 
   runOnItemsChange): boolean;
```

Defined in: [queuer.ts:401](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L401)

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.

Returns true if the item was added, false if the queue is full.

Example usage:
```ts
queuer.addItem('task');
queuer.addItem('task2', 'front');
```

#### Parameters

##### item

`TValue`

##### position

[`QueuePosition`](../type-aliases/QueuePosition.md) = `...`

##### runOnItemsChange

`boolean` = `true`

#### Returns

`boolean`

***

### clear()

```ts
clear(): void;
```

Defined in: [queuer.ts:683](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L683)

Removes all pending items from the queue. Does not affect items being processed.

#### Returns

`void`

***

### execute()

```ts
execute(position?): TValue | undefined;
```

Defined in: [queuer.ts:537](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L537)

Removes and returns the next item from the queue and processes it using the provided function.

Example usage:
```ts
queuer.execute();
// LIFO
queuer.execute('back');
```

#### Parameters

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md)

#### Returns

`TValue` \| `undefined`

***

### flush()

```ts
flush(numberOfItems, position?): void;
```

Defined in: [queuer.ts:553](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L553)

Processes a specified number of items to execute immediately with no wait time
If no numberOfItems is provided, all items will be processed

#### Parameters

##### numberOfItems

`number` = `...`

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md)

#### Returns

`void`

***

### flushAsBatch()

```ts
flushAsBatch(batchFunction): void;
```

Defined in: [queuer.ts:568](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L568)

Processes all items in the queue as a batch using the provided function as an argument
The queue is cleared after processing

#### Parameters

##### batchFunction

(`items`) => `void`

#### Returns

`void`

***

### getNextItem()

```ts
getNextItem(position): TValue | undefined;
```

Defined in: [queuer.ts:485](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L485)

Removes and returns the next item from the queue without executing the function.
Use for manual queue management. Normally, use execute() to process items.

Example usage:
```ts
// FIFO
queuer.getNextItem();
// LIFO
queuer.getNextItem('back');
```

#### Parameters

##### position

[`QueuePosition`](../type-aliases/QueuePosition.md) = `...`

#### Returns

`TValue` \| `undefined`

***

### peekAllItems()

```ts
peekAllItems(): TValue[];
```

Defined in: [queuer.ts:651](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L651)

Returns a copy of all items in the queue.

#### Returns

`TValue`[]

***

### peekNextItem()

```ts
peekNextItem(position): TValue | undefined;
```

Defined in: [queuer.ts:641](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L641)

Returns the next item in the queue without removing it.

Example usage:
```ts
queuer.peekNextItem(); // front
queuer.peekNextItem('back'); // back
```

#### Parameters

##### position

[`QueuePosition`](../type-aliases/QueuePosition.md) = `'front'`

#### Returns

`TValue` \| `undefined`

***

### reset()

```ts
reset(): void;
```

Defined in: [queuer.ts:691](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L691)

Resets the queuer state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [queuer.ts:317](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L317)

Updates the queuer options. New options are merged with existing options.

#### Parameters

##### newOptions

`Partial`\<[`QueuerOptions`](../interfaces/QueuerOptions.md)\<`TValue`\>\>

#### Returns

`void`

***

### start()

```ts
start(): void;
```

Defined in: [queuer.ts:658](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L658)

Starts processing items in the queue. If already isRunning, does nothing.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [queuer.ts:668](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L668)

Stops processing items in the queue. Does not clear the queue.

#### Returns

`void`
