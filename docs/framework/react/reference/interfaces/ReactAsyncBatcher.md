---
id: ReactAsyncBatcher
title: ReactAsyncBatcher
---

# Interface: ReactAsyncBatcher\<TValue, TSelected\>

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:11](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L11)

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
readonly state: Readonly<TSelected>;
```

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L18)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L24)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
