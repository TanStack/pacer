---
id: injectThrottler
title: injectThrottler
---

## Call Signature

```ts
function injectThrottler<TFn>(fn, options): AngularThrottler<TFn>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottler.ts:101](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L101)

Creates and manages an Angular Throttler in the current injection context.

Limits executions to the configured interval, with leading and trailing calls. Later calls replace the pending trailing arguments without restarting the interval.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.

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

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`TFn`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularThrottler`](../interfaces/AngularThrottler.md)\<`TFn`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectThrottler(
  (value: number) => console.log(value),
  () => ({ wait: 100 }),
  (state) => state.isPending,
)
utility.maybeExecute(42)
console.log(utility.state())
```

## Call Signature

```ts
function injectThrottler<TFn, TSelected>(
   fn,
   options,
selector): AngularThrottler<TFn, TSelected>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottler.ts:112](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L112)

Creates an Angular Throttler with a reactive selector result.

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

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`TFn`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularThrottler`](../interfaces/AngularThrottler.md)\<`TFn`, `TSelected`\>

The utility ref with the selected state.
