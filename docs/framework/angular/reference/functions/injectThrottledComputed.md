---
id: injectThrottledComputed
title: injectThrottledComputed
---

## Call Signature

```ts
function injectThrottledComputed<TValue>(source, options): AngularThrottlerComputed<TValue>;
```

Defined in: packages/angular-pacer/src/throttler/injectThrottledComputed.ts:44

Creates an Angular throttled view of a source signal.

The initial source value is available on first read. An effect passes source values to the throttler, including the initial value. Later changes replace the pending trailing value without restarting the interval.

The returned value is a real Angular signal with the underlying utility exposed
on `throttler`. Options accept a static object or reactive factory and follow
[injectThrottler](injectThrottler.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### source

() => `TValue`

The source signal or accessor whose changes are observed.

#### options

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularThrottlerComputed`](../interfaces/AngularThrottlerComputed.md)\<`TValue`\>

The value signal with a `throttler` attribute.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectThrottledComputed(source, { wait: 250 })
source.set('updated')
console.log(value())
```

## Call Signature

```ts
function injectThrottledComputed<TValue, TSelected>(
   source,
   options,
selector): AngularThrottlerComputed<TValue, TSelected>;
```

Defined in: packages/angular-pacer/src/throttler/injectThrottledComputed.ts:52

Creates the value signal with selected state on its attached utility ref.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### source

() => `TValue`

#### options

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularThrottlerComputed`](../interfaces/AngularThrottlerComputed.md)\<`TValue`, `TSelected`\>
