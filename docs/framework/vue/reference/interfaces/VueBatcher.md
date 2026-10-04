---
id: VueBatcher
title: VueBatcher
---

Defined in: [batcher/useBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/batcher/useBatcher.ts#L18)

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
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & VueBatcherOptions<TValue, TSelected>;
```

Defined in: [batcher/useBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/batcher/useBatcher.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/useBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/batcher/useBatcher.ts#L23)

#### Parameters

##### options

`Partial`\<[`VueBatcherOptions`](VueBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [batcher/useBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/batcher/useBatcher.ts#L25)

Selected state. Pass a selector to opt in; the default selection is an empty object.
