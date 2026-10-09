---
id: injectDebouncer
title: injectDebouncer
---

## Call Signature

```ts
function injectDebouncer<TFn>(fn, options): AngularDebouncer<TFn>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncer.ts:95](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L95)

Creates and manages an Angular Debouncer in the current injection context.

Waits until calls stop for the configured delay, then runs the latest callback. Each new call restarts the delay.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to cancel pending execution. Set `onUnmount` to replace it.

### Type Parameters

#### TFn

`TFn` *extends* `AnyFunction`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularDebouncer`](../interfaces/AngularDebouncer.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectDebouncer(
  (query: string) => console.log(query),
  () => ({ wait: 250 }),
  (state) => state.isPending,
)
utility.maybeExecute('search')
console.log(utility.state())
```

## Call Signature

```ts
function injectDebouncer<TFn, TSelected>(
   fn,
   options,
selector): AngularDebouncer<TFn, TSelected>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncer.ts:106](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L106)

Creates an Angular Debouncer with a reactive selector result.

### Type Parameters

#### TFn

`TFn` *extends* `AnyFunction`

#### TSelected

`TSelected`

### Parameters

#### fn

`TFn`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularDebouncer`](../interfaces/AngularDebouncer.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
