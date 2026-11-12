---
id: SolidAsyncDebouncer
title: SolidAsyncDebouncer
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L26)

## Extends

- `Omit`\<`AsyncDebouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncDebouncerOptions<TFn> & SolidAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L30)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L32)

Updates the async debouncer options

#### Parameters

##### options

`Partial`\<[`SolidAsyncDebouncerOptions`](SolidAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:58](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L58)

Reactive state that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:64](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L64)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L49)

A Solid component that allows you to subscribe to the debouncer state.

This is useful for tracking specific parts of the debouncer state
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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state().isPending ? 'Waiting...' : state().isExecuting ? 'Executing...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
