---
id: SolidAsyncThrottlerOptions
title: SolidAsyncThrottlerOptions
---

Defined in: [async-throttler/createAsyncThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L21)

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
optional onUnmount?: (throttler) => void;
```

Defined in: [async-throttler/createAsyncThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L29)

Optional callback invoked when the owning component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`SolidAsyncThrottler`](SolidAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
