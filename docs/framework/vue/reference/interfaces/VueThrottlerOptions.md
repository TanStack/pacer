---
id: VueThrottlerOptions
title: VueThrottlerOptions
---

Defined in: [throttler/useThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L13)

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

Defined in: [throttler/useThrottler.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueThrottler`](VueThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
