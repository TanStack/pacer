---
id: AngularQueuerOptions
title: AngularQueuerOptions
---

# Interface: AngularQueuerOptions\<TValue, TSelected\>

Defined in: [angular-pacer/src/queuer/injectQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L9)

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

Defined in: [angular-pacer/src/queuer/injectQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L17)

Optional callback invoked when the component is destroyed. Receives the queuer instance.
When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.

#### Parameters

##### queuer

[`AngularQueuer`](AngularQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
