---
id: EmberDebouncer
title: EmberDebouncer
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L26)

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
options: DebouncerOptions<TFn> & EmberDebouncerOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L31)

#### Parameters

##### options

`Partial`\<[`EmberDebouncerOptions`](EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
