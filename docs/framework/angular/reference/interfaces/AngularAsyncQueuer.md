---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

Defined in: packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:60

An Angular AsyncQueuer ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`AsyncQueuer`\<`TValue`\>, `AsyncQueuerMethod`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:65

The readonly selector result. Returns an empty object when no selector is supplied.
