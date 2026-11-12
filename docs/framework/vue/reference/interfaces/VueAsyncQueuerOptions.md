---
id: VueAsyncQueuerOptions
title: VueAsyncQueuerOptions
---

Defined in: [async-queuer/useAsyncQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L13)

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

Defined in: [async-queuer/useAsyncQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueAsyncQueuer`](VueAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
