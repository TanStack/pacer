---
id: AngularThrottler
title: AngularThrottler
---

Defined in: [packages/angular-pacer/src/throttler/injectThrottler.ts:53](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L53)

An Angular Throttler ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`Throttler`\<`TFn`\>, `ThrottlerMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottler.ts:58](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L58)

The readonly selector result. Returns an empty object when no selector is supplied.
