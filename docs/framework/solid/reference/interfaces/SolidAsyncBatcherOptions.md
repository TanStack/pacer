---
id: SolidAsyncBatcherOptions
title: SolidAsyncBatcherOptions
---

# Interface: SolidAsyncBatcherOptions\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L12)

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

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L20)

Optional callback invoked when the owning component unmounts. Receives the batcher instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`SolidAsyncBatcher`](SolidAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
