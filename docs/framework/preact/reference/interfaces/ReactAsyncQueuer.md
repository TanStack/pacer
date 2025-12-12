---
id: ReactAsyncQueuer
title: ReactAsyncQueuer
---

# Interface: ReactAsyncQueuer\<TValue, TSelected\>

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:11](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L11)

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
readonly state: Readonly<TSelected>;
```

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L20)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L26)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
