---
id: AngularBatcherOptions
title: AngularBatcherOptions
---

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:28](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L28)

Options for [injectBatcher](../functions/injectBatcher.md), including core configuration and Angular cleanup.

## Extends

- `BatcherOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L33)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending batches).

#### Parameters

##### core

`Batcher`\<`TValue`\>

#### Returns

`void`
