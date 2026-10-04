---
id: EmberBatcher
title: EmberBatcher
---

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L22)

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
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & EmberBatcherOptions<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L27)

#### Parameters

##### options

`Partial`\<[`EmberBatcherOptions`](EmberBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
