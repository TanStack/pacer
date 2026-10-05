---
id: AlpineDebouncer
title: AlpineDebouncer
---

Defined in: [debouncer/createDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L22)

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

Defined in: [debouncer/createDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/createDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L27)

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

Defined in: [debouncer/createDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<DebouncerState<TFn>>;
```

Defined in: [debouncer/createDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L29)

Subscribes a child owner to selected state with automatic cleanup.
