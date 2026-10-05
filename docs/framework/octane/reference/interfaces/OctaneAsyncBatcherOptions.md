---
id: OctaneAsyncBatcherOptions
title: OctaneAsyncBatcherOptions
---

Defined in: [async-batcher/useAsyncBatcher.ts:15](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L15)

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

Defined in: [async-batcher/useAsyncBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-batcher/useAsyncBatcher.ts#L20)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneAsyncBatcher`](OctaneAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
