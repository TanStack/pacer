---
id: AngularAsyncThrottler
title: AngularAsyncThrottler
---

# Interface: AngularAsyncThrottler\<TFn, TSelected\>

Defined in: [async-throttler/injectAsyncThrottler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L25)

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"store"`\>

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

Defined in: [async-throttler/injectAsyncThrottler.ts:34](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L34)

Reactive state signal that will be updated when the async throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [async-throttler/injectAsyncThrottler.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L39)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
