---
id: VueQueuerOptions
title: VueQueuerOptions
---

Defined in: [queuer/useQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L9)

Options for useQueuer, including owner cleanup.

## Extends

- `QueuerOptions`\<`TValue`\>

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

Defined in: [queuer/useQueuer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L14)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueQueuer`](VueQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
