---
id: VueAsyncBatcherOptions
title: VueAsyncBatcherOptions
---

Defined in: [async-batcher/useAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L12)

Options for useAsyncBatcher, including owner cleanup.

## Extends

- `AsyncBatcherOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [async-batcher/useAsyncBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueAsyncBatcher`](VueAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
