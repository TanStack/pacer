---
id: ThrottlerController
title: ThrottlerController
---

Defined in: [throttler/ThrottlerController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/ThrottlerController.ts#L9)

Owns a Throttler for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new ThrottlerController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): ThrottlerController<TFn, TSelected>;
```

Defined in: [throttler/ThrottlerController.ts:11](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/ThrottlerController.ts#L11)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitThrottlerOptions`](../interfaces/LitThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`ThrottlerController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitThrottler<TFn, TSelected>;
```

Defined in: [throttler/ThrottlerController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/ThrottlerController.ts#L10)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [throttler/ThrottlerController.ts:21](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/ThrottlerController.ts#L21)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
