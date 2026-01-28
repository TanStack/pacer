---
id: Batcher
title: Batcher
---

# Class: Batcher\<TValue\>

Defined in: [batcher.ts:217](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L217)

A class that collects items and processes them in batches.

Batching is a technique for grouping multiple operations together to be processed as a single unit.
This synchronous version is lighter weight and often all you need - upgrade to AsyncBatcher when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

The Batcher provides a flexible way to implement batching with configurable:
- Maximum batch size (number of items per batch)
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute
- Event callbacks for monitoring batch operations
- Cross-batch deduplication via deduplicateItems (similar to RateLimiter's executionTimes)

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the batcher
- Use `onExecute` callback to react to batch execution and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the batcher
- The state includes batch execution count, total items processed, items, and running status
- State can be accessed via `batcher.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `batcher.state`

## Examples

```ts
const batcher = new Batcher<number>(
  (items) => console.log('Processing batch:', items),
  {
    maxSize: 5,
    wait: 2000,
    onExecute: (batch, batcher) => console.log('Batch executed:', batch)
  }
);

batcher.addItem(1);
batcher.addItem(2);
// After 2 seconds or when 5 items are added, whichever comes first,
// the batch will be processed
// batcher.flush() // manually trigger a batch
```

```ts
// Cross-batch deduplication - prevent duplicate API calls
const batcher = new Batcher<{ userId: string }>(
  (items) => fetchUsers(items.map(i => i.userId)),
  {
    deduplicateItems: true,
    getItemKey: (item) => item.userId,
    maxTrackedKeys: 500, // Limit memory usage
    onDuplicate: (item) => console.log('Already fetched:', item.userId)
  }
);

batcher.addItem({ userId: 'user-1' }); // Added to batch
batcher.addItem({ userId: 'user-2' }); // Added to batch
batcher.flush(); // Processes [user-1, user-2]

batcher.addItem({ userId: 'user-1' }); // Skipped! Already processed
batcher.addItem({ userId: 'user-3' }); // Added to batch
```

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new Batcher<TValue>(fn, initialOptions): Batcher<TValue>;
```

Defined in: [batcher.ts:225](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L225)

#### Parameters

##### fn

(`items`) => `void`

##### initialOptions

[`BatcherOptions`](../interfaces/BatcherOptions.md)\<`TValue`\>

#### Returns

`Batcher`\<`TValue`\>

## Properties

### fn()

```ts
fn: (items) => void;
```

Defined in: [batcher.ts:226](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L226)

#### Parameters

##### items

`TValue`[]

#### Returns

`void`

***

### key

```ts
key: string | undefined;
```

Defined in: [batcher.ts:221](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L221)

***

### options

```ts
options: BatcherOptionsWithOptionalCallbacks<TValue>;
```

Defined in: [batcher.ts:222](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L222)

***

### store

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [batcher.ts:218](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L218)

## Methods

### addItem()

```ts
addItem(item): boolean;
```

Defined in: [batcher.ts:311](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L311)

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed
When deduplicateItems is enabled, items that have already been processed will be skipped

#### Parameters

##### item

`TValue`

#### Returns

`boolean`

***

### cancel()

```ts
cancel(): void;
```

Defined in: [batcher.ts:449](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L449)

Cancels any pending execution that was scheduled.
Does NOT clear out the items.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [batcher.ts:441](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L441)

Removes all items from the batcher

#### Returns

`void`

***

### clearProcessedKeys()

```ts
clearProcessedKeys(): void;
```

Defined in: [batcher.ts:427](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L427)

Clears all processed keys, allowing items with those keys to be processed again
Only meaningful when deduplicateItems is enabled

#### Returns

`void`

***

### flush()

```ts
flush(): void;
```

Defined in: [batcher.ts:395](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L395)

Processes the current batch of items immediately

#### Returns

`void`

***

### hasProcessedKey()

```ts
hasProcessedKey(key): boolean;
```

Defined in: [batcher.ts:419](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L419)

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

Defined in: [batcher.ts:403](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L403)

Returns a copy of all items in the batcher

#### Returns

`TValue`[]

***

### peekProcessedKeys()

```ts
peekProcessedKeys(): (string | number)[];
```

Defined in: [batcher.ts:411](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L411)

Returns a copy of all processed keys
Only meaningful when deduplicateItems is enabled

#### Returns

(`string` \| `number`)[]

***

### reset()

```ts
reset(): void;
```

Defined in: [batcher.ts:458](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L458)

Resets the batcher state to its default values
This also clears the processed keys history

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [batcher.ts:248](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L248)

Updates the batcher options

#### Parameters

##### newOptions

`Partial`\<[`BatcherOptions`](../interfaces/BatcherOptions.md)\<`TValue`\>\>

#### Returns

`void`
