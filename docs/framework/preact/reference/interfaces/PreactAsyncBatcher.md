---
id: PreactAsyncBatcher
title: PreactAsyncBatcher
---

# Interface: PreactAsyncBatcher\<TValue, TSelected\>

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L12)

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

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:38](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L38)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:44](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L44)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:29](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L29)

A Preact HOC (Higher Order Component) that allows you to subscribe to the async batcher state.

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
