---
id: AsyncQueuerState
title: AsyncQueuerState
---

# Interface: AsyncQueuerState\<TValue\>

Defined in: [async-queuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L9)

## Type Parameters

### TValue

`TValue`

## Properties

### activeItems

```ts
activeItems: TValue[];
```

Defined in: [async-queuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L13)

Items currently being processed by the queuer

***

### addItemCount

```ts
addItemCount: number;
```

Defined in: [async-queuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L17)

Number of times addItem has been called (for reduction calculations)

***

### errorCount

```ts
errorCount: number;
```

Defined in: [async-queuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L21)

Number of task executions that have resulted in errors

***

### executeCount

```ts
executeCount: number;
```

Defined in: [async-queuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L25)

Number of times execute has been called

***

### expirationCount

```ts
expirationCount: number;
```

Defined in: [async-queuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L29)

Number of items that have been removed from the queue due to expiration

***

### isEmpty

```ts
isEmpty: boolean;
```

Defined in: [async-queuer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L33)

Whether the queuer has no items to process (items array is empty)

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-queuer.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L37)

Whether the queuer is currently executing

***

### isFull

```ts
isFull: boolean;
```

Defined in: [async-queuer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L41)

Whether the queuer has reached its maximum capacity

***

### isIdle

```ts
isIdle: boolean;
```

Defined in: [async-queuer.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L45)

Whether the queuer is not currently processing any items

***

### isRunning

```ts
isRunning: boolean;
```

Defined in: [async-queuer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L49)

Whether the queuer is active and will process items automatically

***

### items

```ts
items: TValue[];
```

Defined in: [async-queuer.ts:53](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L53)

Array of items currently waiting to be processed

***

### itemTimestamps

```ts
itemTimestamps: number[];
```

Defined in: [async-queuer.ts:57](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L57)

Timestamps when items were added to the queue for expiration tracking

***

### lastResult

```ts
lastResult: any;
```

Defined in: [async-queuer.ts:61](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L61)

The result from the most recent task execution

***

### pendingTick

```ts
pendingTick: boolean;
```

Defined in: [async-queuer.ts:65](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L65)

Whether the queuer has a pending timeout for processing the next item

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [async-queuer.ts:69](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L69)

Number of items that have been rejected from being added to the queue

***

### settledCount

```ts
settledCount: number;
```

Defined in: [async-queuer.ts:73](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L73)

Number of task executions that have completed (either successfully or with errors)

***

### size

```ts
size: number;
```

Defined in: [async-queuer.ts:77](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L77)

Number of items currently in the queue

***

### status

```ts
status: "idle" | "running" | "stopped";
```

Defined in: [async-queuer.ts:81](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L81)

Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused

***

### successCount

```ts
successCount: number;
```

Defined in: [async-queuer.ts:85](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L85)

Number of task executions that have completed successfully
