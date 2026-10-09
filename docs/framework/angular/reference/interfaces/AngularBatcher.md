---
id: AngularBatcher
title: AngularBatcher
---

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:49](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L49)

An Angular Batcher ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`Batcher`\<`TValue`\>, `BatcherMethod`\>

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

Defined in: [packages/angular-pacer/src/batcher/injectBatcher.ts:54](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L54)

The readonly selector result. Returns an empty object when no selector is supplied.
