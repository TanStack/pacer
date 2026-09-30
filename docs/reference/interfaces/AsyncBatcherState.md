---
id: AsyncBatcherState
title: AsyncBatcherState
---

Defined in: [async-batcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L9)

## Type Parameters

### TValue

`TValue`

## Properties

### errorCount

```ts
errorCount: number;
```

Defined in: [async-batcher.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L13)

Number of batch executions that have resulted in errors

***

### executionCount

```ts
executionCount: number;
```

Defined in: [async-batcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L17)

Number of batch executions that have been started

***

### failedItems

```ts
failedItems: TValue[];
```

Defined in: [async-batcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L21)

Array of items that failed during batch processing

***

### isEmpty

```ts
isEmpty: boolean;
```

Defined in: [async-batcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L25)

Whether the batcher has no items to process (items array is empty)

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-batcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L29)

Whether a batch is currently being processed asynchronously

***

### isPending

```ts
isPending: boolean;
```

Defined in: [async-batcher.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L33)

Whether the batcher is waiting for the timeout to trigger batch processing

***

### items

```ts
items: TValue[];
```

Defined in: [async-batcher.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L37)

Array of items currently queued for batch processing

***

### lastResult

```ts
lastResult: any;
```

Defined in: [async-batcher.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L41)

The result from the most recent batch execution

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-batcher.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L45)

Number of batch executions that have completed (either successfully or with errors)

***

### size

```ts
size: number;
```

Defined in: [async-batcher.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L49)

Number of items currently in the batch queue

***

### status

```ts
status: "idle" | "executing" | "pending" | "populated";
```

Defined in: [async-batcher.ts:53](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L53)

Current processing status - 'idle' when not processing, 'pending' when waiting for timeout, 'executing' when processing, 'populated' when items are present, but no wait is configured

***

### successCount

```ts
successCount: number;
```

Defined in: [async-batcher.ts:57](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L57)

Number of batch executions that have completed successfully

***

### totalItemsFailed

```ts
totalItemsFailed: number;
```

Defined in: [async-batcher.ts:61](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L61)

Total number of items that have failed processing across all batches

***

### totalItemsProcessed

```ts
totalItemsProcessed: number;
```

Defined in: [async-batcher.ts:65](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L65)

Total number of items that have been processed across all batches
