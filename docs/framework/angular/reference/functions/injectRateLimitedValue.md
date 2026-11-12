---
id: injectRateLimitedValue
title: injectRateLimitedValue
---

## Call Signature

```ts
function injectRateLimitedValue<TValue>(source, options): AngularRateLimiterValue<TValue>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts:50](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L50)

Creates an Angular ratelimited view of a source signal.

The initial source value is available on first read. The unchanged initial value does not consume capacity. An effect passes subsequent source changes to the rate limiter. Excess updates are discarded; the end of a window does not replay rejected values.

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

[`AngularRateLimiterValue`](../interfaces/AngularRateLimiterValue.md)\<`TValue`\>

The value signal with a `rateLimiter` attribute.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectRateLimitedValue(source, { limit: 5, window: 1000 })
source.set('updated')
console.log(value())
```

## Call Signature

```ts
function injectRateLimitedValue<TValue, TSelected>(
   source,
   options,
selector): AngularRateLimiterValue<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts:58](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L58)

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

[`AngularRateLimiterValue`](../interfaces/AngularRateLimiterValue.md)\<`TValue`, `TSelected`\>
