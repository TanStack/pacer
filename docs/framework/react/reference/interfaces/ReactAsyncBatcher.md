---
id: ReactAsyncBatcher
title: ReactAsyncBatcher
---

# Interface: ReactAsyncBatcher\<TValue, TSelected\>

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L12)

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

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:38](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L38)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:44](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L44)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/async-batcher/useAsyncBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-batcher/useAsyncBatcher.ts#L29)

A React HOC (Higher Order Component) that allows you to subscribe to the batcher state.

This is useful for opting into state re-renders for specific parts of the batcher state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ReactNode` \| (`state`) => `ReactNode`

###### selector

(`state`) => `TSelected`

#### Returns

`ReactNode` \| `Promise`\<`ReactNode`\>

#### Example

```ts
<batcher.Subscribe selector={(state) => ({ size: state.size, isExecuting: state.isExecuting })}>
  {({ size, isExecuting }) => (
    <div>Batch: {size} items, {isExecuting ? 'Processing' : 'Ready'}</div>
  )}
</batcher.Subscribe>
```
