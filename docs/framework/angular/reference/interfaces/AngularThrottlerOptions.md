---
id: AngularThrottlerOptions
title: AngularThrottlerOptions
---

Defined in: [throttler/injectThrottler.ts:23](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L23)

## Extends

- `ThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (throttler) => void;
```

Defined in: [throttler/injectThrottler.ts:31](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L31)

Optional callback invoked when the component is destroyed. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`AngularThrottler`](AngularThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
