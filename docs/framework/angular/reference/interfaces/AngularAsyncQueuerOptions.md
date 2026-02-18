---
id: AngularAsyncQueuerOptions
title: AngularAsyncQueuerOptions
---

# Interface: AngularAsyncQueuerOptions\<TValue, TSelected\>

Defined in: [async-queuer/injectAsyncQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L12)

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

Defined in: [async-queuer/injectAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L21)

Optional callback invoked when the component is destroyed. Receives the queuer instance.
When provided, replaces the default cleanup (stop + abort); use it to call flush(), stop(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### queuer

[`AngularAsyncQueuer`](AngularAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
