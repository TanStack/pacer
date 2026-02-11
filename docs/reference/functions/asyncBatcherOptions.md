---
id: asyncBatcherOptions
title: asyncBatcherOptions
---

# Function: asyncBatcherOptions()

```ts
function asyncBatcherOptions<TValue, TOptions>(options): TOptions;
```

Defined in: [async-batcher.ts:168](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-batcher.ts#L168)

Utility function for sharing common `AsyncBatcherOptions` options between different `AsyncBatcher` instances.

## Type Parameters

### TValue

`TValue` = `any`

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncBatcherOptions`](../interfaces/AsyncBatcherOptions.md)\<`TValue`\>\> = `Partial`\<[`AsyncBatcherOptions`](../interfaces/AsyncBatcherOptions.md)\<`TValue`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
