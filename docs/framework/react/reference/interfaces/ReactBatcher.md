---
id: ReactBatcher
title: ReactBatcher
---

Defined in: [batcher/useBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L21)

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

Defined in: [batcher/useBatcher.ts:47](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L47)

Reactive state that will be updated and re-rendered when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [batcher/useBatcher.ts:53](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L53)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [batcher/useBatcher.ts:38](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L38)

A React HOC (Higher Order Component) that allows you to subscribe to the batcher state.

This is useful for opting into state re-renders for specific parts of the batcher state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ReactNode` \| ((`state`) => `ReactNode`)

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
