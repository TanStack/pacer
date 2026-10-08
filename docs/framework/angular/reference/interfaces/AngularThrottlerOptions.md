---
id: AngularThrottlerOptions
title: AngularThrottlerOptions
---

Defined in: packages/angular-pacer/src/throttler/injectThrottler.ts:26

Options for [injectThrottler](../functions/injectThrottler.md), including core configuration and Angular cleanup.

## Extends

- `ThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: packages/angular-pacer/src/throttler/injectThrottler.ts:33

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (cancel pending execution).

#### Parameters

##### core

`Throttler`\<`TFn`\>

#### Returns

`void`
