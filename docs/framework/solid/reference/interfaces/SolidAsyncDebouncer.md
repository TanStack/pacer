---
id: SolidAsyncDebouncer
title: SolidAsyncDebouncer
---

# Interface: SolidAsyncDebouncer\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:13](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L13)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L39)

Reactive state that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:45](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L45)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:30](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L30)

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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state().isPending ? 'Waiting...' : state().isExecuting ? 'Executing...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
