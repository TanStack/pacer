---
id: injectAsyncQueuer
title: injectAsyncQueuer
---

## Call Signature

```ts
function injectAsyncQueuer<TValue>(fn, options?): AngularAsyncQueuer<TValue>;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:102](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L102)

Creates and manages an Angular AsyncQueuer in the current injection context.

Processes queued items asynchronously with configurable pacing and concurrency.

## Options and state

Accepts static options or an options factory. Factories are read lazily, and signal
dependencies update the existing core instance. Local options override provider defaults.
Methods apply current options before executing and run outside Angular's zone.

Pass a selector to expose reactive core state through `state()`. Without a selector,
`state()` returns `{}`; operations remain available on the ref.

## Cleanup

The default cleanup is to stop automatic processing and abort running work. Set `onUnmount` to replace it.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### fn

(`item`) => `Promise`\<`any`\>

The callback invoked by the core utility.

#### options?

`MaybeAccessor`\<[`AngularAsyncQueuerOptions`](../interfaces/AngularAsyncQueuerOptions.md)\<`TValue`\>\>

Core options or a reactive factory returning them.

### Returns

[`AngularAsyncQueuer`](../interfaces/AngularAsyncQueuer.md)\<`TValue`\>

A ref containing stable methods and a readonly selected-state signal.

### Example

```ts
// In a component or service injection context.
const utility = injectAsyncQueuer(
  (item: string) => Promise.resolve(item),
  () => ({ wait: 100, concurrency: 2 }),
  (state) => state.items,
)
utility.addItem('job')
console.log(utility.state())
```

## Call Signature

```ts
function injectAsyncQueuer<TValue, TSelected>(
   fn,
   options,
selector): AngularAsyncQueuer<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:113](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L113)

Creates an Angular AsyncQueuer with a reactive selector result.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### fn

(`item`) => `Promise`\<`any`\>

The callback invoked by the core utility.

#### options

`MaybeAccessor`\<[`AngularAsyncQueuerOptions`](../interfaces/AngularAsyncQueuerOptions.md)\<`TValue`\>\>

Core options or a reactive options factory.

#### selector

(`state`) => `TSelected`

Selects the state exposed by the returned `state` signal.

### Returns

[`AngularAsyncQueuer`](../interfaces/AngularAsyncQueuer.md)\<`TValue`, `TSelected`\>

The utility ref with the selected state.
