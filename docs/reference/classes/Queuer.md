---
id: Queuer
title: Queuer
---

# Class: Queuer\<TValue\>

Defined in: [queuer.ts:337](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L337)

A flexible queue that processes items with configurable wait times, expiration, and priority.

This synchronous version is lighter weight and often all you need - upgrade to AsyncQueuer when you need promises, retry support, abort capabilities, concurrent execution, or advanced error handling.

Features:
- Automatic or manual processing of items
- FIFO (First In First Out), LIFO (Last In First Out), or double-ended queue behavior
- Priority-based ordering when getPriority is provided
- Item expiration and removal of stale items
- Callbacks for queue state changes, execution, rejection, and expiration
- Cross-execution deduplication via deduplicateItems (similar to RateLimiter's executionTimes)

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

## Example

```ts
// Cross-execution deduplication - prevent duplicate processing
const queuer = new Queuer<{ userId: string }>(
  (item) => fetchUser(item.userId),
  {
    deduplicateItems: true,
    getItemKey: (item) => item.userId,
    maxTrackedKeys: 500, // Limit memory usage
    onDuplicate: (item) => console.log('Already processed:', item.userId)
  }
);

queuer.addItem({ userId: 'user-1' }); // Added and processed
queuer.addItem({ userId: 'user-2' }); // Added and processed

queuer.addItem({ userId: 'user-1' }); // Skipped! Already processed
queuer.addItem({ userId: 'user-3' }); // Added and processed
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new Queuer<TValue>(fn, initialOptions): Queuer<TValue>;
```

Defined in: [queuer.ts:345](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L345)

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

Defined in: [queuer.ts:346](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L346)

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

Defined in: [queuer.ts:341](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L341)

***

### options

```ts
options: QueuerOptions<TValue>;
```

Defined in: [queuer.ts:342](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L342)

***

### store

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [queuer.ts:338](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L338)

## Methods

### addItem()

```ts
addItem(
   item, 
   position, 
   runOnItemsChange): boolean;
```

Defined in: [queuer.ts:499](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L499)

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.
When deduplicateItems is enabled, items that have already been processed will be skipped.

Returns true if the item was added, false if the queue is full or item was skipped.

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

Defined in: [queuer.ts:841](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L841)

Removes all pending items from the queue. Does not affect items being processed.

#### Returns

`void`

***

### clearProcessedKeys()

```ts
clearProcessedKeys(): void;
```

Defined in: [queuer.ts:809](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L809)

Clears all processed keys, allowing items with those keys to be processed again
Only meaningful when deduplicateItems is enabled

#### Returns

`void`

***

### execute()

```ts
execute(position?): TValue | undefined;
```

Defined in: [queuer.ts:665](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L665)

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

Defined in: [queuer.ts:687](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L687)

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

Defined in: [queuer.ts:702](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L702)

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

Defined in: [queuer.ts:613](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L613)

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

### hasProcessedKey()

```ts
hasProcessedKey(key): boolean;
```

Defined in: [queuer.ts:801](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L801)

Checks if a key has already been processed
Only meaningful when deduplicateItems is enabled

#### Parameters

##### key

`string` | `number`

#### Returns

`boolean`

***

### peekAllItems()

```ts
peekAllItems(): TValue[];
```

Defined in: [queuer.ts:785](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L785)

Returns a copy of all items in the queue.

#### Returns

`TValue`[]

***

### peekNextItem()

```ts
peekNextItem(position): TValue | undefined;
```

Defined in: [queuer.ts:775](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L775)

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

### peekProcessedKeys()

```ts
peekProcessedKeys(): (string | number)[];
```

Defined in: [queuer.ts:793](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L793)

Returns a copy of all processed keys
Only meaningful when deduplicateItems is enabled

#### Returns

(`string` \| `number`)[]

***

### reset()

```ts
reset(): void;
```

Defined in: [queuer.ts:850](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L850)

Resets the queuer state to its default values
This also clears the processed keys history

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [queuer.ts:385](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L385)

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

Defined in: [queuer.ts:816](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L816)

Starts processing items in the queue. If already isRunning, does nothing.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [queuer.ts:826](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L826)

Stops processing items in the queue. Does not clear the queue.

#### Returns

`void`
