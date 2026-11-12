---
id: injectRateLimitedSignal
title: injectRateLimitedSignal
---

## Call Signature

```ts
function injectRateLimitedSignal<TValue>(initialValue, options): AngularRateLimiterSignal<TValue>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:55](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L55)

Creates an Angular ratelimited editable signal.

The initial value is available synchronously. `set` and `update` share the execution limit. Accepted writes apply immediately; rejected writes and their updater callbacks are discarded, not replayed later.

The returned value is a real Angular writable signal with the underlying utility exposed
on `rateLimiter`. Options accept a static object or reactive factory and follow
[injectRateLimiter](injectRateLimiter.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

The initial committed value.

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularRateLimiterSignal`](../interfaces/AngularRateLimiterSignal.md)\<`TValue`\>

The writable signal with `set`, `update`, `asReadonly`, and a `rateLimiter` attribute.

### Example

```ts
// In a component or service injection context.
const value = injectRateLimitedSignal(0, { limit: 5, window: 1000 })
value.set(10)
value.update(previous => previous + 1)
console.log(value())
```

## Call Signature

```ts
function injectRateLimitedSignal<TValue, TSelected>(
   initialValue,
   options,
selector): AngularRateLimiterSignal<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:65](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L65)

Creates the value signal with selected state on its attached utility ref.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

#### options

`MaybeAccessor`\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularRateLimiterSignal`](../interfaces/AngularRateLimiterSignal.md)\<`TValue`, `TSelected`\>
