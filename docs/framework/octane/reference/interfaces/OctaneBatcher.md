---
id: OctaneBatcher
title: OctaneBatcher
---

Defined in: [batcher/useBatcher.ts:19](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L19)

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
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & OctaneBatcherOptions<TValue, TSelected>;
```

Defined in: [batcher/useBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L23)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/useBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L24)

#### Parameters

##### options

`Partial`\<[`OctaneBatcherOptions`](OctaneBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [batcher/useBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.
