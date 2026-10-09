---
id: AngularDebouncer
title: AngularDebouncer
---

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncer.ts:53](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L53)

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

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncer.ts:58](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L58)

The readonly selector result. Returns an empty object when no selector is supplied.
