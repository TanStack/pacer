---
id: AngularAsyncDebouncerOptions
title: AngularAsyncDebouncerOptions
---

Defined in: [async-debouncer/injectAsyncDebouncer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L15)

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

Defined in: [async-debouncer/injectAsyncDebouncer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L24)

Optional callback invoked when the component is destroyed. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### debouncer

[`AngularAsyncDebouncer`](AngularAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
