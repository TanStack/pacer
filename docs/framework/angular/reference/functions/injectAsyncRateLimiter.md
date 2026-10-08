---
id: injectAsyncRateLimiter
title: injectAsyncRateLimiter
---

## Call Signature

```ts
function injectAsyncRateLimiter<TFn>(fn, options): AngularAsyncRateLimiter<TFn>;
```

Defined in: packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:97

Creates and manages an Angular AsyncRateLimiter in the current injection context.

Allows asynchronous calls up to the configured limit within a fixed or sliding window. Calls beyond the limit are rejected rather than queued.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to abort running work and reset the limiter. Set `onUnmount` to replace it.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncRateLimiterOptions`](../interfaces/AngularAsyncRateLimiterOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectAsyncRateLimiter(
  (query: string) => Promise.resolve(query),
  () => ({ limit: 5, window: 1000 }),
  (state) => state.isExecuting,
)
utility.maybeExecute('search')
console.log(utility.state())
```

## Call Signature

```ts
function injectAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector): AngularAsyncRateLimiter<TFn, TSelected>;
```

Defined in: packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:108

Creates an Angular AsyncRateLimiter with a reactive selector result.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncRateLimiterOptions`](../interfaces/AngularAsyncRateLimiterOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
