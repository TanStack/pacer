---
id: OctaneAsyncDebouncer
title: OctaneAsyncDebouncer
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L25)

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
options: AsyncDebouncerOptions<TFn> & OctaneAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L31)

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

Defined in: [async-debouncer/useAsyncDebouncer.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L37)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<AsyncDebouncerState<TFn>>;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L35)

Selects state in a child without subscribing the utility owner.
