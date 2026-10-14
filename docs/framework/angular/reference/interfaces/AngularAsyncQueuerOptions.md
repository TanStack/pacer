---
id: AngularAsyncQueuerOptions
title: AngularAsyncQueuerOptions
---

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L28)

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

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L35)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (stop automatic processing and abort running work).

#### Parameters

##### core

`AsyncQueuer`\<`TValue`\>

#### Returns

`void`
