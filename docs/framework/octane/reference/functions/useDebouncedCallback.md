---
id: useDebouncedCallback
title: useDebouncedCallback
---

```ts
function useDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [debouncer/useDebouncedCallback.ts:10](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncedCallback.ts#L10)

Returns a stable debounced callback with the same options and cleanup as useDebouncer.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneDebouncerOptions`](../interfaces/OctaneDebouncerOptions.md)\<`TFn`, \{
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
