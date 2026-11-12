---
id: AsyncRateLimiterController
title: AsyncRateLimiterController
---

Defined in: [async-rate-limiter/AsyncRateLimiterController.ts:12](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/AsyncRateLimiterController.ts#L12)

Owns a AsyncRateLimiter for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new AsyncRateLimiterController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): AsyncRateLimiterController<TFn, TSelected>;
```

Defined in: [async-rate-limiter/AsyncRateLimiterController.ts:17](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/AsyncRateLimiterController.ts#L17)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncRateLimiterOptions`](../interfaces/LitAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`AsyncRateLimiterController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/AsyncRateLimiterController.ts:16](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/AsyncRateLimiterController.ts#L16)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [async-rate-limiter/AsyncRateLimiterController.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/AsyncRateLimiterController.ts#L27)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
