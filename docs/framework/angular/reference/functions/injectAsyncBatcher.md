---
id: injectAsyncBatcher
title: injectAsyncBatcher
---

## Call Signature

```ts
function injectAsyncBatcher<TValue>(fn, options?): AngularAsyncBatcher<TValue>;
```

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:98](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L98)

Creates and manages an Angular AsyncBatcher in the current injection context.

Collects items and processes each batch asynchronously when its size or delay threshold is reached.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to cancel pending batches and abort running work. Set `onUnmount` to replace it.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`items`) => `Promise`\<`any`\>

The callback invoked by the core utility.

#### options?

`MaybeAccessor`\<[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectAsyncBatcher(
  (items: Array<string>) => Promise.resolve(items),
  () => ({ maxSize: 10, wait: 100 }),
  (state) => state.isPending,
)
utility.addItem('job')
console.log(utility.state())
```

## Call Signature

```ts
function injectAsyncBatcher<TValue, TSelected>(
   fn,
   options,
selector): AngularAsyncBatcher<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:109](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L109)

Creates an Angular AsyncBatcher with a reactive selector result.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`items`) => `Promise`\<`any`\>

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

The utility ref with the selected state.
