---
id: injectThrottledSignal
title: injectThrottledSignal
---

## Call Signature

```ts
function injectThrottledSignal<TValue>(initialValue, options): AngularThrottlerSignal<TValue>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledSignal.ts:53](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L53)

Creates an Angular throttled editable signal.

The initial value is available synchronously. `set` and `update` share a throttler. Leading writes may apply immediately; subsequent writes replace the pending trailing write without extending its deadline. An updater runs against the committed value when executed.

The returned value is a real Angular writable signal with the underlying utility exposed
on `throttler`. Options accept a static object or reactive factory and follow
[injectThrottler](injectThrottler.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

The initial committed value.

#### options

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularThrottlerSignal`](../interfaces/AngularThrottlerSignal.md)\<`TValue`\>

The writable signal with `set`, `update`, `asReadonly`, and a `throttler` attribute.

### Example

```ts
// In a component or service injection context.
const value = injectThrottledSignal(0, { wait: 250 })
value.set(10)
value.update(previous => previous + 1)
console.log(value())
```

## Call Signature

```ts
function injectThrottledSignal<TValue, TSelected>(
   initialValue,
   options,
selector): AngularThrottlerSignal<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledSignal.ts:63](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L63)

Creates the value signal with selected state on its attached utility ref.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

#### options

`MaybeAccessor`\<[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularThrottlerSignal`](../interfaces/AngularThrottlerSignal.md)\<`TValue`, `TSelected`\>
