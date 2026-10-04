---
id: EmberBatcherOptions
title: EmberBatcherOptions
---

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:13](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L13)

Options for useBatcher, including owner cleanup.

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
optional onUnmount?: (instance) => void;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberBatcher`](EmberBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
