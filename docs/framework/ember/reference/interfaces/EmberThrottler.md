---
id: EmberThrottler
title: EmberThrottler
---

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L28)

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
options: ThrottlerOptions<TFn> & EmberThrottlerOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L33)

#### Parameters

##### options

`Partial`\<[`EmberThrottlerOptions`](EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:37](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L37)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<ThrottlerState<TFn>>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:35](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L35)

Selects state in a child without subscribing the utility owner.
