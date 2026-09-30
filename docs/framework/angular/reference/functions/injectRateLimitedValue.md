---
id: injectRateLimitedValue
title: injectRateLimitedValue
---

## Call Signature

```ts
function injectRateLimitedValue<TValue, TSelected>(
   value,
   initialOptions,
selector?): RateLimitedSignal<TValue, TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:51](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L51)

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

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialOptions

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<`RateLimiterOptions`\<`Setter`\<`TValue`\>\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`RateLimitedSignal`](../interfaces/RateLimitedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default behavior - no reactive state subscriptions
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
   initialValue,
   initialOptions,
selector?): RateLimitedSignal<TValue, TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:56](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L56)

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

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`TValue`

#### initialOptions

`RateLimiterOptions`\<`Setter`\<`TValue`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`RateLimitedSignal`](../interfaces/RateLimitedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default behavior - no reactive state subscriptions
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
   initialValue,
   initialOptions,
selector): RateLimitedSignal<TValue, TSelected>;
```

Defined in: [rate-limiter/injectRateLimitedValue.ts:62](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L62)

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

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### value

`Signal`\<`TValue`\>

#### initialValue

`TValue`

#### initialOptions

() => `RateLimiterOptions`\<`Setter`\<`TValue`\>\>

#### selector

((`state`) => `TSelected`) \| `undefined`

### Returns

[`RateLimitedSignal`](../interfaces/RateLimitedSignal.md)\<`TValue`, `TSelected`\>

### Example

```ts
// Default behavior - no reactive state subscriptions
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
