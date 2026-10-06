---
id: injectAsyncRateLimiter
title: injectAsyncRateLimiter
---

## Call Signature

```ts
function injectAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector): AngularAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:101](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L101)

An Angular function that creates and manages an AsyncRateLimiter instance.

This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async rate limiting functionality with promise support, error handling,
retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncRateLimiterOptions`](../interfaces/AngularAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### selector

(`state`) => `TSelected`

### Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const rateLimiter = injectAsyncRateLimiter(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`);
    return response.json();
  },
  { limit: 5, window: 60000, windowType: 'sliding' }
);

// In an event handler
const handleRequest = async (id: string) => {
  const result = await rateLimiter.maybeExecute(id);
  console.log('Result:', result);
};
```

## Call Signature

```ts
function injectAsyncRateLimiter<TFn>(
   fn,
   options,
   selector?): AngularAsyncRateLimiter<TFn, {
}>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:106](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L106)

An Angular function that creates and manages an AsyncRateLimiter instance.

This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async rate limiting functionality with promise support, error handling,
retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncRateLimiterOptions`](../interfaces/AngularAsyncRateLimiterOptions.md)\<`TFn`, \{
\}\>\>

#### selector?

`undefined`

### Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`, \{
\}\>

### Example

```ts
// Default selected state is an empty object
const rateLimiter = injectAsyncRateLimiter(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`);
    return response.json();
  },
  { limit: 5, window: 60000, windowType: 'sliding' }
);

// In an event handler
const handleRequest = async (id: string) => {
  const result = await rateLimiter.maybeExecute(id);
  console.log('Result:', result);
};
```

## Call Signature

```ts
function injectAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
   selector?): AngularAsyncRateLimiter<TFn,
  | {
}
| TSelected>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:111](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L111)

An Angular function that creates and manages an AsyncRateLimiter instance.

This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async rate limiting functionality with promise support, error handling,
retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

By default, the selected state is an empty object. Provide a selector to expose
reactive state fields. The adapter observes core work separately for Angular stability.

## Cleanup on Destroy

By default, the function aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected` = \{
\}

### Parameters

#### fn

`TFn`

#### options

[`AngularPacerOptions`](../type-aliases/AngularPacerOptions.md)\<[`AngularAsyncRateLimiterOptions`](../interfaces/AngularAsyncRateLimiterOptions.md)\<`TFn`,
  \| \{
\}
  \| `TSelected`\>\>

#### selector?

(`state`) => `TSelected`

### Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`,
  \| \{
\}
  \| `TSelected`\>

### Example

```ts
// Default selected state is an empty object
const rateLimiter = injectAsyncRateLimiter(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`);
    return response.json();
  },
  { limit: 5, window: 60000, windowType: 'sliding' }
);

// In an event handler
const handleRequest = async (id: string) => {
  const result = await rateLimiter.maybeExecute(id);
  console.log('Result:', result);
};
```
