---
id: SolidAsyncThrottlerOptions
title: SolidAsyncThrottlerOptions
---

# Interface: SolidAsyncThrottlerOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L13)

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

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`SolidAsyncThrottler`](SolidAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
