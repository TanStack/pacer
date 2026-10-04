---
id: AlpineThrottler
title: AlpineThrottler
---

Defined in: [throttler/createThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L21)

A Throttler with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: ThrottlerOptions<TFn> & AlpineThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/createThrottler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/createThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L26)

#### Parameters

##### options

`Partial`\<[`AlpineThrottlerOptions`](AlpineThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [throttler/createThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.
