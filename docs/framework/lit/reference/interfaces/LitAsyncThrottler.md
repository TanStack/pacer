---
id: LitAsyncThrottler
title: LitAsyncThrottler
---

Defined in: [async-throttler/createAsyncThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/createAsyncThrottler.ts#L23)

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
options: AsyncThrottlerOptions<TFn> & LitAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/createAsyncThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/createAsyncThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/createAsyncThrottler.ts#L29)

#### Parameters

##### options

`Partial`\<[`LitAsyncThrottlerOptions`](LitAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:35](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/createAsyncThrottler.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler/createAsyncThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-throttler/createAsyncThrottler.ts#L33)

Subscribes a child owner to selected state with automatic cleanup.
