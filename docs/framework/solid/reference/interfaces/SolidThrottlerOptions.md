---
id: SolidThrottlerOptions
title: SolidThrottlerOptions
---

Defined in: [throttler/createThrottler.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L15)

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

Defined in: [throttler/createThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L23)

Optional callback invoked when the owning component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`SolidThrottler`](SolidThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
