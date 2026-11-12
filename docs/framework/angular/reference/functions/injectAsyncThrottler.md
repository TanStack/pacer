---
id: injectAsyncThrottler
title: injectAsyncThrottler
---

## Call Signature

```ts
function injectAsyncThrottler<TFn>(fn, options): AngularAsyncThrottler<TFn>;
```

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:103](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L103)

Creates and manages an Angular AsyncThrottler in the current injection context.

Limits asynchronous executions to the configured interval, with leading and trailing calls. Later calls replace the pending trailing arguments without restarting the interval.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to cancel pending execution and abort running work. Set `onUnmount` to replace it.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncThrottlerOptions`](../interfaces/AngularAsyncThrottlerOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularAsyncThrottler`](../interfaces/AngularAsyncThrottler.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectAsyncThrottler(
  (value: number) => Promise.resolve(value),
  () => ({ wait: 100 }),
  (state) => state.isPending,
)
utility.maybeExecute(42)
console.log(utility.state())
```

## Call Signature

```ts
function injectAsyncThrottler<TFn, TSelected>(
   fn,
   options,
selector): AngularAsyncThrottler<TFn, TSelected>;
```

Defined in: [packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts:114](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L114)

Creates an Angular AsyncThrottler with a reactive selector result.

### Type Parameters

#### TFn

`TFn` *extends* `AnyAsyncFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncThrottlerOptions`](../interfaces/AngularAsyncThrottlerOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularAsyncThrottler`](../interfaces/AngularAsyncThrottler.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
