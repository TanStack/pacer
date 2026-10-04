---
id: AlpineAsyncQueuerOptions
title: AlpineAsyncQueuerOptions
---

Defined in: [async-queuer/createAsyncQueuer.ts:11](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L11)

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

Defined in: [async-queuer/createAsyncQueuer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L16)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncQueuer`](AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
