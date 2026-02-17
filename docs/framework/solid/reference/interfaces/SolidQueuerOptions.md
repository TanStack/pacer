---
id: SolidQueuerOptions
title: SolidQueuerOptions
---

# Interface: SolidQueuerOptions\<TValue, TSelected\>

Defined in: [solid-pacer/src/queuer/createQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L9)

## Extends

- `QueuerOptions`\<`TValue`\>

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

Defined in: [solid-pacer/src/queuer/createQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/queuer/createQueuer.ts#L17)

Optional callback invoked when the owning component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`SolidQueuer`](SolidQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
