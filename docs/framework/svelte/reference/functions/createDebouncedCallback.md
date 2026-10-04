---
id: createDebouncedCallback
title: createDebouncedCallback
---

```ts
function createDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncedCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncedCallback.ts#L9)

Returns a stable debounced callback with the same options and cleanup as createDebouncer.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`TFn`, \{
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
