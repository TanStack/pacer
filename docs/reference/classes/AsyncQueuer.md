---
id: AsyncQueuer
title: AsyncQueuer
---

Defined in: [async-queuer.ts:316](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L316)

A flexible asynchronous queue for processing tasks with configurable concurrency, priority, and expiration.

Async vs Sync Versions:
The async version provides advanced features over the sync Queuer:
- Returns promises that can be awaited for task results
- Built-in retry support via AsyncRetryer integration for each queued task
- Abort support to cancel in-flight task executions
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts)
- Concurrent execution support (process multiple items simultaneously)

The sync Queuer is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Queuing?
Queuing is a technique for managing and processing items sequentially or with controlled concurrency.
Tasks are processed up to the configured concurrency limit. When a task completes,
the next pending task is processed if the concurrency limit allows.

Key Features:
- Priority queue support via the getPriority option
- Configurable concurrency limit
- Callbacks for task success, error, completion, and queue state changes
- FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
- Pause and resume processing
- Item expiration to remove stale items from the queue

Error Handling:
- If an `onError` handler is provided, it will be called with the error and queuer instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together; the handler will be called before any error is thrown
- The error state can be checked using the AsyncQueuer instance

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the async queuer
- Use `onSuccess` callback to react to successful task execution and implement custom logic
- Use `onError` callback to react to task execution errors and implement custom error handling
- Use `onSettled` callback to react to task execution completion (success or error) and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the queue
- Use `onExpire` callback to react to items expiring and implement custom logic
- Use `onReject` callback to react to items being rejected when the queue is full
- The state includes error count, expiration count, rejection count, running status, and success/settle counts
- State can be accessed via `asyncQueuer.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `asyncQueuer.state`

Example usage:
```ts
const asyncQueuer = new AsyncQueuer<string>(async (item) => {
  // process item
  return item.toUpperCase();
}, {
  concurrency: 2,
  onSuccess: (result) => {
    console.log(result);
  }
});

asyncQueuer.addItem('hello');
asyncQueuer.start();
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new AsyncQueuer<TValue>(fn, initialOptions?): AsyncQueuer<TValue>;
```

Defined in: [async-queuer.ts:330](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L330)

#### Parameters

##### fn

(`item`) => `Promise`\<`any`\>

##### initialOptions?

[`AsyncQueuerOptions`](../interfaces/AsyncQueuerOptions.md)\<`TValue`\> = `{}`

#### Returns

`AsyncQueuer`\<`TValue`\>

## Properties

### asyncRetryers

```ts
asyncRetryers: Map<number, AsyncRetryer<(item) => Promise<any>>>;
```

Defined in: [async-queuer.ts:322](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L322)

***

### fn

```ts
fn: (item) => Promise<any>;
```

Defined in: [async-queuer.ts:331](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L331)

#### Parameters

##### item

`TValue`

#### Returns

`Promise`\<`any`\>

***

### key

```ts
key: string | undefined;
```

Defined in: [async-queuer.ts:320](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L320)

***

### options

```ts
options: AsyncQueuerOptions<TValue>;
```

Defined in: [async-queuer.ts:321](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L321)

***

### store

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [async-queuer.ts:317](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L317)

## Methods

### abort()

```ts
abort(): void;
```

Defined in: [async-queuer.ts:936](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L936)

Aborts all ongoing executions with the internal abort controllers.
Does NOT clear out the items.

#### Returns

`void`

***

### addItem()

```ts
addItem(
   item,
   position?,
   runOnItemsChange?): boolean;
