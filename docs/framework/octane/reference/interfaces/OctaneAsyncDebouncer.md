---
id: OctaneAsyncDebouncer
title: OctaneAsyncDebouncer
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L23)

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
options: AsyncDebouncerOptions<TFn> & OctaneAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L29)

#### Parameters

##### options

`Partial`\<[`OctaneAsyncDebouncerOptions`](OctaneAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
