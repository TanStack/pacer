---
id: AngularAsyncThrottler
title: AngularAsyncThrottler
---

Defined in: [async-throttler/injectAsyncThrottler.ts:35](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L35)

## Extends

- `Pick`\<`AsyncThrottler`\<`TFn`\>,
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

Defined in: [async-throttler/injectAsyncThrottler.ts:54](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L54)

***

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L43)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:42](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L42)

***

### options

```ts
readonly options: Signal<AsyncThrottlerOptions<TFn> & AngularAsyncThrottlerOptions<TFn, TSelected>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L44)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:51](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L51)

#### Parameters

##### options

`Partial`\<[`AngularAsyncThrottlerOptions`](AngularAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:50](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L50)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncThrottlerState<TFn>>, never>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L49)

Core store access; use state() for reactive selected state.
