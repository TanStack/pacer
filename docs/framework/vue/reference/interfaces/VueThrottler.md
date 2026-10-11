---
id: VueThrottler
title: VueThrottler
---

Defined in: [throttler/useThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L23)

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
options: ThrottlerOptions<TFn> & VueThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/useThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/useThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L28)

#### Parameters

##### options

`Partial`\<[`VueThrottlerOptions`](VueThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [throttler/useThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<ThrottlerState<TFn>>;
```

Defined in: [throttler/useThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottler.ts#L30)

Subscribes a scoped slot to state without re-rendering the utility owner.
