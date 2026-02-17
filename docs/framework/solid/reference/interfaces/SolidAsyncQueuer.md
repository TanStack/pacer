---
id: SolidAsyncQueuer
title: SolidAsyncQueuer
---

# Interface: SolidAsyncQueuer\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L23)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L49)

Reactive state that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:55](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L55)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:40](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L40)

A Solid component that allows you to subscribe to the queuer state.

This is useful for tracking specific parts of the queuer state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| (`state`) => `Element`

###### selector

(`state`) => `TSelected`

#### Returns

`Element`

#### Example

```ts
<queuer.Subscribe selector={(state) => ({ pendingItems: state.pendingItems, activeItems: state.activeItems })}>
  {(state) => (
    <div>Pending: {state().pendingItems.length}, Active: {state().activeItems.length}</div>
  )}
</queuer.Subscribe>
```
