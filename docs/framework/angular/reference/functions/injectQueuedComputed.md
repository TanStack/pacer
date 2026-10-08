---
id: injectQueuedComputed
title: injectQueuedComputed
---

## Call Signature

```ts
function injectQueuedComputed<TValue>(source, options?): AngularQueuerComputed<TValue>;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedComputed.ts:37

Creates an Angular queued view of a source accessor.

The first read exposes the source value. An effect enqueues the initial value and each later value it observes; processing updates the returned value in queue order. Multiple source changes before an effect runs can collapse to the latest value.

Options accept an object or factory and follow [injectQueuer](injectQueuer.md) behavior.
Pass a selector to expose reactive queue state on `queuer.state()`.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

() => `TValue`

The source signal or accessor to observe.

#### options?

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

Core queue options or a reactive options factory.

### Returns

[`AngularQueuerComputed`](../interfaces/AngularQueuerComputed.md)\<`TValue`\>

The processed-value signal with its queuer attached.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectQueuedComputed(source, { wait: 100 })
source.set('next')
```

## Call Signature

```ts
function injectQueuedComputed<TValue, TSelected>(
   source,
   options,
selector): AngularQueuerComputed<TValue, TSelected>;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedComputed.ts:45

Creates the queued value signal with selected state on its attached queuer.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### source

() => `TValue`

#### options

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<`TValue`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached queuer.

### Returns

[`AngularQueuerComputed`](../interfaces/AngularQueuerComputed.md)\<`TValue`, `TSelected`\>
