---
id: AngularAsyncBatcher
title: AngularAsyncBatcher
---

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:60](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L60)

An Angular AsyncBatcher ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`AsyncBatcher`\<`TValue`\>, `AsyncBatcherMethod`\>

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

Defined in: [packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts:67](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L67)

Reactive state that will be updated when the batcher state changes
