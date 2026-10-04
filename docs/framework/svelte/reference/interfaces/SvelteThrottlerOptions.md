---
id: SvelteThrottlerOptions
title: SvelteThrottlerOptions
---

Defined in: [packages/svelte-pacer/src/throttler/createThrottler.ts:12](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottler.ts#L12)

Options for createThrottler, including owner cleanup.

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

Defined in: [packages/svelte-pacer/src/throttler/createThrottler.ts:17](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottler.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`SvelteThrottler`](SvelteThrottler.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
