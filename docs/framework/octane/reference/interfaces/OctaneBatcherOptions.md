---
id: OctaneBatcherOptions
title: OctaneBatcherOptions
---

Defined in: [batcher/useBatcher.ts:10](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L10)

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

Defined in: [batcher/useBatcher.ts:15](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L15)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneBatcher`](OctaneBatcher.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
