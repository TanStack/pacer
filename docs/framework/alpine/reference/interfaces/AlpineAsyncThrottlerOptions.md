---
id: AlpineAsyncThrottlerOptions
title: AlpineAsyncThrottlerOptions
---

Defined in: [async-throttler/createAsyncThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L13)

Options for createAsyncThrottler, including owner cleanup.

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

Defined in: [async-throttler/createAsyncThrottler.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncThrottler`](AlpineAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
