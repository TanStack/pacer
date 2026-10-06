---
id: injectRateLimitedValue
title: injectRateLimitedValue
---

## Call Signature

```ts
function injectRateLimitedValue<TValue, TSelected>(
   value,
   options,
selector): RateLimitedSignal<TValue, TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:47](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L47)

An Angular function that creates a rate-limited value that updates at most a certain number of times within a time window.
Unlike injectRateLimitedSignal, this function automatically tracks changes to the input signal
and updates the rate-limited value accordingly.

The rate-limited value will update according to the configured rate limit, blocking updates
once the limit is reached until the window resets.

The function returns a rate-limited signal object containing:
- A Signal that provides the current rate-limited value
- The rate limiter instance with control methods

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

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`TValue`\>, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`RateLimitedSignal`](../type-aliases/RateLimitedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const value = signal(0)
const rateLimited = injectRateLimitedValue(value, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

// rateLimited() will update at most 5 times per 60 seconds
effect(() => {
  updateUI(rateLimited())
})
```

## Call Signature

```ts
function injectRateLimitedValue<TValue>(
   value,
   options,
   selector?): RateLimitedSignal<TValue, {
}>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:54](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L54)

An Angular function that creates a rate-limited value that updates at most a certain number of times within a time window.
Unlike injectRateLimitedSignal, this function automatically tracks changes to the input signal
and updates the rate-limited value accordingly.

The rate-limited value will update according to the configured rate limit, blocking updates
once the limit is reached until the window resets.

The function returns a rate-limited signal object containing:
- A Signal that provides the current rate-limited value
- The rate limiter instance with control methods

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

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`TValue`\>, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`RateLimitedSignal`](../type-aliases/RateLimitedSignal.md)\<`TValue`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const value = signal(0)
const rateLimited = injectRateLimitedValue(value, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

// rateLimited() will update at most 5 times per 60 seconds
effect(() => {
  updateUI(rateLimited())
})
```

## Call Signature

```ts
function injectRateLimitedValue<TValue, TSelected>(
   value,
   options,
   selector?): RateLimitedSignal<TValue,
  | {
}
| TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:59](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L59)

An Angular function that creates a rate-limited value that updates at most a certain number of times within a time window.
Unlike injectRateLimitedSignal, this function automatically tracks changes to the input signal
and updates the rate-limited value accordingly.

The rate-limited value will update according to the configured rate limit, blocking updates
once the limit is reached until the window resets.

The function returns a rate-limited signal object containing:
- A Signal that provides the current rate-limited value
- The rate limiter instance with control methods

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

() => `TValue`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`Setter`\<`TValue`\>,
  \| \{
\}
  \| `TSelected`\>\>

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
const value = signal(0)
const rateLimited = injectRateLimitedValue(value, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

// rateLimited() will update at most 5 times per 60 seconds
effect(() => {
  updateUI(rateLimited())
})
```
