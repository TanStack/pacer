---
id: VueAsyncThrottler
title: VueAsyncThrottler
---

Defined in: [async-throttler/useAsyncThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L23)

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
options: AsyncThrottlerOptions<TFn> & VueAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/useAsyncThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L29)

#### Parameters

##### options

`Partial`\<[`VueAsyncThrottlerOptions`](VueAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:35](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-throttler/useAsyncThrottler.ts#L33)

Subscribes a scoped slot to state without re-rendering the utility owner.
