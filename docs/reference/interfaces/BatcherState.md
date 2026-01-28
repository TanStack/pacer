---
id: BatcherState
title: BatcherState
---

# Interface: BatcherState\<TValue\>

Defined in: [batcher.ts:6](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L6)

## Type Parameters

### TValue

`TValue`

## Properties

### executionCount

```ts
executionCount: number;
```

Defined in: [batcher.ts:10](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L10)

Number of batch executions that have been completed

***

### isEmpty

```ts
isEmpty: boolean;
```

Defined in: [batcher.ts:14](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L14)

Whether the batcher has no items to process (items array is empty)

***

### isPending

```ts
isPending: boolean;
```

Defined in: [batcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L18)

Whether the batcher is waiting for the timeout to trigger batch processing

***

### items

```ts
items: TValue[];
```

Defined in: [batcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L22)

Array of items currently queued for batch processing

***

### processedKeys

```ts
processedKeys: (string | number)[];
```

Defined in: [batcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L27)

Array of keys that have been processed (for cross-batch deduplication)
Only populated when deduplicateItems is enabled

***

### size

```ts
size: number;
```

Defined in: [batcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L31)

Number of items currently in the batch queue

***

### status

```ts
status: "idle" | "pending";
```

Defined in: [batcher.ts:35](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L35)

Current processing status - 'idle' when not processing, 'pending' when waiting for timeout

***

### totalItemsProcessed

```ts
totalItemsProcessed: number;
```

Defined in: [batcher.ts:39](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L39)

Total number of items that have been processed across all batches
