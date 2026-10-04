---
id: VueQueuerOptions
title: VueQueuerOptions
---

Defined in: [queuer/useQueuer.ts:10](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L10)

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

Defined in: [queuer/useQueuer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L15)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueQueuer`](VueQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
