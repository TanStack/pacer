---
id: DebouncerOptions
title: DebouncerOptions
---

# Interface: DebouncerOptions\<TFn\>

Defined in: [debouncer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L49)

Options for configuring a debounced function

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Properties

### enabled?

```ts
optional enabled: boolean | (debouncer) => boolean;
```

Defined in: [debouncer.ts:55](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L55)

Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<DebouncerState<TFn>>;
```

Defined in: [debouncer.ts:59](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L59)

Initial state for the debouncer

***

### key?

```ts
optional key: string;
```

Defined in: [debouncer.ts:64](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L64)

A key to identify the debouncer.
If provided, the debouncer will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading: boolean;
```

Defined in: [debouncer.ts:70](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L70)

Whether to execute on the leading edge of the timeout.
The first call will execute immediately and the rest will wait the delay.
Defaults to false.

***

### onExecute()?

```ts
optional onExecute: (args, debouncer) => void;
```

Defined in: [debouncer.ts:74](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L74)

Callback function that is called after the function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### debouncer

[`Debouncer`](../classes/Debouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onUnmount()?

```ts
optional onUnmount: (debouncer) => void;
```

Defined in: [debouncer.ts:85](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L85)

Optional callback invoked when the component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
Framework adapters only; ignored by core.

#### Parameters

##### debouncer

[`Debouncer`](../classes/Debouncer.md)\<`TFn`\>

#### Returns

`void`

***

### trailing?

```ts
optional trailing: boolean;
```

Defined in: [debouncer.ts:79](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L79)

Whether to execute on the trailing edge of the timeout.
Defaults to true.

***

### wait

```ts
wait: number | (debouncer) => number;
```

Defined in: [debouncer.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L91)

Delay in milliseconds before executing the function.
Can be a number or a function that returns a number.
Defaults to 0ms
