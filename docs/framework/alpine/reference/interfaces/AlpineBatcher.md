---
id: AlpineBatcher
title: AlpineBatcher
---

Defined in: [batcher/createBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L18)

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
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & AlpineBatcherOptions<TValue, TSelected>;
```

Defined in: [batcher/createBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/createBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L23)

#### Parameters

##### options

`Partial`\<[`AlpineBatcherOptions`](AlpineBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [batcher/createBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<BatcherState<TValue>>;
```

Defined in: [batcher/createBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L27)

Subscribes a child owner to selected state with automatic cleanup.
