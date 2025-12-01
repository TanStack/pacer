---
id: ReactQueuer
title: ReactQueuer
---

# Interface: ReactQueuer\<TValue, TSelected\>

Defined in: [react-pacer/src/queuer/useQueuer.ts:8](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L8)

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
readonly state: Readonly<TSelected>;
```

Defined in: [react-pacer/src/queuer/useQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L17)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [react-pacer/src/queuer/useQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L23)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
