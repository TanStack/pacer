---
id: ReactDebouncer
title: ReactDebouncer
---

Defined in: [debouncer/useDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L25)

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [debouncer/useDebouncer.ts:51](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L51)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [debouncer/useDebouncer.ts:57](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L57)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [debouncer/useDebouncer.ts:42](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L42)

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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (
    <div>{isPending ? 'Loading...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
