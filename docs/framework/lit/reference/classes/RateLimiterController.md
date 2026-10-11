---
id: RateLimiterController
title: RateLimiterController
---

Defined in: [rate-limiter/RateLimiterController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/RateLimiterController.ts#L9)

Owns a RateLimiter for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new RateLimiterController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): RateLimiterController<TFn, TSelected>;
```

Defined in: [rate-limiter/RateLimiterController.ts:11](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/RateLimiterController.ts#L11)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`RateLimiterController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitRateLimiter<TFn, TSelected>;
```

Defined in: [rate-limiter/RateLimiterController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/RateLimiterController.ts#L10)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [rate-limiter/RateLimiterController.ts:20](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/RateLimiterController.ts#L20)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
