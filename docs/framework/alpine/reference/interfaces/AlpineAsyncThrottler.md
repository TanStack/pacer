---
id: AlpineAsyncThrottler
title: AlpineAsyncThrottler
---

Defined in: [async-throttler/createAsyncThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L21)

A AsyncThrottler with framework-reactive selected state. All core methods remain available.

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
options: AsyncThrottlerOptions<TFn> & AlpineAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/createAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineAsyncThrottlerOptions`](AlpineAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
