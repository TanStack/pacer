---
id: SvelteBatcher
title: SvelteBatcher
---

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L18)

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

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L23)

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

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<BatcherState<TValue>>;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatcher.ts#L27)

Subscribes a child snippet to state without updating the utility owner.
