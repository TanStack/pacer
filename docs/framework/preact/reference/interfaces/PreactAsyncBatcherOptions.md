---
id: PreactAsyncBatcherOptions
title: PreactAsyncBatcherOptions
---

# Interface: PreactAsyncBatcherOptions\<TValue, TSelected\>

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L12)

## Extends

- `AsyncBatcherOptions`\<`TValue`\>

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

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L20)

Optional callback invoked when the component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`PreactAsyncBatcher`](PreactAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
