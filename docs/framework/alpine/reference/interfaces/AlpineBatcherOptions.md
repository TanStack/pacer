---
id: AlpineBatcherOptions
title: AlpineBatcherOptions
---

Defined in: [batcher/createBatcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L9)

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

Defined in: [batcher/createBatcher.ts:14](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L14)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineBatcher`](AlpineBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
