---
id: AngularAsyncThrottler
title: AngularAsyncThrottler
---

Defined in: [async-throttler/injectAsyncThrottler.ts:34](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L34)

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

Defined in: [async-throttler/injectAsyncThrottler.ts:53](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L53)

***

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:42](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L42)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:41](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L41)

***

### options

```ts
readonly options: Signal<AsyncThrottlerOptions<TFn> & AngularAsyncThrottlerOptions<TFn, TSelected>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L43)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:50](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L50)

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

Defined in: [async-throttler/injectAsyncThrottler.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L49)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncThrottlerState<TFn>>, never>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:48](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L48)

Core store access; use state() for reactive selected state.
