---
id: createAsyncBatchedCallback
title: createAsyncBatchedCallback
---

```ts
function createAsyncBatchedCallback<TValue>(
   scope,
   fn,
options): (item) => Promise<any>;
```

Defined in: [async-batcher/createAsyncBatchedCallback.ts:36](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-batcher/createAsyncBatchedCallback.ts#L36)

Returns a stable batched callback owned by the Alpine lifecycle.

Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.

## Return value

Returns the bound addItem method, which accepts one item per call. The returned Promise preserves the core result and error contract. An addition that only schedules a batch does not await the later batch result.

## State and ownership

Use createAsyncBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

(`items`) => `Promise`\<`any`\>

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncBatcherOptions`](../interfaces/AlpineAsyncBatcherOptions.md)\<`TValue`, \{
\}\>\>

## Returns

```ts
(item): Promise<any>;
```

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

### Parameters

#### item

`TValue`

### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

### Throws

The error from the batch function if no onError handler is configured or throwOnError is true

## Example

```ts
import { createAsyncBatchedCallback } from '@tanstack/alpine-pacer'

// scope belongs to the current Alpine component.
const schedule = createAsyncBatchedCallback(scope, async (items: Array<number>) => { console.log(items) }, { maxSize: 5, wait: 500 })
void schedule(1)
```

## See

createAsyncBatcher
