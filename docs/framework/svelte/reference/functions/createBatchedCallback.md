---
id: createBatchedCallback
title: createBatchedCallback
---

```ts
function createBatchedCallback<TValue>(fn, options): (item) => void;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatchedCallback.ts:32](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatchedCallback.ts#L32)

Returns a stable batched callback owned by the Svelte lifecycle.

Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.

## Return value

Returns the bound addItem method, which accepts one item per call. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use createBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteBatcherOptions`](../interfaces/SvelteBatcherOptions.md)\<`TValue`, \{
\}\>\>

## Returns

```ts
(item): void;
```

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

### Parameters

#### item

`TValue`

### Returns

`void`

## Example

```ts
import { createBatchedCallback } from '@tanstack/svelte-pacer'

// During component initialization:
const schedule = createBatchedCallback((items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
schedule(1)
```

## See

createBatcher
