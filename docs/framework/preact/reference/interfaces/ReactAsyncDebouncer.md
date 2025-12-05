---
id: ReactAsyncDebouncer
title: ReactAsyncDebouncer
---

# Interface: ReactAsyncDebouncer\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L12)

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
readonly state: Readonly<TSelected>;
```

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L21)

Reactive state that will be updated and re-rendered when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L27)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
