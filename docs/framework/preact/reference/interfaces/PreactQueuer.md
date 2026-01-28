---
id: PreactQueuer
title: PreactQueuer
---

# Interface: PreactQueuer\<TValue, TSelected\>

Defined in: [preact-pacer/src/queuer/useQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/queuer/useQueuer.ts#L9)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"`\>

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

Defined in: [preact-pacer/src/queuer/useQueuer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/queuer/useQueuer.ts#L35)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [preact-pacer/src/queuer/useQueuer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/queuer/useQueuer.ts#L41)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/queuer/useQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/queuer/useQueuer.ts#L26)

A Preact HOC (Higher Order Component) that allows you to subscribe to the queuer state.

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
