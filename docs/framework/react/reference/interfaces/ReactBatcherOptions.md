---
id: ReactBatcherOptions
title: ReactBatcherOptions
---

# Interface: ReactBatcherOptions\<TValue, TSelected\>

Defined in: [react-pacer/src/batcher/useBatcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L9)

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

Defined in: [react-pacer/src/batcher/useBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/batcher/useBatcher.ts#L17)

Optional callback invoked when the component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`ReactBatcher`](ReactBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
