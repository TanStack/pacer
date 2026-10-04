---
id: OctaneThrottlerOptions
title: OctaneThrottlerOptions
---

Defined in: [throttler/useThrottler.ts:14](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L14)

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

Defined in: [throttler/useThrottler.ts:19](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneThrottler`](OctaneThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
