---
id: VueDebouncer
title: VueDebouncer
---

Defined in: [debouncer/useDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L22)

A Debouncer with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: DebouncerOptions<TFn> & VueDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/useDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/useDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L27)

#### Parameters

##### options

`Partial`\<[`VueDebouncerOptions`](VueDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [debouncer/useDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
