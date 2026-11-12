---
id: AlpineAsyncDebouncer
title: AlpineAsyncDebouncer
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L22)

An AsyncDebouncer with framework-reactive selected state. All core methods remain available.

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L28)

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-debouncer/createAsyncDebouncer.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
