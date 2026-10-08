---
id: AngularAsyncBatcherOptions
title: AngularAsyncBatcherOptions
---

Defined in: packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:22

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

Defined in: packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:29

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending batches and abort running work).

#### Parameters

##### batcher

`AsyncBatcher`\<`TValue`\>

#### Returns

`void`
