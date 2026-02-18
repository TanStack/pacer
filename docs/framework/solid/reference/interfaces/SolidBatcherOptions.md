---
id: SolidBatcherOptions
title: SolidBatcherOptions
---

# Interface: SolidBatcherOptions\<TValue, TSelected\>

Defined in: [solid-pacer/src/batcher/createBatcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L9)

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

Defined in: [solid-pacer/src/batcher/createBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L17)

Optional callback invoked when the owning component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`SolidBatcher`](SolidBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
