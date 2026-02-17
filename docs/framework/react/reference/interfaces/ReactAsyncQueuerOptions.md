---
id: ReactAsyncQueuerOptions
title: ReactAsyncQueuerOptions
---

# Interface: ReactAsyncQueuerOptions\<TValue, TSelected\>

Defined in: [react-pacer/src/async-queuer/useAsyncQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-queuer/useAsyncQueuer.ts#L12)

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

Defined in: [react-pacer/src/async-queuer/useAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-queuer/useAsyncQueuer.ts#L20)

Optional callback invoked when the component unmounts. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`ReactAsyncQueuer`](ReactAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
