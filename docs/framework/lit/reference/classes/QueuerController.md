---
id: QueuerController
title: QueuerController
---

Defined in: [queuer/QueuerController.ts:8](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/QueuerController.ts#L8)

Owns a Queuer for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new QueuerController<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): QueuerController<TValue, TSelected>;
```

Defined in: [queuer/QueuerController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/QueuerController.ts#L10)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

(`item`) => `void`

##### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

`QueuerController`\<`TValue`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitQueuer<TValue, TSelected>;
```

Defined in: [queuer/QueuerController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/QueuerController.ts#L9)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [queuer/QueuerController.ts:20](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/QueuerController.ts#L20)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
