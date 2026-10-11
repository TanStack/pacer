---
id: AngularThrottler
title: AngularThrottler
---

Defined in: [throttler/injectThrottler.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L26)

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: ThrottlerOptions<TFn> & AngularThrottlerOptions<TFn, TSelected>;
```

Defined in: [throttler/injectThrottler.ts:30](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [throttler/injectThrottler.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L31)

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

Defined in: [throttler/injectThrottler.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L39)

Reactive state signal that will be updated when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [throttler/injectThrottler.ts:44](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L44)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
