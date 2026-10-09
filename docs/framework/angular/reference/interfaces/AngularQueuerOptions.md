---
id: AngularQueuerOptions
title: AngularQueuerOptions
---

Defined in: [packages/angular-pacer/src/queuer/injectQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L22)

Options for [injectQueuer](../functions/injectQueuer.md), including core configuration and Angular cleanup.

## Extends

- `QueuerOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L27)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (stop automatic processing).

#### Parameters

##### core

`Queuer`\<`TValue`\>

#### Returns

`void`
