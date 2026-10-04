---
id: LitAsyncDebouncer
title: LitAsyncDebouncer
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L22)

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
options: AsyncDebouncerOptions<TFn> & LitAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L28)

#### Parameters

##### options

`Partial`\<[`LitAsyncDebouncerOptions`](LitAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.
