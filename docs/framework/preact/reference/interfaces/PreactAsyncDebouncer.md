---
id: PreactAsyncDebouncer
title: PreactAsyncDebouncer
---

# Interface: PreactAsyncDebouncer\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L24)

## Extends

- `Omit`\<`AsyncDebouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L50)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:56](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L56)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L41)

A Preact HOC (Higher Order Component) that allows you to subscribe to the async debouncer state.

This is useful for opting into state re-renders for specific parts of the debouncer state
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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (
    <div>{isPending ? 'Loading...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
