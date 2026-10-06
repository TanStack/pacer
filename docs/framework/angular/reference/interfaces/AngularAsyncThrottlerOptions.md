---
id: AngularAsyncThrottlerOptions
title: AngularAsyncThrottlerOptions
---

Defined in: [async-throttler/injectAsyncThrottler.ts:22](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L22)

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

Defined in: [async-throttler/injectAsyncThrottler.ts:31](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L31)

Optional callback invoked when the component is destroyed. Receives the throttler instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### throttler

[`AngularAsyncThrottler`](AngularAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
