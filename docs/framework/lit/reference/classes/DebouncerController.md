---
id: DebouncerController
title: DebouncerController
---

Defined in: [debouncer/DebouncerController.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/DebouncerController.ts#L9)

Owns a Debouncer for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new DebouncerController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): DebouncerController<TFn, TSelected>;
```

Defined in: [debouncer/DebouncerController.ts:11](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/DebouncerController.ts#L11)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitDebouncerOptions`](../interfaces/LitDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`DebouncerController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitDebouncer<TFn, TSelected>;
```

Defined in: [debouncer/DebouncerController.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/DebouncerController.ts#L10)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [debouncer/DebouncerController.ts:21](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/DebouncerController.ts#L21)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
