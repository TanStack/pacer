---
id: EmberAsyncBatcherOptions
title: EmberAsyncBatcherOptions
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L18)

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

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L23)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberAsyncBatcher`](EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
