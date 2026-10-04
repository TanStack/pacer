---
id: AlpineAsyncDebouncer
title: AlpineAsyncDebouncer
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L21)

A AsyncDebouncer with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncDebouncer`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncDebouncerOptions<TFn> & AlpineAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineAsyncDebouncerOptions`](AlpineAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
