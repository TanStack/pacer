---
id: AngularBatcherOptions
title: AngularBatcherOptions
---

Defined in: [batcher/injectBatcher.ts:18](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L18)

## Extends

- `BatcherOptions`\<`TValue`\>

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

Defined in: [batcher/injectBatcher.ts:26](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L26)

Optional callback invoked when the component is destroyed. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`AngularBatcher`](AngularBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
