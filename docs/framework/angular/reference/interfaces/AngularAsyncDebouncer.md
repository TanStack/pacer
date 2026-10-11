---
id: AngularAsyncDebouncer
title: AngularAsyncDebouncer
---

Defined in: [async-debouncer/injectAsyncDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L27)

## Extends

- `Omit`\<`AsyncDebouncer`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncDebouncerOptions<TFn> & AngularAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L31)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L33)

#### Parameters

##### options

`Partial`\<[`AngularAsyncDebouncerOptions`](AngularAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:41](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L41)

Reactive state signal that will be updated when the async debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:46](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L46)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
