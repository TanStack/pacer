---
id: EmberAsyncThrottlerOptions
title: EmberAsyncThrottlerOptions
---

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L17)

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

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L22)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberAsyncThrottler`](EmberAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
