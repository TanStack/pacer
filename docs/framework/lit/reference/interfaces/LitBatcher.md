---
id: LitBatcher
title: LitBatcher
---

Defined in: [batcher/createBatcher.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L19)

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
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & LitBatcherOptions<TValue, TSelected>;
```

Defined in: [batcher/createBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L23)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/createBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L24)

#### Parameters

##### options

`Partial`\<[`LitBatcherOptions`](LitBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [batcher/createBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<BatcherState<TValue>>;
```

Defined in: [batcher/createBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L26)

Subscribes a child owner to selected state with automatic cleanup.
