---
id: SolidQueuer
title: SolidQueuer
---

# Interface: SolidQueuer\<TValue, TSelected\>

Defined in: [solid-pacer/src/queuer/createQueuer.ts:8](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L8)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"`\>

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

Defined in: [solid-pacer/src/queuer/createQueuer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L15)

Reactive state that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [solid-pacer/src/queuer/createQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L21)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
