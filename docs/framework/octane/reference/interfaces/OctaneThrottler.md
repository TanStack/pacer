---
id: OctaneThrottler
title: OctaneThrottler
---

Defined in: [throttler/useThrottler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L25)

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
options: ThrottlerOptions<TFn> & OctaneThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/useThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/useThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L30)

#### Parameters

##### options

`Partial`\<[`OctaneThrottlerOptions`](OctaneThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [throttler/useThrottler.ts:34](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<ThrottlerState<TFn>>;
```

Defined in: [throttler/useThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L32)

Selects state in a child without subscribing the utility owner.
