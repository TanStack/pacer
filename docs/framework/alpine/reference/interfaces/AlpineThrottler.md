---
id: AlpineThrottler
title: AlpineThrottler
---

Defined in: [throttler/createThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L22)

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

Defined in: [throttler/createThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/createThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L27)

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

Defined in: [throttler/createThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<ThrottlerState<TFn>>;
```

Defined in: [throttler/createThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottler.ts#L29)

Subscribes a child owner to selected state with automatic cleanup.
