---
id: EmberAsyncThrottler
title: EmberAsyncThrottler
---

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L28)

An AsyncThrottler with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncThrottlerOptions<TFn> & EmberAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:34](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L34)

#### Parameters

##### options

`Partial`\<[`EmberAsyncThrottlerOptions`](EmberAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:40](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L40)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:38](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L38)

Selects state in a child without subscribing the utility owner.
