---
id: AngularAsyncQueuerOptions
title: AngularAsyncQueuerOptions
---

Defined in: [async-queuer/injectAsyncQueuer.ts:22](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L22)

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

Defined in: [async-queuer/injectAsyncQueuer.ts:31](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L31)

Optional callback invoked when the component is destroyed. Receives the queuer instance.
When provided, replaces the default cleanup (stop + abort); use it to call flush(), stop(), add logging, etc.
When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

#### Parameters

##### queuer

[`AngularAsyncQueuer`](AngularAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
