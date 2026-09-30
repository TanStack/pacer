---
id: PreactAsyncQueuer
title: PreactAsyncQueuer
---

Defined in: [async-queuer/useAsyncQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L24)

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

Defined in: [async-queuer/useAsyncQueuer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L50)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:56](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L56)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [async-queuer/useAsyncQueuer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L41)

A Preact HOC (Higher Order Component) that allows you to subscribe to the async queuer state.

This is useful for opting into state re-renders for specific parts of the queuer state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ComponentChildren` \| ((`state`) => `ComponentChildren`)

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
