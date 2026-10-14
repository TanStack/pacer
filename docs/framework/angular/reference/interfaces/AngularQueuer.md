---
id: AngularQueuer
title: AngularQueuer
---

Defined in: [packages/angular-pacer/src/queuer/injectQueuer.ts:60](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L60)

An Angular Queuer ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`Queuer`\<`TValue`\>, `QueuerMethod`\>

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

Defined in: [packages/angular-pacer/src/queuer/injectQueuer.ts:65](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L65)

The readonly selector result. Returns an empty object when no selector is supplied.
