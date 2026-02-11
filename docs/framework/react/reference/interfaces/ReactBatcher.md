---
id: ReactBatcher
title: ReactBatcher
---

# Interface: ReactBatcher\<TValue, TSelected\>

Defined in: [react-pacer/src/batcher/useBatcher.ts:9](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L9)

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

Defined in: [react-pacer/src/batcher/useBatcher.ts:35](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L35)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [react-pacer/src/batcher/useBatcher.ts:41](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L41)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/batcher/useBatcher.ts:26](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L26)

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
<batcher.Subscribe selector={(state) => ({ size: state.size, isPending: state.isPending })}>
  {({ size, isPending }) => (
    <div>Batch: {size} items, {isPending ? 'Pending' : 'Ready'}</div>
  )}
</batcher.Subscribe>
```
