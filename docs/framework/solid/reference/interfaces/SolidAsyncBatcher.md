---
id: SolidAsyncBatcher
title: SolidAsyncBatcher
---

# Interface: SolidAsyncBatcher\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:11](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L11)

## Extends

- `Omit`\<`AsyncBatcher`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L20)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L26)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
