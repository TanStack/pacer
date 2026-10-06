---
id: AngularBatcher
title: AngularBatcher
---

Defined in: [batcher/injectBatcher.ts:29](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L29)

## Extends

- `Pick`\<`Batcher`\<`TValue`\>, `"addItem"` \| `"flush"` \| `"peekAllItems"` \| `"clear"` \| `"cancel"` \| `"reset"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### fn

```ts
readonly fn: Signal<(items) => void>;
```

Defined in: [batcher/injectBatcher.ts:34](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L34)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [batcher/injectBatcher.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L33)

***

### options

```ts
readonly options: Signal<Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & AngularBatcherOptions<TValue, TSelected>>;
```

Defined in: [batcher/injectBatcher.ts:35](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L35)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/injectBatcher.ts:41](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L41)

#### Parameters

##### options

`Partial`\<[`AngularBatcherOptions`](AngularBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [batcher/injectBatcher.ts:40](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L40)

***

### store

```ts
readonly store: Signal<Store<Readonly<BatcherState<TValue>>, never>>;
```

Defined in: [batcher/injectBatcher.ts:39](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L39)

Core store access; use state() for reactive selected state.
