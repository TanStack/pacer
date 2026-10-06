---
id: AngularQueuerOptions
title: AngularQueuerOptions
---

Defined in: [queuer/injectQueuer.ts:19](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L19)

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

Defined in: [queuer/injectQueuer.ts:27](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L27)

Optional callback invoked when the component is destroyed. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`AngularQueuer`](AngularQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
