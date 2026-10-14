---
id: AngularAsyncBatcherOptions
title: AngularAsyncBatcherOptions
---

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L28)

Options for [injectAsyncBatcher](../functions/injectAsyncBatcher.md), including core configuration and Angular cleanup.

## Extends

- `AsyncBatcherOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

## Properties

### onUnmount?

```ts
optional onUnmount?: (batcher) => void;
```

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:35](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L35)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending batches and abort running work).

#### Parameters

##### batcher

`AsyncBatcher`\<`TValue`\>

#### Returns

`void`
