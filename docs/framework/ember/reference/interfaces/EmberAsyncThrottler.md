---
id: EmberAsyncThrottler
title: EmberAsyncThrottler
---

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L26)

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
options: AsyncThrottlerOptions<TFn> & EmberAsyncThrottlerOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L32)

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

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:36](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L36)

Selected state. Pass a selector to opt in; the default selection is an empty object.
