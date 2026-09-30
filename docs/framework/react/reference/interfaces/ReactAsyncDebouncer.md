---
id: ReactAsyncDebouncer
title: ReactAsyncDebouncer
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L25)

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

Defined in: [async-debouncer/useAsyncDebouncer.ts:51](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L51)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:57](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L57)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:42](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-debouncer/useAsyncDebouncer.ts#L42)

A React HOC (Higher Order Component) that allows you to subscribe to the debouncer state.

This is useful for opting into state re-renders for specific parts of the debouncer state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ReactNode` \| ((`state`) => `ReactNode`)

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
