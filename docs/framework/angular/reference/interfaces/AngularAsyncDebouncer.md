---
id: AngularAsyncDebouncer
title: AngularAsyncDebouncer
---

# Interface: AngularAsyncDebouncer\<TFn, TSelected\>

Defined in: [angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L25)

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
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L34)

Reactive state signal that will be updated when the async debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L39)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
