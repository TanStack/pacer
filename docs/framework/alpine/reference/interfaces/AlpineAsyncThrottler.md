---
id: AlpineAsyncThrottler
title: AlpineAsyncThrottler
---

Defined in: [async-throttler/createAsyncThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L22)

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
options: AsyncThrottlerOptions<TFn> & AlpineAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/createAsyncThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L28)

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

Defined in: [async-throttler/createAsyncThrottler.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-throttler/createAsyncThrottler.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
