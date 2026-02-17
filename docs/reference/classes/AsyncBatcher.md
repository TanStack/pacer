---
id: AsyncBatcher
title: AsyncBatcher
---

# Class: AsyncBatcher\<TValue\>

Defined in: [async-batcher.ts:272](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L272)

A class that collects items and processes them in batches asynchronously.

Async vs Sync Versions:
The async version provides advanced features over the sync Batcher:
- Returns promises that can be awaited for batch results
- Built-in retry support via AsyncRetryer integration
- Abort support to cancel in-flight batch executions
- Cancel support to prevent pending batches from starting
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts)

The sync Batcher is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Batching?
Batching is a technique for grouping multiple operations together to be processed as a single unit.

The AsyncBatcher provides a flexible way to implement async batching with configurable:
- Maximum batch size (number of items per batch)
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute
- Event callbacks for monitoring batch operations
- Error handling for failed batch operations

Error Handling:
- If an `onError` handler is provided, it will be called with the error, the batch of items that failed, and batcher instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the AsyncBatcher instance

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the async batcher
- Use `onSuccess` callback to react to successful batch execution and implement custom logic
- Use `onError` callback to react to batch execution errors and implement custom error handling
- Use `onSettled` callback to react to batch execution completion (success or error) and implement custom logic
- Use `onExecute` callback to react to batch execution and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the batcher
- The state includes total items processed, success/error counts, and execution status
- State can be accessed via `asyncBatcher.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `asyncBatcher.state`

## Example

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    const result = await processItems(items);
    console.log('Processing batch:', items);
    return result;
  },
  {
    maxSize: 5,
    wait: 2000,
    onSuccess: (result) => console.log('Batch succeeded:', result),
    onError: (error) => console.error('Batch failed:', error)
  }
);

batcher.addItem(1);
batcher.addItem(2);
// After 2 seconds or when 5 items are added, whichever comes first,
// the batch will be processed and the result will be available
// batcher.execute() // manually trigger a batch
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new AsyncBatcher<TValue>(fn, initialOptions): AsyncBatcher<TValue>;
```

Defined in: [async-batcher.ts:284](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L284)

#### Parameters

##### fn

(`items`) => `Promise`\<`any`\>

##### initialOptions

[`AsyncBatcherOptions`](../interfaces/AsyncBatcherOptions.md)\<`TValue`\>

#### Returns

`AsyncBatcher`\<`TValue`\>

## Properties

### asyncRetryers

```ts
asyncRetryers: Map<number, AsyncRetryer<(items) => Promise<any>>>;
```

Defined in: [async-batcher.ts:278](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L278)

***

### fn()

```ts
fn: (items) => Promise<any>;
```

Defined in: [async-batcher.ts:285](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L285)

#### Parameters

##### items

`TValue`[]

#### Returns

`Promise`\<`any`\>

***

### key

```ts
key: string | undefined;
```

Defined in: [async-batcher.ts:276](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L276)

***

### options

```ts
options: AsyncBatcherOptionsWithOptionalCallbacks<TValue>;
```

Defined in: [async-batcher.ts:277](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L277)

***

### store

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [async-batcher.ts:273](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L273)

## Methods

### abort()

```ts
abort(): void;
```

Defined in: [async-batcher.ts:497](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L497)

Aborts all ongoing executions with the internal abort controllers.
Does NOT cancel any pending execution that have not started yet.
Does NOT clear out the items.

#### Returns

`void`

***

### addItem()

```ts
addItem(item): Promise<any>;
```

Defined in: [async-batcher.ts:349](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L349)

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

#### Parameters

##### item

`TValue`

#### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

#### Throws

The error from the batch function if no onError handler is configured or throwOnError is true

***

### cancel()

```ts
cancel(): void;
```

Defined in: [async-batcher.ts:510](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L510)

Cancels any pending execution that have not started yet.
Does NOT abort any execution already in progress.
Does NOT clear out the items.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [async-batcher.ts:458](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L458)

Removes all items from the async batcher

#### Returns

`void`

***

### flush()

```ts
flush(): Promise<any>;
```

Defined in: [async-batcher.ts:432](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L432)

Processes the current batch of items immediately

#### Returns

`Promise`\<`any`\>

***

### getAbortSignal()

```ts
getAbortSignal(executeCount?): AbortSignal | null;
```

Defined in: [async-batcher.ts:486](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L486)

Returns the AbortSignal for a specific execution.
If no executeCount is provided, returns the signal for the most recent execution.
Returns null if no execution is found or not currently executing.

#### Parameters

##### executeCount?

`number`

Optional specific execution to get signal for

#### Returns

`AbortSignal` \| `null`

#### Example

```typescript
const batcher = new AsyncBatcher(
  async (items: string[]) => {
    const signal = batcher.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify(items),
        signal
      })
      return response.json()
    }
  },
  { maxSize: 10, wait: 100 }
)
```

***

### peekAllItems()

```ts
peekAllItems(): TValue[];
```

Defined in: [async-batcher.ts:440](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L440)

Returns a copy of all items in the async batcher

#### Returns

`TValue`[]

***

### peekFailedItems()

```ts
peekFailedItems(): TValue[];
```

Defined in: [async-batcher.ts:444](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L444)

#### Returns

`TValue`[]

***

### reset()

```ts
reset(): void;
```

Defined in: [async-batcher.ts:520](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L520)

Resets the async batcher state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-batcher.ts:308](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L308)

Updates the async batcher options

#### Parameters

##### newOptions

`Partial`\<[`AsyncBatcherOptions`](../interfaces/AsyncBatcherOptions.md)\<`TValue`\>\>

#### Returns

`void`
