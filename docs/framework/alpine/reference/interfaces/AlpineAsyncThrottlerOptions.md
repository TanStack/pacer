---
id: AlpineAsyncThrottlerOptions
title: AlpineAsyncThrottlerOptions
---

Defined in: [async-throttler/createAsyncThrottler.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L12)

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

Defined in: [async-throttler/createAsyncThrottler.ts:17](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncThrottler`](AlpineAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
