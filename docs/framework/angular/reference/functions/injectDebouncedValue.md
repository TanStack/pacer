---
id: injectDebouncedValue
title: injectDebouncedValue
---

## Call Signature

```ts
function injectDebouncedValue<TValue>(signalToDebounce, options): AngularDebouncerValue<TValue>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedValue.ts:50](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L50)

Creates an Angular debounced view of a source signal.

The initial source value is available on first read. Source changes are observed by an effect and applied after the debounce delay; newer changes restart the delay.

The returned value is a real Angular signal with the underlying utility exposed
on `debouncer`. Options accept a static object or reactive factory and follow
[injectDebouncer](injectDebouncer.md) lifecycle and provider behavior.

### Type Parameters

#### TValue

`TValue`

### Parameters

#### signalToDebounce

() => `TValue`

The source signal or accessor whose changes are observed.

#### options

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<(`value`) => `void`\>\>

Core options or a reactive options factory.

### Returns

[`AngularDebouncerValue`](../interfaces/AngularDebouncerValue.md)\<`TValue`\>

The value signal with a `debouncer` attribute.

### Example

```ts
// In a component or service injection context.
const source = signal('initial')
const value = injectDebouncedValue(source, { wait: 250 })
source.set('updated')
console.log(value())
```

## Call Signature

```ts
function injectDebouncedValue<TValue, TSelected>(
   signalToDebounce,
   options,
selector): AngularDebouncerValue<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedValue.ts:58](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L58)

Creates the value signal with selected state on its attached utility ref.

### Type Parameters

#### TValue

`TValue`

#### TSelected

`TSelected`

### Parameters

#### signalToDebounce

() => `TValue`

#### options

`MaybeAccessor`\<[`AngularDebouncerOptions`](../interfaces/AngularDebouncerOptions.md)\<(`value`) => `void`\>\>

#### selector

(`state`) => `TSelected`

Selects reactive state exposed on the attached utility ref.

### Returns

[`AngularDebouncerValue`](../interfaces/AngularDebouncerValue.md)\<`TValue`, `TSelected`\>
