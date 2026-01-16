---
id: DebouncerState
title: DebouncerState
---

# Interface: DebouncerState\<TFn\>

Defined in: [debouncer.ts:6](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L6)

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Properties

### canLeadingExecute

```ts
canLeadingExecute: boolean;
```

Defined in: [debouncer.ts:10](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L10)

Whether the debouncer can execute on the leading edge of the timeout

***

### executionCount

```ts
executionCount: number;
```

Defined in: [debouncer.ts:14](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L14)

Number of function executions that have been completed

***

### isPending

```ts
isPending: boolean;
```

Defined in: [debouncer.ts:18](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L18)

Whether the debouncer is waiting for the timeout to trigger execution

***

### lastArgs

```ts
lastArgs: Parameters<TFn> | undefined;
```

Defined in: [debouncer.ts:22](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L22)

The arguments from the most recent call to maybeExecute

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [debouncer.ts:26](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L26)

Number of times maybeExecute has been called (for reduction calculations)

***

### status

```ts
status: "disabled" | "idle" | "pending";
```

Defined in: [debouncer.ts:30](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/debouncer.ts#L30)

Current execution status - 'idle' when not active, 'pending' when waiting for timeout
