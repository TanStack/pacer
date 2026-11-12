---
id: AsyncBatcherController
title: AsyncBatcherController
---

Defined in: [async-batcher/AsyncBatcherController.ts:11](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/AsyncBatcherController.ts#L11)

Owns a AsyncBatcher for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new AsyncBatcherController<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): AsyncBatcherController<TValue, TSelected>;
```

Defined in: [async-batcher/AsyncBatcherController.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/AsyncBatcherController.ts#L13)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

(`items`) => `Promise`\<`any`\>

##### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncBatcherOptions`](../interfaces/LitAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

`AsyncBatcherController`\<`TValue`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitAsyncBatcher<TValue, TSelected>;
```

Defined in: [async-batcher/AsyncBatcherController.ts:12](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/AsyncBatcherController.ts#L12)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [async-batcher/AsyncBatcherController.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/AsyncBatcherController.ts#L23)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
