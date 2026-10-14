---
id: injectThrottledValue
title: injectThrottledValue
---

## Call Signature

```ts
function injectThrottledValue<TValue>(source, options): AngularThrottlerValue<TValue>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledValue.ts:50](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledValue.ts#L50)

Creates an Angular throttled view of a source signal.

The initial source value is available on first read. The unchanged initial value does not enter the throttler. An effect passes subsequent source changes to the throttler; later changes replace the pending trailing value without restarting the interval.

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

[`AngularThrottlerValue`](../interfaces/AngularThrottlerValue.md)\<`TValue`\>

The value signal with a `throttler` attribute.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectThrottledValue(source, { wait: 250 })
source.set('updated')
console.log(value())
```

## Call Signature

```ts
function injectThrottledValue<TValue, TSelected>(
   source,
   options,
selector): AngularThrottlerValue<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledValue.ts:58](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledValue.ts#L58)

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

[`AngularThrottlerValue`](../interfaces/AngularThrottlerValue.md)\<`TValue`, `TSelected`\>
