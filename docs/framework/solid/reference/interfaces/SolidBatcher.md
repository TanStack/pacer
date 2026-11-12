---
id: SolidBatcher
title: SolidBatcher
---

Defined in: [batcher/createBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L22)

## Extends

- `Omit`\<`Batcher`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: Omit<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute"> & Partial<Pick<Required<BatcherOptions<TValue>>, "initialState" | "key" | "onItemsChange" | "onExecute">> & SolidBatcherOptions<TValue, TSelected>;
```

Defined in: [batcher/createBatcher.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L26)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [batcher/createBatcher.ts:27](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L27)

Updates the batcher options

#### Parameters

##### options

`Partial`\<[`SolidBatcherOptions`](SolidBatcherOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

#### Overrides

```ts
Omit.setOptions
```

***

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [batcher/createBatcher.ts:51](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L51)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [batcher/createBatcher.ts:57](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L57)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [batcher/createBatcher.ts:42](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L42)

A Solid component that allows you to subscribe to the batcher state.

This is useful for tracking specific parts of the batcher state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| ((`state`) => `Element`)

###### selector

(`state`) => `TSelected`

#### Returns

`Element`

#### Example

```ts
<batcher.Subscribe selector={(state) => ({ size: state.size, isPending: state.isPending })}>
  {(state) => (
    <div>Batch: {state().size} items, {state().isPending ? 'Pending' : 'Idle'}</div>
  )}
</batcher.Subscribe>
```
