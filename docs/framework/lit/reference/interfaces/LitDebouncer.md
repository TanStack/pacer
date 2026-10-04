---
id: LitDebouncer
title: LitDebouncer
---

Defined in: [debouncer/createDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L22)

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
options: DebouncerOptions<TFn> & LitDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/createDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/createDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L27)

#### Parameters

##### options

`Partial`\<[`LitDebouncerOptions`](LitDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [debouncer/createDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
