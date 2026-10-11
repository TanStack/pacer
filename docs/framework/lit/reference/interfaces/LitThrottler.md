---
id: LitThrottler
title: LitThrottler
---

Defined in: [throttler/createThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L23)

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
options: ThrottlerOptions<TFn> & LitThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/createThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/createThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L28)

#### Parameters

##### options

`Partial`\<[`LitThrottlerOptions`](LitThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [throttler/createThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<ThrottlerState<TFn>>;
```

Defined in: [throttler/createThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L30)

Subscribes a child owner to selected state with automatic cleanup.
