---
id: PreactAsyncThrottlerOptions
title: PreactAsyncThrottlerOptions
---

# Interface: PreactAsyncThrottlerOptions\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-throttler/useAsyncThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-throttler/useAsyncThrottler.ts#L13)

## Extends

- `AsyncThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (throttler) => void;
```

Defined in: [preact-pacer/src/async-throttler/useAsyncThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-throttler/useAsyncThrottler.ts#L21)

Optional callback invoked when the component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`PreactAsyncThrottler`](PreactAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
