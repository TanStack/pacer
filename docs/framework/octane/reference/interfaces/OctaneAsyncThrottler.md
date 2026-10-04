---
id: OctaneAsyncThrottler
title: OctaneAsyncThrottler
---

Defined in: [async-throttler/useAsyncThrottler.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L23)

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
options: AsyncThrottlerOptions<TFn> & OctaneAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [async-throttler/useAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-throttler/useAsyncThrottler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L29)

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

Defined in: [async-throttler/useAsyncThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottler.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
