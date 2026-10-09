---
id: injectRateLimitedComputed
title: injectRateLimitedComputed
---

## Call Signature

```ts
function injectRateLimitedComputed<TValue>(source, options): AngularRateLimiterComputed<TValue>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedComputed.ts:44](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedComputed.ts#L44)

Creates an Angular ratelimited view of a source signal.

The initial source value is available on first read. An effect passes source values to the rate limiter, including the initial value. Excess updates are discarded; the end of a window does not replay rejected values.

The returned value is a real Angular signal with the underlying utility exposed
on `rateLimiter`. Options accept a static object or reactive factory and follow
[injectRateLimiter](injectRateLimiter.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

() => `TValue`

The source signal or accessor whose changes are observed.

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularRateLimiterComputed`](../interfaces/AngularRateLimiterComputed.md)\<`TValue`\>

The value signal with a `rateLimiter` attribute.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectRateLimitedComputed(source, { limit: 5, window: 1000 })
source.set('updated')
console.log(value())
```

## Call Signature

```ts
function injectRateLimitedComputed<TValue, TSelected>(
   source,
   options,
selector): AngularRateLimiterComputed<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedComputed.ts:52](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedComputed.ts#L52)

Creates the value signal with selected state on its attached utility ref.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### source

() => `TValue`

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularRateLimiterComputed`](../interfaces/AngularRateLimiterComputed.md)\<`TValue`, `TSelected`\>
