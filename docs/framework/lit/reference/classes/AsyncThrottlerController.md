---
id: AsyncThrottlerController
title: AsyncThrottlerController
---

Defined in: [async-throttler/AsyncThrottlerController.ts:12](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/AsyncThrottlerController.ts#L12)

Owns a AsyncThrottler for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new AsyncThrottlerController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): AsyncThrottlerController<TFn, TSelected>;
```

Defined in: [async-throttler/AsyncThrottlerController.ts:17](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/AsyncThrottlerController.ts#L17)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncThrottlerOptions`](../interfaces/LitAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`AsyncThrottlerController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitAsyncThrottler<TFn, TSelected>;
```

Defined in: [async-throttler/AsyncThrottlerController.ts:16](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/AsyncThrottlerController.ts#L16)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [async-throttler/AsyncThrottlerController.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/AsyncThrottlerController.ts#L27)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
