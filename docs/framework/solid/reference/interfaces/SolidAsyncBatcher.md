---
id: SolidAsyncBatcher
title: SolidAsyncBatcher
---

Defined in: [async-batcher/createAsyncBatcher.ts:25](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L25)

## Extends

- `Omit`\<`AsyncBatcher`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: Omit<Required<AsyncBatcherOptions<TValue>>,
  | "initialState"
  | "key"
  | "onError"
  | "onSettled"
  | "onSuccess"
  | "onItemsChange"> & Partial<Pick<Required<AsyncBatcherOptions<TValue>>,
  | "initialState"
  | "key"
  | "onError"
  | "onSettled"
  | "onSuccess"
| "onItemsChange">> & SolidAsyncBatcherOptions<TValue, TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L29)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-batcher/createAsyncBatcher.ts:31](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L31)

Updates the async batcher options

#### Parameters

##### options

`Partial`\<[`SolidAsyncBatcherOptions`](SolidAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\>

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

Defined in: [async-batcher/createAsyncBatcher.ts:57](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L57)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:63](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L63)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [async-batcher/createAsyncBatcher.ts:48](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L48)

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
<batcher.Subscribe selector={(state) => ({ size: state.size, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>Batch: {state().size} items, {state().isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</batcher.Subscribe>
```
