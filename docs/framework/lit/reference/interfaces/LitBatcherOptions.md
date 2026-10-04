---
id: LitBatcherOptions
title: LitBatcherOptions
---

Defined in: [batcher/createBatcher.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L10)

Options for createBatcher, including owner cleanup.

## Extends

- `BatcherOptions`\<`TValue`\>

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

Defined in: [batcher/createBatcher.ts:15](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatcher.ts#L15)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitBatcher`](LitBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
