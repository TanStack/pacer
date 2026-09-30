---
id: AsyncDebouncerOptions
title: AsyncDebouncerOptions
---

Defined in: [async-debouncer.ts:72](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L72)

Options for configuring an async debounced function

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions?: AsyncRetryerOptions<TFn>;
```

Defined in: [async-debouncer.ts:76](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L76)

Options for configuring the underlying async retryer

***

### enabled?

```ts
optional enabled?: boolean | ((debouncer) => boolean);
```

Defined in: [async-debouncer.ts:82](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L82)

Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState?: Partial<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L86)

Initial state for the async debouncer

***

### key?

```ts
optional key?: string;
```

Defined in: [async-debouncer.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L91)

Optional key to identify this async debouncer instance.
If provided, the async debouncer will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading?: boolean;
```

Defined in: [async-debouncer.ts:96](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L96)

Whether to execute on the leading edge of the timeout.
Defaults to false.

***

### onError?

```ts
optional onError?: (error, args, debouncer) => void;
```

Defined in: [async-debouncer.ts:102](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L102)

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

### onSettled?

```ts
optional onSettled?: (args, debouncer) => void;
```

Defined in: [async-debouncer.ts:110](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L110)

Optional callback to call when the debounced function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### debouncer

[`AsyncDebouncer`](../classes/AsyncDebouncer.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, args, debouncer) => void;
```

Defined in: [async-debouncer.ts:114](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L114)

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
optional throwOnError?: boolean;
```

Defined in: [async-debouncer.ts:124](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L124)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### trailing?

```ts
optional trailing?: boolean;
```

Defined in: [async-debouncer.ts:129](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L129)

Whether to execute on the trailing edge of the timeout.
Defaults to true.

***

### wait

```ts
wait: number | ((debouncer) => number);
```

Defined in: [async-debouncer.ts:135](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L135)

Delay in milliseconds to wait after the last call before executing.
Can be a number or a function that returns a number.
Defaults to 0ms
