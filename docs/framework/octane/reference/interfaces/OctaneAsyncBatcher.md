---
id: OctaneAsyncBatcher
title: OctaneAsyncBatcher
---

Defined in: [async-batcher/useAsyncBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L24)

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
| "onItemsChange">> & OctaneAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L28)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/useAsyncBatcher.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L30)

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

Defined in: [async-batcher/useAsyncBatcher.ts:36](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L36)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<AsyncBatcherState<TValue>>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:34](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L34)

Selects state in a child without subscribing the utility owner.
