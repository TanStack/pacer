---
id: SolidAsyncQueuerOptions
title: SolidAsyncQueuerOptions
---

# Interface: SolidAsyncQueuerOptions\<TValue, TSelected\>

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L12)

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

Defined in: [solid-pacer/src/async-queuer/createAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L20)

Optional callback invoked when the owning component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`SolidAsyncQueuer`](SolidAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
