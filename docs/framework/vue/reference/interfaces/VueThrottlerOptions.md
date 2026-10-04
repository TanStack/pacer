---
id: VueThrottlerOptions
title: VueThrottlerOptions
---

Defined in: [throttler/useThrottler.ts:14](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L14)

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

Defined in: [throttler/useThrottler.ts:19](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueThrottler`](VueThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
