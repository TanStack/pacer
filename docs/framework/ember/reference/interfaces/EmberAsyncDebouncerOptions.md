---
id: EmberAsyncDebouncerOptions
title: EmberAsyncDebouncerOptions
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L17)

Options for useAsyncDebouncer, including owner cleanup.

## Extends

- `AsyncDebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L22)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberAsyncDebouncer`](EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