```

Defined in: [async-queuer.ts:499](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L499)

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.
`undefined` cannot be queued (it is the internal "no item" sentinel) and is always rejected.

#### Parameters

##### item

`TValue`

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md) = `...`

##### runOnItemsChange?

`boolean` = `true`

#### Returns

`boolean`

#### Example

```ts
queuer.addItem({ value: 'task', priority: 10 });
queuer.addItem('task2', 'front');
```

***

### clear()

```ts
clear(): void;
```

Defined in: [async-queuer.ts:897](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L897)

Removes all pending items from the queue.
Does NOT affect active tasks.

#### Returns

`void`

***

### execute()

```ts
execute(position?): Promise<any>;
```

Defined in: [async-queuer.ts:651](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L651)

Removes and returns the next item from the queue and executes the task function with it.

#### Parameters

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md)

#### Returns

`Promise`\<`any`\>

#### Example

```ts
queuer.execute();
// LIFO
queuer.execute('back');
```

***

### flush()

```ts
flush(numberOfItems?, position?): Promise<void>;
```

Defined in: [async-queuer.ts:722](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L722)

Processes a specified number of items to execute immediately with no wait time
If no numberOfItems is provided, all items will be processed

#### Parameters

##### numberOfItems?

`number` = `...`

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md)

#### Returns

`Promise`\<`void`\>

***

### flushAsBatch()

```ts
flushAsBatch(batchFunction): Promise<void>;
```

Defined in: [async-queuer.ts:759](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L759)

Processes all items in the queue as a batch using the provided function as an argument
The queue is cleared after processing

#### Parameters

##### batchFunction

(`items`) => `Promise`\<`any`\>

#### Returns

`Promise`\<`void`\>

***

### getAbortSignal()

```ts
getAbortSignal(executionCount?): AbortSignal | null;
```

Defined in: [async-queuer.ts:924](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L924)

Returns the AbortSignal for a specific execution.
If no executionCount is provided, returns the signal for the latest active execution.
Capture the signal before awaiting work, since another execution may start meanwhile.
Explicit counts refer to executions started since the most recent reset().
Returns null if no execution is found or not currently executing.

#### Parameters

##### executionCount?

`number`

Optional specific execution to get signal for

#### Returns

`AbortSignal` \| `null`

#### Example

```typescript
const queuer = new AsyncQueuer(
  async (item: string) => {
    const signal = queuer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/process/${item}`, { signal })
      return response.json()
    }
  },
  { concurrency: 2 }
)
```

***

### getNextItem()

```ts
getNextItem(position?): TValue | undefined;
```

Defined in: [async-queuer.ts:599](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L599)

Removes and returns the next item from the queue without executing the task function.
Use for manual queue management. Normally, use execute() to process items.

#### Parameters

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md) = `...`

#### Returns

`TValue` \| `undefined`

#### Example

```ts
// FIFO
queuer.getNextItem();
// LIFO
queuer.getNextItem('back');
```

***

### peekActiveItems()

```ts
peekActiveItems(): TValue[];
```

Defined in: [async-queuer.ts:859](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L859)

Returns the items currently being processed (active tasks).

#### Returns

`TValue`[]

***

### peekAllItems()

```ts
peekAllItems(): TValue[];
```

Defined in: [async-queuer.ts:852](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L852)

Returns a copy of all items in the queue, including active and pending items.

#### Returns

`TValue`[]

***

### peekNextItem()

```ts
peekNextItem(position?): TValue | undefined;
```

Defined in: [async-queuer.ts:842](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L842)

Returns the next item in the queue without removing it.

#### Parameters

##### position?

[`QueuePosition`](../type-aliases/QueuePosition.md) = `'front'`

#### Returns

`TValue` \| `undefined`

#### Example

```ts
queuer.peekNextItem(); // front
queuer.peekNextItem('back'); // back
```

***

### peekPendingItems()

```ts
peekPendingItems(): TValue[];
```

Defined in: [async-queuer.ts:866](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L866)

Returns the items waiting to be processed (pending tasks).

#### Returns

`TValue`[]

***

### reset()

```ts
reset(): void;
```

Defined in: [async-queuer.ts:951](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L951)

Clears pending items and counters and restores automatic processing.
Active executions remain abortable and retain their concurrency slots until
they settle. Existing wait timers remain scheduled. Explicit execution count
lookups start over after reset().

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-queuer.ts:375](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L375)

Updates the queuer options. New options are merged with existing options.

#### Parameters

##### newOptions

`Partial`\<[`AsyncQueuerOptions`](../interfaces/AsyncQueuerOptions.md)\<`TValue`\>\>

#### Returns

`void`

***

### start()

```ts
start(): void;
```

Defined in: [async-queuer.ts:873](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L873)

Starts processing items in the queue. If already running, does nothing.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [async-queuer.ts:883](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L883)

Stops processing items in the queue. Does not clear the queue.

#### Returns

`void`
