---
id: AngularThrottler
title: AngularThrottler
---

Defined in: [throttler/injectThrottler.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L33)

## Extends

- `Pick`\<`Throttler`\<`TFn`\>, `"maybeExecute"` \| `"flush"` \| `"cancel"` \| `"reset"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [throttler/injectThrottler.ts:38](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L38)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [throttler/injectThrottler.ts:37](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L37)

***

### options

```ts
readonly options: Signal<ThrottlerOptions<TFn> & AngularThrottlerOptions<TFn, TSelected>>;
```

Defined in: [throttler/injectThrottler.ts:39](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L39)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/injectThrottler.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L45)

#### Parameters

##### options

`Partial`\<[`AngularThrottlerOptions`](AngularThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [throttler/injectThrottler.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L44)

***

### store

```ts
readonly store: Signal<Store<Readonly<ThrottlerState<TFn>>, never>>;
```

Defined in: [throttler/injectThrottler.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L43)

Core store access; use state() for reactive selected state.
