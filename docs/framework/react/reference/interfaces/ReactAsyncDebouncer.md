---
id: ReactAsyncDebouncer
title: ReactAsyncDebouncer
---

# Interface: ReactAsyncDebouncer\<TFn, TSelected\>

Defined in: [react-pacer/src/async-debouncer/useAsyncDebouncer.ts:13](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L13)

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

Defined in: [react-pacer/src/async-debouncer/useAsyncDebouncer.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L39)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [react-pacer/src/async-debouncer/useAsyncDebouncer.ts:45](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L45)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/async-debouncer/useAsyncDebouncer.ts:30](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L30)

A React HOC (Higher Order Component) that allows you to subscribe to the debouncer state.

This is useful for opting into state re-renders for specific parts of the debouncer state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ReactNode` \| (`state`) => `ReactNode`

###### selector

(`state`) => `TSelected`

#### Returns

`ReactNode` \| `Promise`\<`ReactNode`\>

#### Example

```ts
<debouncer.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {({ isExecuting }) => (
    <div>{isExecuting ? 'Loading...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
