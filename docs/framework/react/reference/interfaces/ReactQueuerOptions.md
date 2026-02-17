---
id: ReactQueuerOptions
title: ReactQueuerOptions
---

# Interface: ReactQueuerOptions\<TValue, TSelected\>

Defined in: [react-pacer/src/queuer/useQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L9)

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

Defined in: [react-pacer/src/queuer/useQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L17)

Optional callback invoked when the component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`ReactQueuer`](ReactQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
