---
id: AlpineDebouncer
title: AlpineDebouncer
---

Defined in: [debouncer/createDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L21)

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
options: DebouncerOptions<TFn> & AlpineDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/createDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/createDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L26)

#### Parameters

##### options

`Partial`\<[`AlpineDebouncerOptions`](AlpineDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [debouncer/createDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.
