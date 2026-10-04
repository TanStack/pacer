---
id: LitAsyncBatcherOptions
title: LitAsyncBatcherOptions
---

Defined in: [async-batcher/createAsyncBatcher.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L13)

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

Defined in: [async-batcher/createAsyncBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitAsyncBatcher`](LitAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
