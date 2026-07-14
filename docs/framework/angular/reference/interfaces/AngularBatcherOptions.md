---
id: AngularBatcherOptions
title: AngularBatcherOptions
---

# Interface: AngularBatcherOptions\<TValue, TSelected\>

Defined in: [batcher/injectBatcher.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L9)

## Extends

- `BatcherOptions`\<`TValue`\>

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

Defined in: [batcher/injectBatcher.ts:17](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L17)

Optional callback invoked when the component is destroyed. Receives the batcher instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### batcher

[`AngularBatcher`](AngularBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
