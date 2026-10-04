---
id: EmberAsyncDebouncer
title: EmberAsyncDebouncer
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L26)

A AsyncDebouncer with framework-reactive selected state. All core methods remain available.

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

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L32)

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

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:36](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L36)

Selected state. Pass a selector to opt in; the default selection is an empty object.
