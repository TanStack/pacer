---
id: AsyncDebouncerOptions
title: AsyncDebouncerOptions
---

# Interface: AsyncDebouncerOptions\<TFn\>

Defined in: [async-debouncer.ts:71](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L71)

Options for configuring an async debounced function

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions: AsyncRetryerOptions<TFn>;
```

Defined in: [async-debouncer.ts:75](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L75)

Options for configuring the underlying async retryer

***

### enabled?

```ts
optional enabled: boolean | (debouncer) => boolean;
```

Defined in: [async-debouncer.ts:81](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L81)

Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer.ts:85](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L85)

Initial state for the async debouncer

***

### key?

```ts
optional key: string;
```

Defined in: [async-debouncer.ts:90](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L90)

Optional key to identify this async debouncer instance.
If provided, the async debouncer will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading: boolean;
```

Defined in: [async-debouncer.ts:95](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L95)

Whether to execute on the leading edge of the timeout.
Defaults to false.

***

### onError()?

```ts
optional onError: (error, args, debouncer) => void;
```

Defined in: [async-debouncer.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L101)

Optional error handler for when the debounced function throws.
If provided, the handler will be called with the error and debouncer instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### args

`Parameters`\<`TFn`\>

##### debouncer

[`AsyncDebouncer`](../classes/AsyncDebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled()?

```ts
optional onSettled: (args, debouncer) => void;
```

Defined in: [async-debouncer.ts:109](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L109)

Optional callback to call when the debounced function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### debouncer

[`AsyncDebouncer`](../classes/AsyncDebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, args, debouncer) => void;
```

Defined in: [async-debouncer.ts:113](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L113)

Optional callback to call when the debounced function is executed

#### Parameters

##### result

`Awaited`\<`ReturnType`\<`TFn`\>\>

##### args

`Parameters`\<`TFn`\>

##### debouncer

[`AsyncDebouncer`](../classes/AsyncDebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError: boolean;
```

Defined in: [async-debouncer.ts:123](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L123)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### trailing?

```ts
optional trailing: boolean;
```

Defined in: [async-debouncer.ts:128](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L128)

Whether to execute on the trailing edge of the timeout.
Defaults to true.

***

### wait

```ts
wait: number | (debouncer) => number;
```

Defined in: [async-debouncer.ts:134](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L134)

Delay in milliseconds to wait after the last call before executing.
Can be a number or a function that returns a number.
Defaults to 0ms
