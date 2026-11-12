---
id: SolidAsyncBatcherOptions
title: SolidAsyncBatcherOptions
---

Defined in: [async-batcher/createAsyncBatcher.ts:14](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L14)

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
optional onUnmount?: (batcher) => void;
```

Defined in: [async-batcher/createAsyncBatcher.ts:22](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L22)

Optional callback invoked when the owning component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`SolidAsyncBatcher`](SolidAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
