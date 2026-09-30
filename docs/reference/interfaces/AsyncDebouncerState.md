---
id: AsyncDebouncerState
title: AsyncDebouncerState
---

Defined in: [async-debouncer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L9)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### canLeadingExecute

```ts
canLeadingExecute: boolean;
```

Defined in: [async-debouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L13)

Whether the debouncer can execute on the leading edge of the timeout

***

### errorCount

```ts
errorCount: number;
```

Defined in: [async-debouncer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L17)

Number of function executions that have resulted in errors

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-debouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L21)

Whether the debounced function is currently executing asynchronously

***

### isPending

```ts
isPending: boolean;
```

Defined in: [async-debouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L25)

Whether the debouncer is waiting for the timeout to trigger execution

***

### lastArgs

```ts
lastArgs: Parameters<TFn> | undefined;
```

Defined in: [async-debouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L29)

The arguments from the most recent call to maybeExecute

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-debouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L33)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-debouncer.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L37)

Number of times maybeExecute has been called (for reduction calculations)

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-debouncer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L41)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "executing" | "pending" | "settled";
```

Defined in: [async-debouncer.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L45)

Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed

***

### successCount

```ts
successCount: number;
```

Defined in: [async-debouncer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L49)

Number of function executions that have completed successfully
