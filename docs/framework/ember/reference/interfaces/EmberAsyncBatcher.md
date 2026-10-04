---
id: EmberAsyncBatcher
title: EmberAsyncBatcher
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L25)

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
| "onItemsChange">> & EmberAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L31)

#### Parameters

##### options

`Partial`\<[`EmberAsyncBatcherOptions`](EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:35](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.
