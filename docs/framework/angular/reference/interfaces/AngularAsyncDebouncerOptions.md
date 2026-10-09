---
id: AngularAsyncDebouncerOptions
title: AngularAsyncDebouncerOptions
---

Defined in: [packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L26)

Options for [injectAsyncDebouncer](../functions/injectAsyncDebouncer.md), including core configuration and Angular cleanup.

## Extends

- `AsyncDebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L33)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending execution and abort running work).

#### Parameters

##### core

`AsyncDebouncer`\<`TFn`\>

#### Returns

`void`
