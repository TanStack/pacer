---
id: AsyncQueuerController
title: AsyncQueuerController
---

Defined in: [async-queuer/AsyncQueuerController.ts:8](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/AsyncQueuerController.ts#L8)

Owns a AsyncQueuer for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new AsyncQueuerController<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): AsyncQueuerController<TValue, TSelected>;
```

Defined in: [async-queuer/AsyncQueuerController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/AsyncQueuerController.ts#L10)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

(`item`) => `Promise`\<`any`\>

##### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncQueuerOptions`](../interfaces/LitAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

`AsyncQueuerController`\<`TValue`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitAsyncQueuer<TValue, TSelected>;
```

Defined in: [async-queuer/AsyncQueuerController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/AsyncQueuerController.ts#L9)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [async-queuer/AsyncQueuerController.ts:20](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/AsyncQueuerController.ts#L20)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
