---
id: AngularDebouncerOptions
title: AngularDebouncerOptions
---

# Interface: AngularDebouncerOptions\<TFn, TSelected\>

Defined in: [debouncer/injectDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L13)

## Extends

- `DebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (debouncer) => void;
```

Defined in: [debouncer/injectDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L21)

Optional callback invoked when the component is destroyed. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`AngularDebouncer`](AngularDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
