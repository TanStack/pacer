---
id: SvelteAsyncDebouncer
title: SvelteAsyncDebouncer
---

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L22)

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
options: AsyncDebouncerOptions<TFn> & SvelteAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L28)

#### Parameters

##### options

`Partial`\<[`SvelteAsyncDebouncerOptions`](SvelteAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<AsyncDebouncerState<TFn>>;
```

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L32)

Subscribes a child snippet to state without updating the utility owner.
