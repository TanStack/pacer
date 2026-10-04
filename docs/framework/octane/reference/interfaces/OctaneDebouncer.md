---
id: OctaneDebouncer
title: OctaneDebouncer
---

Defined in: [debouncer/useDebouncer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L25)

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
options: DebouncerOptions<TFn> & OctaneDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/useDebouncer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/useDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L30)

#### Parameters

##### options

`Partial`\<[`OctaneDebouncerOptions`](OctaneDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [debouncer/useDebouncer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<DebouncerState<TFn>>;
```

Defined in: [debouncer/useDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L32)

Selects state in a child without subscribing the utility owner.
