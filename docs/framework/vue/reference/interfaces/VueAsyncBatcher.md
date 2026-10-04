---
id: VueAsyncBatcher
title: VueAsyncBatcher
---

Defined in: [async-batcher/useAsyncBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L21)

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
| "onItemsChange">> & VueAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/useAsyncBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L27)

#### Parameters

##### options

`Partial`\<[`VueAsyncBatcherOptions`](VueAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
