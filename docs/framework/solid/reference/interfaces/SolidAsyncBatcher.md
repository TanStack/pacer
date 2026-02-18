---
id: SolidAsyncBatcher
title: SolidAsyncBatcher
---

# Interface: SolidAsyncBatcher\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L23)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:49](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L49)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:55](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L55)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:40](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L40)

A Solid component that allows you to subscribe to the batcher state.

This is useful for tracking specific parts of the batcher state
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
<batcher.Subscribe selector={(state) => ({ size: state.size, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>Batch: {state().size} items, {state().isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</batcher.Subscribe>
```
