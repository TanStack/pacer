---
id: ReactThrottlerOptions
title: ReactThrottlerOptions
---

# Interface: ReactThrottlerOptions\<TFn, TSelected\>

Defined in: [react-pacer/src/throttler/useThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/throttler/useThrottler.ts#L13)

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

Defined in: [react-pacer/src/throttler/useThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/throttler/useThrottler.ts#L21)

Optional callback invoked when the component unmounts. Receives the throttler instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### throttler

[`ReactThrottler`](ReactThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
