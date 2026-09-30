---
id: PreactBatcherOptions
title: PreactBatcherOptions
---

Defined in: [batcher/useBatcher.ts:10](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L10)

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
optional onUnmount?: (batcher) => void;
```

Defined in: [batcher/useBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatcher.ts#L18)

Optional callback invoked when the component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`PreactBatcher`](PreactBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
