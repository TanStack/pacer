---
id: useDebouncedCallback
title: useDebouncedCallback
---

```ts
function useDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [debouncer/useDebouncedCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncedCallback.ts#L9)

Returns a stable debounced callback with the same options and cleanup as useDebouncer.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueDebouncerOptions`](../interfaces/VueDebouncerOptions.md)\<`TFn`, \{
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
