---
id: LitQueuerOptions
title: LitQueuerOptions
---

Defined in: [queuer/createQueuer.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L10)

Options for createQueuer, including owner cleanup.

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

Defined in: [queuer/createQueuer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L15)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitQueuer`](LitQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
