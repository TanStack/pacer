---
id: BatcherOptions
title: BatcherOptions
---

# Interface: BatcherOptions\<TValue\>

Defined in: [batcher.ts:58](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L58)

Options for configuring a Batcher instance

## Type Parameters

### TValue

`TValue`

## Properties

### deduplicateItems?

```ts
optional deduplicateItems: boolean;
```

Defined in: [batcher.ts:65](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L65)

Enable automatic deduplication of items across batches
When enabled, items that have already been processed will be automatically skipped
The keys of processed items are tracked in state.processedKeys

#### Default

```ts
false
```

***

### deduplicateStrategy?

```ts
optional deduplicateStrategy: "keep-first" | "keep-last";
```

Defined in: [batcher.ts:73](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L73)

Strategy to use when a duplicate item is detected in the current batch
- 'keep-first': Keep the existing item and ignore the new one (default)
- 'keep-last': Replace the existing item with the new one
Note: This only affects duplicates within the same batch, not across batches

#### Default

```ts
'keep-first'
```

***

### getItemKey()?

```ts
optional getItemKey: (item) => string | number;
```

Defined in: [batcher.ts:83](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L83)

Function to extract a unique key from each item for deduplication
If not provided, uses the item itself for primitives or JSON.stringify for objects

#### Parameters

##### item

`TValue`

#### Returns

`string` \| `number`

***

### getShouldExecute()?

```ts
optional getShouldExecute: (items, batcher) => boolean;
```

Defined in: [batcher.ts:78](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L78)

Custom function to determine if a batch should be processed
Return true to process the batch immediately

#### Parameters

##### items

`TValue`[]

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`boolean`

***

### initialState?

```ts
optional initialState: Partial<BatcherState<TValue>>;
```

Defined in: [batcher.ts:87](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L87)

Initial state for the batcher

***

### key?

```ts
optional key: string;
```

Defined in: [batcher.ts:92](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L92)

Optional key to identify this batcher instance.
If provided, the batcher will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxSize?

```ts
optional maxSize: number;
```

Defined in: [batcher.ts:97](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L97)

Maximum number of items in a batch

#### Default

```ts
Infinity
```

***

### maxTrackedKeys?

```ts
optional maxTrackedKeys: number;
```

Defined in: [batcher.ts:104](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L104)

Maximum number of processed keys to track (prevents memory leaks)
When limit is reached, oldest keys are removed (FIFO)
Only used when deduplicateItems is enabled

#### Default

```ts
1000
```

***

### onDuplicate()?

```ts
optional onDuplicate: (newItem, existingItem, batcher) => void;
```

Defined in: [batcher.ts:109](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L109)

Callback fired when a duplicate item is detected
Called both for in-batch duplicates and cross-batch duplicates

#### Parameters

##### newItem

`TValue`

##### existingItem

`TValue` | `undefined`

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`void`

***

### onExecute()?

```ts
optional onExecute: (batch, batcher) => void;
```

Defined in: [batcher.ts:117](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L117)

Callback fired after a batch is processed

#### Parameters

##### batch

`TValue`[]

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`void`

***

### onItemsChange()?

```ts
optional onItemsChange: (batcher) => void;
```

Defined in: [batcher.ts:121](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L121)

Callback fired after items are added to the batcher

#### Parameters

##### batcher

[`Batcher`](../classes/Batcher.md)\<`TValue`\>

#### Returns

`void`

***

### started?

```ts
optional started: boolean;
```

Defined in: [batcher.ts:126](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L126)

Whether the batcher should start processing immediately

#### Default

```ts
true
```

***

### wait?

```ts
optional wait: number | (batcher) => number;
```

Defined in: [batcher.ts:133](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L133)

Maximum time in milliseconds to wait before processing a batch.
If the wait duration has elapsed, the batch will be processed.
If not provided, the batch will not be triggered by a timeout.

#### Default

```ts
Infinity
```
