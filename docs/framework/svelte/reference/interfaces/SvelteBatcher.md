---
id: SvelteBatcher
title: SvelteBatcher
---

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L17)

A Batcher with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`Batcher`\<`TValue`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & SvelteBatcherOptions<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L21)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L22)

#### Parameters

##### options

`Partial`\<[`SvelteBatcherOptions`](SvelteBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L26)

Selected state. Pass a selector to opt in; the default selection is an empty object.
