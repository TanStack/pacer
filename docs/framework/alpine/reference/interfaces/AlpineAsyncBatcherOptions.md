---
id: AlpineAsyncBatcherOptions
title: AlpineAsyncBatcherOptions
---

Defined in: [async-batcher/createAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L12)

Options for createAsyncBatcher, including owner cleanup.

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

Defined in: [async-batcher/createAsyncBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatcher.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncBatcher`](AlpineAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
