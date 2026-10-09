---
id: AngularAsyncQueuerOptions
title: AngularAsyncQueuerOptions
---

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L22)

Options for [injectAsyncQueuer](../functions/injectAsyncQueuer.md), including core configuration and Angular cleanup.

## Extends

- `AsyncQueuerOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L29)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (stop automatic processing and abort running work).

#### Parameters

##### core

`AsyncQueuer`\<`TValue`\>

#### Returns

`void`
