---
id: OctaneBatcher
title: OctaneBatcher
---

Defined in: [batcher/useBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L21)

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

Defined in: [batcher/useBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/useBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L26)

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

Defined in: [batcher/useBatcher.ts:32](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<BatcherState<TValue>>;
```

Defined in: [batcher/useBatcher.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L30)

Selects state in a child without subscribing the utility owner.
