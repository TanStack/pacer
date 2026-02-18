---
id: AngularAsyncBatcherOptions
title: AngularAsyncBatcherOptions
---

# Interface: AngularAsyncBatcherOptions\<TValue, TSelected\>

Defined in: [angular-pacer/src/async-batcher/injectAsyncBatcher.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L12)

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

Defined in: [angular-pacer/src/async-batcher/injectAsyncBatcher.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L21)

Optional callback invoked when the component is destroyed. Receives the batcher instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### batcher

[`AngularAsyncBatcher`](AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
