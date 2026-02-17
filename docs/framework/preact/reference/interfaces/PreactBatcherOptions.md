---
id: PreactBatcherOptions
title: PreactBatcherOptions
---

# Interface: PreactBatcherOptions\<TValue, TSelected\>

Defined in: [preact-pacer/src/batcher/useBatcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L9)

## Extends

- `BatcherOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (batcher) => void;
```

Defined in: [preact-pacer/src/batcher/useBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L17)

Optional callback invoked when the component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`PreactBatcher`](PreactBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
