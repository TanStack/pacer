---
id: SolidAsyncQueuerOptions
title: SolidAsyncQueuerOptions
---

Defined in: [async-queuer/createAsyncQueuer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L14)

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
optional onUnmount?: (queuer) => void;
```

Defined in: [async-queuer/createAsyncQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L22)

Optional callback invoked when the owning component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop + abort); use it to call flush(), flushAsBatch(), stop(), add logging, etc.

#### Parameters

##### queuer

[`SolidAsyncQueuer`](SolidAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
