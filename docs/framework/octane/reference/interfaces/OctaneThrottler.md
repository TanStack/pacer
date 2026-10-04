---
id: OctaneThrottler
title: OctaneThrottler
---

Defined in: [throttler/useThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L23)

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

Defined in: [throttler/useThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/useThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L28)

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

Defined in: [throttler/useThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottler.ts#L30)

Selected state. Pass a selector to opt in; the default selection is an empty object.
