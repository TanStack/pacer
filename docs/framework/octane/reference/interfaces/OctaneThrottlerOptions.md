---
id: OctaneThrottlerOptions
title: OctaneThrottlerOptions
---

Defined in: [throttler/useThrottler.ts:16](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L16)

Options for useThrottler, including owner cleanup.

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

Defined in: [throttler/useThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneThrottler`](OctaneThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
