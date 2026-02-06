---
id: DebouncedSignal
title: DebouncedSignal
---

# Type Alias: DebouncedSignal\<TValue, TSelected\>

```ts
type DebouncedSignal<TValue, TSelected> = (...args) => TValue & object;
```

Defined in: [debouncer/injectDebouncedSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L11)

## Type Declaration

### debouncer

```ts
readonly debouncer: AngularDebouncer<Setter<TValue>, TSelected>;
```

The debouncer instance with additional control methods and state signals.

### set

```ts
readonly set: Setter<TValue>;
```

Set or update the debounced value. This calls `debouncer.maybeExecute(...)`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
