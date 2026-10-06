---
id: DebouncedSignal
title: DebouncedSignal
---

```ts
type DebouncedSignal<TValue, TSelected> = Signal<TValue> & object;
```

Defined in: [debouncer/injectDebouncedSignal.ts:13](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L13)

## Type Declaration

### debouncer

```ts
debouncer: AngularDebouncer<Setter<TValue>, TSelected>;
```

### set

```ts
set: Setter<TValue>;
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
