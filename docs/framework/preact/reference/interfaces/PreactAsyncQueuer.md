---
id: PreactAsyncQueuer
title: PreactAsyncQueuer
---

# Interface: PreactAsyncQueuer\<TValue, TSelected\>

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L23)

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"store"`\>

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

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L49)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:55](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L55)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:40](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L40)

A Preact HOC (Higher Order Component) that allows you to subscribe to the async queuer state.

This is useful for opting into state re-renders for specific parts of the queuer state
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
<queuer.Subscribe selector={(state) => ({ size: state.size })}>
  {({ size }) => (
    <div>Queue Size: {size}</div>
  )}
</queuer.Subscribe>
```
