---
id: injectQueuedSignal
title: injectQueuedSignal
---

## Call Signature

```ts
function injectQueuedSignal<TValue>(initialValue, options?): AngularQueuerSignal<TValue>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedSignal.ts:42](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L42)

Creates an Angular queued editable signal.

Every set and update is queued and processed in order. Updaters run against the committed value when their queue item executes.

Options accept an object or factory and follow [injectQueuer](injectQueuer.md) behavior.
Pass a selector to expose reactive queue state on `queuer.state()`.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

The initial committed value.

#### options?

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<() => `void`\>\>

Core queue options or a reactive options factory.

### Returns

[`AngularQueuerSignal`](../interfaces/AngularQueuerSignal.md)\<`TValue`\>

The processed-value signal with its queuer attached.

### Example

```ts
// In a component or service injection context.
const value = injectQueuedSignal(0, { wait: 100 })
value.set(1)
value.update(previous => previous + 1)
```

## Call Signature

```ts
function injectQueuedSignal<TValue, TSelected>(
   initialValue,
   options,
selector): AngularQueuerSignal<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedSignal.ts:50](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L50)

Creates the queued value signal with selected state on its attached queuer.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

#### options

`MaybeAccessor`\<[`AngularQueuerOptions`](../interfaces/AngularQueuerOptions.md)\<() => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached queuer.

### Returns

[`AngularQueuerSignal`](../interfaces/AngularQueuerSignal.md)\<`TValue`, `TSelected`\>
