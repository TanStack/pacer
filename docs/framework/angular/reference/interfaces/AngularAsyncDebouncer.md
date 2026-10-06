---
id: AngularAsyncDebouncer
title: AngularAsyncDebouncer
---

Defined in: [async-debouncer/injectAsyncDebouncer.ts:35](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L35)

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

Defined in: [async-debouncer/injectAsyncDebouncer.ts:54](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L54)

***

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L43)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:42](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L42)

***

### options

```ts
readonly options: Signal<AsyncDebouncerOptions<TFn> & AngularAsyncDebouncerOptions<TFn, TSelected>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L44)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:51](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L51)

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

Defined in: [async-debouncer/injectAsyncDebouncer.ts:50](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L50)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncDebouncerState<TFn>>, never>>;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L49)

Core store access; use state() for reactive selected state.
