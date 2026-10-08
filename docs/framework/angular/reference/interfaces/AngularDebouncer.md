---
id: AngularDebouncer
title: AngularDebouncer
---

Defined in: packages/angular-pacer/src/debouncer/injectDebouncer.ts:46

An Angular Debouncer ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`Debouncer`\<`TFn`\>, `DebouncerMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction` = `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: packages/angular-pacer/src/debouncer/injectDebouncer.ts:51

The readonly selector result. Returns an empty object when no selector is supplied.
