---
id: AlpineAsyncBatcher
title: AlpineAsyncBatcher
---

Defined in: [async-batcher/createAsyncBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L20)

A AsyncBatcher with framework-reactive selected state. All core methods remain available.

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

Defined in: [async-batcher/createAsyncBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L24)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/createAsyncBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L26)

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

Defined in: [async-batcher/createAsyncBatcher.ts:30](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L30)

Selected state. Pass a selector to opt in; the default selection is an empty object.
