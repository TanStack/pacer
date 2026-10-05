---
id: SvelteAsyncThrottler
title: SvelteAsyncThrottler
---

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L22)

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
options: AsyncThrottlerOptions<TFn> & SvelteAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L28)

#### Parameters

##### options

`Partial`\<[`SvelteAsyncThrottlerOptions`](SvelteAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:34](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<AsyncThrottlerState<TFn>>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L32)

Subscribes a child snippet to state without updating the utility owner.
