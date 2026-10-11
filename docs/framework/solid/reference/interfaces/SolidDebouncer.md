---
id: SolidDebouncer
title: SolidDebouncer
---

Defined in: [debouncer/createDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L26)

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: DebouncerOptions<TFn> & SolidDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/createDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L30)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/createDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L31)

Updates the debouncer options

#### Parameters

##### options

`Partial`\<[`SolidDebouncerOptions`](SolidDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

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

Defined in: [debouncer/createDebouncer.ts:55](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L55)

Reactive state that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [debouncer/createDebouncer.ts:61](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L61)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [debouncer/createDebouncer.ts:46](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L46)

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
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state().isPending ? 'Waiting...' : 'Ready'}</div>
  )}
</debouncer.Subscribe>
```
