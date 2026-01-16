---
id: AsyncDebouncerState
title: AsyncDebouncerState
---

# Interface: AsyncDebouncerState\<TFn\>

Defined in: [async-debouncer.ts:8](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L8)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### canLeadingExecute

```ts
canLeadingExecute: boolean;
```

Defined in: [async-debouncer.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L12)

Whether the debouncer can execute on the leading edge of the timeout

***

### errorCount

```ts
errorCount: number;
```

Defined in: [async-debouncer.ts:16](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L16)

Number of function executions that have resulted in errors

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-debouncer.ts:20](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L20)

Whether the debounced function is currently executing asynchronously

***

### isPending

```ts
isPending: boolean;
```

Defined in: [async-debouncer.ts:24](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L24)

Whether the debouncer is waiting for the timeout to trigger execution

***

### lastArgs

```ts
lastArgs: Parameters<TFn> | undefined;
```

Defined in: [async-debouncer.ts:28](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L28)

The arguments from the most recent call to maybeExecute

***

### lastResult

```ts
lastResult: ReturnType<TFn> | undefined;
```

Defined in: [async-debouncer.ts:32](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L32)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-debouncer.ts:36](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L36)

Number of times maybeExecute has been called (for reduction calculations)

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-debouncer.ts:40](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L40)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "pending" | "executing" | "settled";
```

Defined in: [async-debouncer.ts:44](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L44)

Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed

***

### successCount

```ts
successCount: number;
```

Defined in: [async-debouncer.ts:48](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L48)

Number of function executions that have completed successfully
