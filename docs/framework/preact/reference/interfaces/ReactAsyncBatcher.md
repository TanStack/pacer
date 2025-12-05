---
id: ReactAsyncBatcher
title: ReactAsyncBatcher
---

# Interface: ReactAsyncBatcher\<TValue, TSelected\>

Defined in: preact-pacer/src/async-batcher/useAsyncBatcher.ts:11

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

Defined in: preact-pacer/src/async-batcher/useAsyncBatcher.ts:20

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: preact-pacer/src/async-batcher/useAsyncBatcher.ts:26

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
