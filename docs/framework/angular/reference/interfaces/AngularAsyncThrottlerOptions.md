---
id: AngularAsyncThrottlerOptions
title: AngularAsyncThrottlerOptions
---

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L32)

Options for [injectAsyncThrottler](../functions/injectAsyncThrottler.md), including core configuration and Angular cleanup.

## Extends

- `AsyncThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L39)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending execution and abort running work).

#### Parameters

##### core

`AsyncThrottler`\<`TFn`\>

#### Returns

`void`
