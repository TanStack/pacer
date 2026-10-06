---
id: AngularAsyncDebouncerOptions
title: AngularAsyncDebouncerOptions
---

Defined in: [async-debouncer/injectAsyncDebouncer.ts:23](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L23)

## Extends

- `AsyncDebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (debouncer) => void;
```

Defined in: [async-debouncer/injectAsyncDebouncer.ts:32](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L32)

Optional callback invoked when the component is destroyed. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### debouncer

[`AngularAsyncDebouncer`](AngularAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
