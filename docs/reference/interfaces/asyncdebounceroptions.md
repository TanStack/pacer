---
id: AsyncDebouncerOptions
title: AsyncDebouncerOptions
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: AsyncDebouncerOptions\<TFn\>

Defined in: [async-debouncer.ts:63](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L63)

Options for configuring an async debounced function

## Type Parameters

• **TFn** *extends* [`AnyAsyncFunction`](../../type-aliases/anyasyncfunction.md)

## Properties

### enabled?

```ts
optional enabled: boolean | (debouncer) => boolean;
```

Defined in: [async-debouncer.ts:69](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L69)

Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer.ts:73](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L73)

Initial state for the async debouncer

***

### leading?

```ts
optional leading: boolean;
```

Defined in: [async-debouncer.ts:78](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L78)

Whether to execute on the leading edge of the timeout.
Defaults to false.

***

### onError()?

```ts
optional onError: (error, debouncer) => void;
```

Defined in: [async-debouncer.ts:84](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L84)

Optional error handler for when the debounced function throws.
If provided, the handler will be called with the error and debouncer instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`unknown`

##### debouncer

[`AsyncDebouncer`](../../classes/asyncdebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled()?

```ts
optional onSettled: (debouncer) => void;
```

Defined in: [async-debouncer.ts:88](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L88)

Optional callback to call when the debounced function is executed

#### Parameters

##### debouncer

[`AsyncDebouncer`](../../classes/asyncdebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, debouncer) => void;
```

Defined in: [async-debouncer.ts:92](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L92)

Optional callback to call when the debounced function is executed

#### Parameters

##### result

`ReturnType`\<`TFn`\>

##### debouncer

[`AsyncDebouncer`](../../classes/asyncdebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError: boolean;
```

Defined in: [async-debouncer.ts:98](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L98)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### trailing?

```ts
optional trailing: boolean;
```

Defined in: [async-debouncer.ts:103](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L103)

Whether to execute on the trailing edge of the timeout.
Defaults to true.

***

### wait

```ts
wait: number | (debouncer) => number;
```

Defined in: [async-debouncer.ts:109](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L109)

Delay in milliseconds to wait after the last call before executing.
Can be a number or a function that returns a number.
Defaults to 0ms
