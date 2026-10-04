---
id: OctaneAsyncBatcher
title: OctaneAsyncBatcher
---

Defined in: [async-batcher/useAsyncBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L22)

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
| "onItemsChange">> & OctaneAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/useAsyncBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L28)

#### Parameters

##### options

`Partial`\<[`OctaneAsyncBatcherOptions`](OctaneAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:32](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.
