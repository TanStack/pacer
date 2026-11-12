---
id: LitAsyncBatcher
title: LitAsyncBatcher
---

Defined in: [async-batcher/createAsyncBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L22)

An AsyncBatcher with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncBatcher`\<`TValue`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: Omit<Required<AsyncBatcherOptions<TValue>>,
  | "initialState"
  | "key"
  | "onError"
  | "onSettled"
  | "onSuccess"
  | "onItemsChange"> & Partial<Pick<Required<AsyncBatcherOptions<TValue>>,
  | "initialState"
  | "key"
  | "onError"
  | "onSettled"
  | "onSuccess"
| "onItemsChange">> & LitAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/createAsyncBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L28)

#### Parameters

##### options

`Partial`\<[`LitAsyncBatcherOptions`](LitAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:34](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
