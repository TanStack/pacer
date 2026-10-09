---
id: AngularAsyncThrottlerOptions
title: AngularAsyncThrottlerOptions
---

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L26)

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

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L33)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending execution and abort running work).

#### Parameters

##### core

`AsyncThrottler`\<`TFn`\>

#### Returns

`void`
