---
id: QueuerState
title: QueuerState
---

# Interface: QueuerState\<TValue\>

Defined in: [queuer.ts:5](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L5)

## Type Parameters

### TValue

`TValue`

## Properties

### addItemCount

```ts
addItemCount: number;
```

Defined in: [queuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L9)

Number of times addItem has been called (for reduction calculations)

***

### executionCount

```ts
executionCount: number;
```

Defined in: [queuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L13)

Number of items that have been processed by the queuer

***

### expirationCount

```ts
expirationCount: number;
```

Defined in: [queuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L17)

Number of items that have been removed from the queue due to expiration

***

### isEmpty

```ts
isEmpty: boolean;
```

Defined in: [queuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L21)

Whether the queuer has no items to process (items array is empty)

***

### isFull

```ts
isFull: boolean;
```

Defined in: [queuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L25)

Whether the queuer has reached its maximum capacity

***

### isIdle

```ts
isIdle: boolean;
```

Defined in: [queuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L29)

Whether the queuer is not currently processing any items

***

### isRunning

```ts
isRunning: boolean;
```

Defined in: [queuer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L33)

Whether the queuer is active and will process items automatically

***

### items

```ts
items: TValue[];
```

Defined in: [queuer.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L37)

Array of items currently waiting to be processed

***

### itemTimestamps

```ts
itemTimestamps: number[];
```

Defined in: [queuer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L41)

Timestamps when items were added to the queue for expiration tracking

***

### pendingTick

```ts
pendingTick: boolean;
```

Defined in: [queuer.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L45)

Whether the queuer has a pending timeout for processing the next item

***

### processedKeys

```ts
processedKeys: (string | number)[];
```

Defined in: [queuer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L50)

Array of keys that have been processed (for cross-execution deduplication)
Only populated when deduplicateItems is enabled

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [queuer.ts:54](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L54)

Number of items that have been rejected from being added to the queue

***

### size

```ts
size: number;
```

Defined in: [queuer.ts:58](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L58)

Number of items currently in the queue

***

### status

```ts
status: "idle" | "running" | "stopped";
```

Defined in: [queuer.ts:62](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L62)

Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused
