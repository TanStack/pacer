---
id: injectRateLimiter
title: injectRateLimiter
---

## Call Signature

```ts
function injectRateLimiter<TFn>(fn, options): AngularRateLimiter<TFn>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:100](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L100)

Creates and manages an Angular RateLimiter in the current injection context.

Allows calls up to the configured limit within a fixed or sliding window. Calls beyond the limit are rejected rather than queued.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

There is no default cleanup. Set `onUnmount` to customize cleanup.

### Type Parameters

#### TFn

`TFn` *extends* `AnyFunction`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularRateLimiter`](../interfaces/AngularRateLimiter.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectRateLimiter(
  (query: string) => console.log(query),
  () => ({ limit: 5, window: 1000 }),
  (state) => state.executionCount,
)
utility.maybeExecute('search')
console.log(utility.state())
```

## Call Signature

```ts
function injectRateLimiter<TFn, TSelected>(
   fn,
   options,
selector): AngularRateLimiter<TFn, TSelected>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:111](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L111)

Creates an Angular RateLimiter with a reactive selector result.

### Type Parameters

#### TFn

`TFn` *extends* `AnyFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularRateLimiter`](../interfaces/AngularRateLimiter.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
