---
id: AngularAsyncBatcherOptions
title: AngularAsyncBatcherOptions
---

Defined in: [async-batcher/injectAsyncBatcher.ts:14](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L14)

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

Defined in: [async-batcher/injectAsyncBatcher.ts:23](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L23)

Optional callback invoked when the component is destroyed. Receives the batcher instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### batcher

[`AngularAsyncBatcher`](AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
