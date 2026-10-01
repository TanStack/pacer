---
id: PreactAsyncQueuerOptions
title: PreactAsyncQueuerOptions
---

Defined in: [async-queuer/useAsyncQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L13)

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

Defined in: [async-queuer/useAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L21)

Optional callback invoked when the component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop + abort); use it to call flush(), flushAsBatch(), stop(), add logging, etc.

#### Parameters

##### queuer

[`PreactAsyncQueuer`](PreactAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
