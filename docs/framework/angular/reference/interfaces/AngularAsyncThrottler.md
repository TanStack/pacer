---
id: AngularAsyncThrottler
title: AngularAsyncThrottler
---

Defined in: [async-throttler/injectAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L27)

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncThrottlerOptions<TFn> & AngularAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L31)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L33)

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

Defined in: [async-throttler/injectAsyncThrottler.ts:41](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L41)

Reactive state signal that will be updated when the async throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:46](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L46)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
