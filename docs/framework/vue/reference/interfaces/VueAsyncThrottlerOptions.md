---
id: VueAsyncThrottlerOptions
title: VueAsyncThrottlerOptions
---

Defined in: [async-throttler/useAsyncThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L13)

Options for useAsyncThrottler, including owner cleanup.

## Extends

- `AsyncThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [async-throttler/useAsyncThrottler.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueAsyncThrottler`](VueAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
