---
id: SolidDebouncer
title: SolidDebouncer
---

# Interface: SolidDebouncer\<TFn, TSelected\>

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L24)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L50)

Reactive state that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:56](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L56)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L41)

A Solid component that allows you to subscribe to the debouncer state.

This is useful for tracking specific parts of the debouncer state
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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state().isPending ? 'Waiting...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
