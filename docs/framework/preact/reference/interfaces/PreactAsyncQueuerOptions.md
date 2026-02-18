---
id: PreactAsyncQueuerOptions
title: PreactAsyncQueuerOptions
---

# Interface: PreactAsyncQueuerOptions\<TValue, TSelected\>

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L12)

## Extends

- `AsyncQueuerOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (queuer) => void;
```

Defined in: [preact-pacer/src/async-queuer/useAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-queuer/useAsyncQueuer.ts#L20)

Optional callback invoked when the component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop + abort); use it to call flush(), flushAsBatch(), stop(), add logging, etc.

#### Parameters

##### queuer

[`PreactAsyncQueuer`](PreactAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
