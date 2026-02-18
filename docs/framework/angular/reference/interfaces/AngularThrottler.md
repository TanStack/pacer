---
id: AngularThrottler
title: AngularThrottler
---

# Interface: AngularThrottler\<TFn, TSelected\>

Defined in: [throttler/injectThrottler.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L24)

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [throttler/injectThrottler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L33)

Reactive state signal that will be updated when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [throttler/injectThrottler.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L38)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
