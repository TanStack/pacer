---
id: AngularAsyncThrottler
title: AngularAsyncThrottler
---

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:55](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L55)

An Angular AsyncThrottler ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`AsyncThrottler`\<`TFn`\>, `AsyncThrottlerMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:60](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L60)

The readonly selector result. Returns an empty object when no selector is supplied.
