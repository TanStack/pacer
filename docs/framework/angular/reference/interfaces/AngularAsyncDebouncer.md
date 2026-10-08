---
id: AngularAsyncDebouncer
title: AngularAsyncDebouncer
---

Defined in: packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:55

An Angular AsyncDebouncer ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`AsyncDebouncer`\<`TFn`\>, `AsyncDebouncerMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:60

The readonly selector result. Returns an empty object when no selector is supplied.
