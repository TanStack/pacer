---
id: SolidBatcher
title: SolidBatcher
---

# Interface: SolidBatcher\<TValue, TSelected\>

Defined in: [solid-pacer/src/batcher/createBatcher.ts:8](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L8)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/batcher/createBatcher.ts:34](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L34)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [solid-pacer/src/batcher/createBatcher.ts:40](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L40)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/batcher/createBatcher.ts:25](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L25)

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
<batcher.Subscribe selector={(state) => ({ size: state.size, isRunning: state.isRunning })}>
  {(state) => (
    <div>Batch: {state().size} items, {state().isRunning ? 'Processing' : 'Idle'}</div>
  )}
</batcher.Subscribe>
```
