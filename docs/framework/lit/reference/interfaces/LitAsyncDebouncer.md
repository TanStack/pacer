---
id: LitAsyncDebouncer
title: LitAsyncDebouncer
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L23)

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
options: AsyncDebouncerOptions<TFn> & LitAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L29)

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L33)

Subscribes a child owner to selected state with automatic cleanup.
