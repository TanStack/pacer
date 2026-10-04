---
id: VueAsyncDebouncer
title: VueAsyncDebouncer
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L22)

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
options: AsyncDebouncerOptions<TFn> & VueAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L28)

#### Parameters

##### options

`Partial`\<[`VueAsyncDebouncerOptions`](VueAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.
