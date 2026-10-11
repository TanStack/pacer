---
id: EmberDebouncer
title: EmberDebouncer
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L28)

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

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L33)

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

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:37](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L37)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<DebouncerState<TFn>>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L35)

Selects state in a child without subscribing the utility owner.
