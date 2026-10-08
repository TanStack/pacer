---
id: injectQueuer
title: injectQueuer
---

## Call Signature

```ts
function injectQueuer<TValue>(fn, options?): AngularQueuer<TValue>;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuer.ts:96

Creates and manages an Angular Queuer in the current injection context.

Processes queued items in order with configurable pacing, capacity, and priority.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to stop automatic processing. Set `onUnmount` to replace it.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`item`) => `void`

The callback invoked by the core utility.

#### options?

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectQueuer(
  (item: string) => console.log(item),
  () => ({ wait: 100 }),
  (state) => state.items,
)
utility.addItem('job')
console.log(utility.state())
```

## Call Signature

```ts
function injectQueuer<TValue, TSelected>(
   fn,
   options,
selector): AngularQueuer<TValue, TSelected>;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuer.ts:107

Creates an Angular Queuer with a reactive selector result.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`item`) => `void`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, `TSelected`\>

The utility ref with the selected state.
