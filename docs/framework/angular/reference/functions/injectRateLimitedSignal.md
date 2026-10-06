---
id: injectRateLimitedSignal
title: injectRateLimitedSignal
---

## Call Signature

```ts
function injectRateLimitedSignal<TValue, TSelected>(
   value,
   initialOptions,
selector): RateLimitedSignal<TValue, TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedSignal.ts:57](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L57)

An Angular function that creates a rate-limited state signal, combining Angular's signal with rate limiting functionality.
This function provides both the current rate-limited value and methods to update it.

Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
or intelligently collapse updates.

The function returns a callable object:
- `rateLimited()`: Get the current rate-limited value
- `rateLimited.set(...)`: Set or update the rate-limited value (rate-limited via maybeExecute)
- `rateLimited.rateLimiter`: The rate limiter instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying rate limiter instance.
The `selector` parameter allows you to specify which rate limiter state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### value

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`NoInfer`\<`TValue`\>\>, `NoInfer`\<`TSelected`\>\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`RateLimitedSignal`](../type-aliases/RateLimitedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const rateLimited = injectRateLimitedSignal(0, {
  limit: 5,
  window: 60000,
  windowType: 'sliding'
});

// Opt-in to reactive updates when limit state changes
const rateLimited = injectRateLimitedSignal(
  0,
  { limit: 5, window: 60000 },
  (state) => ({ rejectionCount: state.rejectionCount })
);
```

## Call Signature

```ts
function injectRateLimitedSignal<TValue>(
   value,
   initialOptions,
   selector?): RateLimitedSignal<TValue, {
}>;
```

Defined in: [rate-limiter/injectRateLimitedSignal.ts:64](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L64)

An Angular function that creates a rate-limited state signal, combining Angular's signal with rate limiting functionality.
This function provides both the current rate-limited value and methods to update it.

Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
or intelligently collapse updates.

The function returns a callable object:
- `rateLimited()`: Get the current rate-limited value
- `rateLimited.set(...)`: Set or update the rate-limited value (rate-limited via maybeExecute)
- `rateLimited.rateLimiter`: The rate limiter instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying rate limiter instance.
The `selector` parameter allows you to specify which rate limiter state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### value

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`NoInfer`\<`TValue`\>\>, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`RateLimitedSignal`](../type-aliases/RateLimitedSignal.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const rateLimited = injectRateLimitedSignal(0, {
  limit: 5,
  window: 60000,
  windowType: 'sliding'
});

// Opt-in to reactive updates when limit state changes
const rateLimited = injectRateLimitedSignal(
  0,
  { limit: 5, window: 60000 },
  (state) => ({ rejectionCount: state.rejectionCount })
);
```

## Call Signature

```ts
function injectRateLimitedSignal<TValue, TSelected>(
   value,
   initialOptions,
   selector?): RateLimitedSignal<TValue,
  | {
}
| TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedSignal.ts:71](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L71)

An Angular function that creates a rate-limited state signal, combining Angular's signal with rate limiting functionality.
This function provides both the current rate-limited value and methods to update it.

Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
or intelligently collapse updates.

The function returns a callable object:
- `rateLimited()`: Get the current rate-limited value
- `rateLimited.set(...)`: Set or update the rate-limited value (rate-limited via maybeExecute)
- `rateLimited.rateLimiter`: The rate limiter instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying rate limiter instance.
The `selector` parameter allows you to specify which rate limiter state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### value

`TValue`

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`NoInfer`\<`TValue`\>\>,
  \| \{
\}
  \| `NoInfer`\<`TSelected`\>\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`RateLimitedSignal`](../type-aliases/RateLimitedSignal.md)\<`TValue`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const rateLimited = injectRateLimitedSignal(0, {
  limit: 5,
  window: 60000,
  windowType: 'sliding'
});

// Opt-in to reactive updates when limit state changes
const rateLimited = injectRateLimitedSignal(
  0,
  { limit: 5, window: 60000 },
  (state) => ({ rejectionCount: state.rejectionCount })
);
```
