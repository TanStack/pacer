---
id: BatcherController
title: BatcherController
---

Defined in: [batcher/BatcherController.ts:8](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/BatcherController.ts#L8)

Owns a Batcher for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new BatcherController<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): BatcherController<TValue, TSelected>;
```

Defined in: [batcher/BatcherController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/BatcherController.ts#L10)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

(`items`) => `void`

##### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitBatcherOptions`](../interfaces/LitBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

`BatcherController`\<`TValue`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitBatcher<TValue, TSelected>;
```

Defined in: [batcher/BatcherController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/BatcherController.ts#L9)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [batcher/BatcherController.ts:20](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/BatcherController.ts#L20)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
