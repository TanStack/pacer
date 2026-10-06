---
id: AngularAsyncBatcher
title: AngularAsyncBatcher
---

Defined in: [async-batcher/injectAsyncBatcher.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L33)

## Extends

- `Pick`\<`AsyncBatcher`\<`TValue`\>,
  \| `"addItem"`
  \| `"flush"`
  \| `"peekAllItems"`
  \| `"peekFailedItems"`
  \| `"clear"`
  \| `"getAbortSignal"`
  \| `"abort"`
  \| `"cancel"`
  \| `"reset"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### asyncRetryers

```ts
readonly asyncRetryers: Signal<Map<number, AsyncRetryer<(items) => Promise<any>>>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:57](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L57)

***

### fn

```ts
readonly fn: Signal<(items) => Promise<any>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:46](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L46)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L45)

***

### options

```ts
readonly options: Signal<Omit<Required<AsyncBatcherOptions<TValue>>,
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
| "onItemsChange">> & AngularAsyncBatcherOptions<TValue, TSelected>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:47](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L47)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:54](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L54)

#### Parameters

##### options

`Partial`\<[`AngularAsyncBatcherOptions`](AngularAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:53](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L53)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncBatcherState<TValue>>, never>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:52](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L52)

Core store access; use state() for reactive selected state.
