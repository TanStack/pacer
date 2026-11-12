---
id: AsyncDebouncerController
title: AsyncDebouncerController
---

Defined in: [async-debouncer/AsyncDebouncerController.ts:12](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/AsyncDebouncerController.ts#L12)

Owns a AsyncDebouncer for a Lit host. Access core methods and selected state through `pacer`.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new AsyncDebouncerController<TFn, TSelected>(
   host,
   fn,
   options,
selector?): AsyncDebouncerController<TFn, TSelected>;
```

Defined in: [async-debouncer/AsyncDebouncerController.ts:17](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/AsyncDebouncerController.ts#L17)

#### Parameters

##### host

`ReactiveControllerHost`

##### fn

`TFn`

##### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncDebouncerOptions`](../interfaces/LitAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

`AsyncDebouncerController`\<`TFn`, `TSelected`\>

## Properties

### pacer

```ts
readonly pacer: LitAsyncDebouncer<TFn, TSelected>;
```

Defined in: [async-debouncer/AsyncDebouncerController.ts:16](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/AsyncDebouncerController.ts#L16)

## Accessors

### state

#### Get Signature

```ts
get state(): Readonly<TSelected>;
```

Defined in: [async-debouncer/AsyncDebouncerController.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/AsyncDebouncerController.ts#L27)

Selected reactive state. Reading this property participates in host rendering.

##### Returns

`Readonly`\<`TSelected`\>
