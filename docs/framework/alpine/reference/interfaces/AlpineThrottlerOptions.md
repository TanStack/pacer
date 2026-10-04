---
id: AlpineThrottlerOptions
title: AlpineThrottlerOptions
---

Defined in: [throttler/createThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L13)

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

Defined in: [throttler/createThrottler.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineThrottler`](AlpineThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
