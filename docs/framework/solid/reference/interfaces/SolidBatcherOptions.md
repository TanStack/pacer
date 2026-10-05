---
id: SolidBatcherOptions
title: SolidBatcherOptions
---

Defined in: [batcher/createBatcher.ts:11](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L11)

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

Defined in: [batcher/createBatcher.ts:19](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L19)

Optional callback invoked when the owning component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`SolidBatcher`](SolidBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
