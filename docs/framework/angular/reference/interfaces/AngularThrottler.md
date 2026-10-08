---
id: AngularThrottler
title: AngularThrottler
---

Defined in: packages/angular-pacer/src/throttler/injectThrottler.ts:53

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

Defined in: packages/angular-pacer/src/throttler/injectThrottler.ts:58

The readonly selector result. Returns an empty object when no selector is supplied.
