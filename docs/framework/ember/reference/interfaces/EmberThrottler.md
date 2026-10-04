---
id: EmberThrottler
title: EmberThrottler
---

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L26)

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

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L31)

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

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
