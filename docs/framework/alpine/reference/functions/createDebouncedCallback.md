---
id: createDebouncedCallback
title: createDebouncedCallback
---

```ts
function createDebouncedCallback<TFn>(
   scope,
   fn,
   options): (...args) => void;
```

Defined in: [debouncer/createDebouncedCallback.ts:10](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncedCallback.ts#L10)

Returns a stable debounced callback with the same options and cleanup as createDebouncer.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

`TFn`

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): void;
```

Attempts to execute the debounced function
If a call is already in progress, it will be queued

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`
