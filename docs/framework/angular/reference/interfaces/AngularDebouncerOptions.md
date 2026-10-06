---
id: AngularDebouncerOptions
title: AngularDebouncerOptions
---

Defined in: [debouncer/injectDebouncer.ts:22](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L22)

## Extends

- `DebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (debouncer) => void;
```

Defined in: [debouncer/injectDebouncer.ts:30](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L30)

Optional callback invoked when the component is destroyed. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`AngularDebouncer`](AngularDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
