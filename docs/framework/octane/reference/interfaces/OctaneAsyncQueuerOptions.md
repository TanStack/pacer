---
id: OctaneAsyncQueuerOptions
title: OctaneAsyncQueuerOptions
---

Defined in: [async-queuer/useAsyncQueuer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L15)

Options for useAsyncQueuer, including owner cleanup.

## Extends

- `AsyncQueuerOptions`\<`TValue`\>

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

Defined in: [async-queuer/useAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L20)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneAsyncQueuer`](OctaneAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
