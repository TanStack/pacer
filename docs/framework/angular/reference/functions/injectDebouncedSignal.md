---
id: injectDebouncedSignal
title: injectDebouncedSignal
---

## Call Signature

```ts
function injectDebouncedSignal<TValue>(initialValue, options): AngularDebouncerSignal<TValue>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:52](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L52)

Creates an Angular debounced editable signal.

The initial value is available synchronously. `set` and `update` debounce writes: a newer write restarts the delay and replaces the pending write. An updater runs against the committed value when the delay expires.

The returned value is a real Angular writable signal with the underlying utility exposed
on `debouncer`. Options accept a static object or reactive factory and follow
[injectDebouncer](injectDebouncer.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### initialValue

`MaybeAccessor`\<`TValue`\>

The initial committed value.

#### options

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularDebouncerSignal`](../interfaces/AngularDebouncerSignal.md)\<`TValue`\>

The writable signal with `set`, `update`, `asReadonly`, and a `debouncer` attribute.

### Example

```ts
// In a component or service injection context.
const value = injectDebouncedSignal(0, { wait: 250 })
value.set(10)
value.update(previous => previous + 1)
console.log(value())
```

## Call Signature

```ts
function injectDebouncedSignal<TValue, TSelected>(
   initialValue,
   options,
selector): AngularDebouncerSignal<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:62](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L62)

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

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularDebouncerSignal`](../interfaces/AngularDebouncerSignal.md)\<`TValue`, `TSelected`\>
