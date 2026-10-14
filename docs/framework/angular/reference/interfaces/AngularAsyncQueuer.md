---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:66](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L66)

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

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts:71](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L71)

The readonly selector result. Returns an empty object when no selector is supplied.
