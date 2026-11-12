---
id: VueAsyncBatcher
title: VueAsyncBatcher
---

Defined in: [async-batcher/useAsyncBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L22)

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
| "onItemsChange">> & VueAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/useAsyncBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L28)

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

Defined in: [async-batcher/useAsyncBatcher.ts:34](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:32](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L32)

Subscribes a scoped slot to state without re-rendering the utility owner.
