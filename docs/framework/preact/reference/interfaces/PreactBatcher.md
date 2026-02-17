---
id: PreactBatcher
title: PreactBatcher
---

# Interface: PreactBatcher\<TValue, TSelected\>

Defined in: [preact-pacer/src/batcher/useBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L20)

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

Defined in: [preact-pacer/src/batcher/useBatcher.ts:46](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L46)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [preact-pacer/src/batcher/useBatcher.ts:52](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L52)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/batcher/useBatcher.ts:37](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L37)

A Preact HOC (Higher Order Component) that allows you to subscribe to the batcher state.

This is useful for opting into state re-renders for specific parts of the batcher state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ComponentChildren` \| (`state`) => `ComponentChildren`

###### selector

(`state`) => `TSelected`

#### Returns

`ComponentChildren`

#### Example

```ts
<batcher.Subscribe selector={(state) => ({ size: state.size })}>
  {({ size }) => (
    <div>Batch Size: {size}</div>
  )}
</batcher.Subscribe>
```
