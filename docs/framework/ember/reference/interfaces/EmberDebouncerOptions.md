---
id: EmberDebouncerOptions
title: EmberDebouncerOptions
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L19)

Options for useDebouncer, including owner cleanup.

## Extends

- `DebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L24)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberDebouncer`](EmberDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
