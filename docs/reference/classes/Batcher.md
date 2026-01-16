---
id: Batcher
title: Batcher
---

# Class: Batcher\<TValue\>

Defined in: [batcher.ts:145](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L145)

A class that collects items and processes them in batches.

Batching is a technique for grouping multiple operations together to be processed as a single unit.
This synchronous version is lighter weight and often all you need - upgrade to AsyncBatcher when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

The Batcher provides a flexible way to implement batching with configurable:
- Maximum batch size (number of items per batch)
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute
- Event callbacks for monitoring batch operations

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the batcher
- Use `onExecute` callback to react to batch execution and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the batcher
- The state includes batch execution count, total items processed, items, and running status
- State can be accessed via `batcher.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `batcher.state`

## Example

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

## Type Parameters

### TValue

`TValue`

## Constructors

### Constructor

```ts
new Batcher<TValue>(fn, initialOptions): Batcher<TValue>;
```

Defined in: [batcher.ts:153](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L153)

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

Defined in: [batcher.ts:154](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L154)

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

Defined in: [batcher.ts:149](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L149)

***

### options

```ts
options: BatcherOptionsWithOptionalCallbacks<TValue>;
```

Defined in: [batcher.ts:150](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L150)

***

### store

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [batcher.ts:146](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L146)

## Methods

### addItem()

```ts
addItem(item): void;
```

Defined in: [batcher.ts:207](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L207)

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

#### Parameters

##### item

`TValue`

#### Returns

`void`

***

### cancel()

```ts
cancel(): void;
```

Defined in: [batcher.ts:285](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L285)

Cancels any pending execution that was scheduled.
Does NOT clear out the items.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [batcher.ts:277](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L277)

Removes all items from the batcher

#### Returns

`void`

***

### flush()

```ts
flush(): void;
```

Defined in: [batcher.ts:255](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L255)

Processes the current batch of items immediately

#### Returns

`void`

***

### peekAllItems()

```ts
peekAllItems(): TValue[];
```

Defined in: [batcher.ts:263](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L263)

Returns a copy of all items in the batcher

#### Returns

`TValue`[]

***

### reset()

```ts
reset(): void;
```

Defined in: [batcher.ts:293](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L293)

Resets the batcher state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [batcher.ts:176](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/batcher.ts#L176)

Updates the batcher options

#### Parameters

##### newOptions

`Partial`\<[`BatcherOptions`](../interfaces/BatcherOptions.md)\<`TValue`\>\>

#### Returns

`void`
