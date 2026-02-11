---
id: DebouncedSignal
title: DebouncedSignal
---

# Interface: DebouncedSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/debouncer/injectDebouncedSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L11)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
DebouncedSignal(): TValue;
```

Defined in: [angular-pacer/src/debouncer/injectDebouncedSignal.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L12)

## Returns

`TValue`

## Properties

### debouncer

```ts
debouncer: AngularDebouncer<Setter<TValue>, TSelected>;
```

Defined in: [angular-pacer/src/debouncer/injectDebouncedSignal.ts:14](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L14)

***

### set

```ts
set: Setter<TValue>;
```

Defined in: [angular-pacer/src/debouncer/injectDebouncedSignal.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L13)
