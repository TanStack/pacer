---
id: LitThrottler
title: LitThrottler
---

Defined in: [throttler/createThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L22)

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

Defined in: [throttler/createThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/createThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L27)

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

Defined in: [throttler/createThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
