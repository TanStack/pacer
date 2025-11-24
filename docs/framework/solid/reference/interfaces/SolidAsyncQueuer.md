---
id: SolidAsyncQueuer
title: SolidAsyncQueuer
---

# Interface: SolidAsyncQueuer\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:11](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L11)

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L18)

Reactive state that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L24)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
