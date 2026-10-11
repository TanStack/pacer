---
id: SolidQueuer
title: SolidQueuer
---

Defined in: [queuer/createQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L22)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: QueuerOptions<TValue> & SolidQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/createQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L26)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/createQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L27)

Updates the queuer options. New options are merged with existing options.

#### Parameters

##### options

`Partial`\<[`SolidQueuerOptions`](SolidQueuerOptions.md)\<`TValue`, `TSelected`\>\>

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

Defined in: [queuer/createQueuer.ts:51](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L51)

Reactive state that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [queuer/createQueuer.ts:57](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L57)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [queuer/createQueuer.ts:42](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L42)

A Solid component that allows you to subscribe to the queuer state.

This is useful for tracking specific parts of the queuer state
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
<queuer.Subscribe selector={(state) => ({ size: state.size, isRunning: state.isRunning })}>
  {(state) => (
    <div>Queue: {state().size} items, {state().isRunning ? 'Processing' : 'Idle'}</div>
  )}
</queuer.Subscribe>
```
