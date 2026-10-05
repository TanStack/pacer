---
id: LitThrottlerOptions
title: LitThrottlerOptions
---

Defined in: [throttler/createThrottler.ts:14](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L14)

Options for createThrottler, including owner cleanup.

## Extends

- `ThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [throttler/createThrottler.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitThrottler`](LitThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
