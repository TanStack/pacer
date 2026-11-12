---
id: EmberAsyncDebouncer
title: EmberAsyncDebouncer
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L28)

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
options: AsyncDebouncerOptions<TFn> & EmberAsyncDebouncerOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L34)

#### Parameters

##### options

`Partial`\<[`EmberAsyncDebouncerOptions`](EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:40](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L40)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<AsyncDebouncerState<TFn>>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:38](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L38)

Selects state in a child without subscribing the utility owner.
