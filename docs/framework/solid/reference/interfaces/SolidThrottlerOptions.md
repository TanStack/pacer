---
id: SolidThrottlerOptions
title: SolidThrottlerOptions
---

# Interface: SolidThrottlerOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/throttler/createThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L13)

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

Defined in: [solid-pacer/src/throttler/createThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`SolidThrottler`](SolidThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
