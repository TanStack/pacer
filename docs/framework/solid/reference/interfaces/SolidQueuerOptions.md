---
id: SolidQueuerOptions
title: SolidQueuerOptions
---

Defined in: [queuer/createQueuer.ts:11](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L11)

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
optional onUnmount?: (queuer) => void;
```

Defined in: [queuer/createQueuer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L19)

Optional callback invoked when the owning component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), flushAsBatch(), stop(), add logging, etc.

#### Parameters

##### queuer

[`SolidQueuer`](SolidQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
