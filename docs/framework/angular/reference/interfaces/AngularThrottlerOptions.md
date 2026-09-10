---
id: AngularThrottlerOptions
title: AngularThrottlerOptions
---

# Interface: AngularThrottlerOptions\<TFn, TSelected\>

Defined in: [angular-pacer/src/throttler/injectThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L13)

## Extends

- `ThrottlerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (throttler) => void;
```

Defined in: [angular-pacer/src/throttler/injectThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L21)

Optional callback invoked when the component is destroyed. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`AngularThrottler`](AngularThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
