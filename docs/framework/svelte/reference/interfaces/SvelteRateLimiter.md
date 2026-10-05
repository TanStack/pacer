---
id: SvelteRateLimiter
title: SvelteRateLimiter
---

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts#L22)

A RateLimiter with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: RateLimiterOptions<TFn> & SvelteRateLimiterOptions<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts#L28)

#### Parameters

##### options

`Partial`\<[`SvelteRateLimiterOptions`](SvelteRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts:34](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<RateLimiterState>;
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimiter.ts#L32)

Subscribes a child snippet to state without updating the utility owner.
