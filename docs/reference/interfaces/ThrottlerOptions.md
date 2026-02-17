---
id: ThrottlerOptions
title: ThrottlerOptions
---

# Interface: ThrottlerOptions\<TFn\>

Defined in: [throttler.ts:54](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L54)

Options for configuring a throttled function

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Properties

### enabled?

```ts
optional enabled: boolean | (throttler) => boolean;
```

Defined in: [throttler.ts:60](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L60)

Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<ThrottlerState<TFn>>;
```

Defined in: [throttler.ts:64](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L64)

Initial state for the throttler

***

### key?

```ts
optional key: string;
```

Defined in: [throttler.ts:69](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L69)

A key to identify the throttler.
If provided, the throttler will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading: boolean;
```

Defined in: [throttler.ts:74](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L74)

Whether to execute on the leading edge of the timeout.
Defaults to true.

***

### onExecute()?

```ts
optional onExecute: (args, throttler) => void;
```

Defined in: [throttler.ts:78](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L78)

Callback function that is called after the function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### throttler

[`Throttler`](../classes/Throttler.md)\<`TFn`\>

#### Returns

`void`

***

### onUnmount()?

```ts
optional onUnmount: (throttler) => void;
```

Defined in: [throttler.ts:89](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L89)

Optional callback invoked when the component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
Framework adapters only; ignored by core.

#### Parameters

##### throttler

[`Throttler`](../classes/Throttler.md)\<`TFn`\>

#### Returns

`void`

***

### trailing?

```ts
optional trailing: boolean;
```

Defined in: [throttler.ts:83](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L83)

Whether to execute on the trailing edge of the timeout.
Defaults to true.

***

### wait

```ts
wait: number | (throttler) => number;
```

Defined in: [throttler.ts:95](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L95)

Time window in milliseconds during which the function can only be executed once.
Can be a number or a function that returns a number.
Defaults to 0ms
