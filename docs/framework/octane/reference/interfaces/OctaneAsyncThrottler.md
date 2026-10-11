---
id: OctaneAsyncThrottler
title: OctaneAsyncThrottler
---

Defined in: [async-throttler/useAsyncThrottler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L25)

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
options: AsyncThrottlerOptions<TFn> & OctaneAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/useAsyncThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L31)

#### Parameters

##### options

`Partial`\<[`OctaneAsyncThrottlerOptions`](OctaneAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L37)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:35](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L35)

Selects state in a child without subscribing the utility owner.
