---
id: AsyncQueuerState
title: AsyncQueuerState
---

Defined in: [async-queuer.ts:10](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L10)

## Type Parameters

### TValue

`TValue`

## Properties

### activeItems

```ts
activeItems: TValue[];
```

Defined in: [async-queuer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L14)

Items currently being processed by the queuer

***

### addItemCount

```ts
addItemCount: number;
```

Defined in: [async-queuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L18)

Number of times addItem has been called (for reduction calculations)

***

### errorCount

```ts
errorCount: number;
```

Defined in: [async-queuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L22)

Number of task executions that have resulted in errors

***

### executionCount

```ts
executionCount: number;
```

Defined in: [async-queuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L26)

Number of times execute has been called

***

### expirationCount

```ts
expirationCount: number;
```

Defined in: [async-queuer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L30)

Number of items that have been removed from the queue due to expiration

***

### isEmpty

```ts
isEmpty: boolean;
```

Defined in: [async-queuer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L34)

Whether the queuer has no items to process (items array is empty)

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-queuer.ts:38](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L38)

Whether the queuer is currently executing

***

### isFull

```ts
isFull: boolean;
```

Defined in: [async-queuer.ts:42](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L42)

Whether the queuer has reached its maximum capacity

***

### isIdle

```ts
isIdle: boolean;
```

Defined in: [async-queuer.ts:46](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L46)

Whether the queuer is not currently processing any items

***

### isRunning

```ts
isRunning: boolean;
```

Defined in: [async-queuer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L50)

Whether the queuer is active and will process items automatically

***

### items

```ts
items: TValue[];
```

Defined in: [async-queuer.ts:54](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L54)

Array of items currently waiting to be processed

***

### itemTimestamps

```ts
itemTimestamps: number[];
```

Defined in: [async-queuer.ts:58](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L58)

Timestamps when items were added to the queue for expiration tracking

***

### lastResult

```ts
lastResult: any;
```

Defined in: [async-queuer.ts:62](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L62)

The result from the most recent task execution

***

### pendingTick

```ts
pendingTick: boolean;
```

Defined in: [async-queuer.ts:66](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L66)

Whether the queuer has a pending timeout for processing the next item

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [async-queuer.ts:70](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L70)

Number of items that have been rejected from being added to the queue

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-queuer.ts:74](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L74)

Number of task executions that have completed (either successfully or with errors)

***

### size

```ts
size: number;
```

Defined in: [async-queuer.ts:78](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L78)

Number of items currently in the queue

***

### status

```ts
status: "idle" | "running" | "stopped";
```

Defined in: [async-queuer.ts:82](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L82)

Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused

***

### successCount

```ts
successCount: number;
```

Defined in: [async-queuer.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L86)

Number of task executions that have completed successfully
