---
id: SvelteAsyncBatcher
title: SvelteAsyncBatcher
---

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts#L21)

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
| "onItemsChange">> & SvelteAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts#L27)

#### Parameters

##### options

`Partial`\<[`SvelteAsyncBatcherOptions`](SvelteAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts:33](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<AsyncBatcherState<TValue>>;
```

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatcher.ts#L31)

Subscribes a child snippet to state without updating the utility owner.
