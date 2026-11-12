---
id: EmberThrottlerOptions
title: EmberThrottlerOptions
---

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:19](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L19)

Options for useThrottler, including owner cleanup.

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
optional onUnmount?: (instance) => void;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:24](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L24)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberThrottler`](EmberThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
