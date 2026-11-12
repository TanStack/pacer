---
id: LitAsyncQueuerOptions
title: LitAsyncQueuerOptions
---

Defined in: [async-queuer/createAsyncQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L13)

Options for createAsyncQueuer, including owner cleanup.

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

Defined in: [async-queuer/createAsyncQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitAsyncQueuer`](LitAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
