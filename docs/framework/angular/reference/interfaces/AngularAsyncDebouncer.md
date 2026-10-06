---
id: AngularAsyncDebouncer
title: AngularAsyncDebouncer
---

Defined in: [async-debouncer/injectAsyncDebouncer.ts:34](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L34)

## Extends

- `Pick`\<`AsyncDebouncer`\<`TFn`\>,
  \| `"maybeExecute"`
  \| `"flush"`
  \| `"getAbortSignal"`
  \| `"abort"`
  \| `"cancel"`
  \| `"reset"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### asyncRetryers

```ts
readonly asyncRetryers: Signal<Map<number, AsyncRetryer<TFn>>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:53](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L53)

***

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:42](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L42)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:41](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L41)

***

### options

```ts
readonly options: Signal<AsyncDebouncerOptions<TFn> & AngularAsyncDebouncerOptions<TFn, TSelected>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L43)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:50](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L50)

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

Defined in: [async-debouncer/injectAsyncDebouncer.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L49)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncDebouncerState<TFn>>, never>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:48](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L48)

Core store access; use state() for reactive selected state.
