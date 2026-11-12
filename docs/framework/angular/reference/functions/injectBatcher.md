---
id: injectBatcher
title: injectBatcher
---

## Call Signature

```ts
function injectBatcher<TValue>(fn, options?): AngularBatcher<TValue>;
```

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:97](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L97)

Creates and manages an Angular Batcher in the current injection context.

Collects items and processes a batch when its size or delay threshold is reached.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to cancel pending batches. Set `onUnmount` to replace it.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`items`) => `void`

The callback invoked by the core utility.

#### options?

`MaybeAccessor`\<[`AngularBatcherOptions`](../interfaces/AngularBatcherOptions.md)\<`TValue`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectBatcher(
  (items: Array<string>) => console.log(items),
  () => ({ maxSize: 10, wait: 100 }),
  (state) => state.isPending,
)
utility.addItem('job')
console.log(utility.state())
```

## Call Signature

```ts
function injectBatcher<TValue, TSelected>(
   fn,
   options,
selector): AngularBatcher<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:108](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L108)

Creates an Angular Batcher with a reactive selector result.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`items`) => `void`

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularBatcherOptions`](../interfaces/AngularBatcherOptions.md)\<`TValue`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`, `TSelected`\>

The utility ref with the selected state.
