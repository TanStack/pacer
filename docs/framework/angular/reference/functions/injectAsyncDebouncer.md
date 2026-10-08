---
id: injectAsyncDebouncer
title: injectAsyncDebouncer
---

## Call Signature

```ts
function injectAsyncDebouncer<TFn>(fn, options): AngularAsyncDebouncer<TFn>;
```

Defined in: packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:97

Creates and manages an Angular AsyncDebouncer in the current injection context.

Waits until calls stop for the configured delay, then runs the latest asynchronous callback.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

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

`MaybeAccessor`\<[`AngularAsyncDebouncerOptions`](../interfaces/AngularAsyncDebouncerOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectAsyncDebouncer(
  (query: string) => Promise.resolve(query),
  () => ({ wait: 250 }),
  (state) => state.isPending,
)
utility.maybeExecute('search')
console.log(utility.state())
```

## Call Signature

```ts
function injectAsyncDebouncer<TFn, TSelected>(
   fn,
   options,
selector): AngularAsyncDebouncer<TFn, TSelected>;
```

Defined in: packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:108

Creates an Angular AsyncDebouncer with a reactive selector result.

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

`MaybeAccessor`\<[`AngularAsyncDebouncerOptions`](../interfaces/AngularAsyncDebouncerOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
