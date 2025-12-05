---
id: PreactBatcher
title: PreactBatcher
---

# Interface: PreactBatcher\<TValue, TSelected\>

Defined in: [preact-pacer/src/batcher/useBatcher.ts:8](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L8)

## Extends

- `Omit`\<`Batcher`\<`TValue`\>, `"store"`\>

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

Defined in: [preact-pacer/src/batcher/useBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L17)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [preact-pacer/src/batcher/useBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L23)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
