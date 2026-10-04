---
id: LitDebouncer
title: LitDebouncer
---

Defined in: [debouncer/createDebouncer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L23)

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

Defined in: [debouncer/createDebouncer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/createDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L28)

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

Defined in: [debouncer/createDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<DebouncerState<TFn>>;
```

Defined in: [debouncer/createDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L30)

Subscribes a child owner to selected state with automatic cleanup.
