---
id: AlpineAsyncBatcher
title: AlpineAsyncBatcher
---

Defined in: [async-batcher/createAsyncBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L21)

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
| "onItemsChange">> & AlpineAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/createAsyncBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineAsyncBatcherOptions`](AlpineAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:33](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L31)

Subscribes a child owner to selected state with automatic cleanup.
