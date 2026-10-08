---
id: AngularDebouncerComputed
title: AngularDebouncerComputed
---

Defined in: packages/angular-pacer/src/debouncer/injectDebouncedComputed.ts:15

A readonly Angular value signal with its underlying utility ref.
The `debouncer` attribute exposes the underlying Debouncer methods.

## Extends

- `Signal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularDebouncerComputed(): TValue;
```

Defined in: packages/angular-pacer/src/debouncer/injectDebouncedComputed.ts:15

A readonly Angular value signal with its underlying utility ref.
The `debouncer` attribute exposes the underlying Debouncer methods.

## Returns

`TValue`

## Properties

### \[SIGNAL\]

```ts
[SIGNAL]: unknown;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:75

#### Inherited from

```ts
Signal.[SIGNAL]
```

***

### debouncer

```ts
debouncer: AngularDebouncer<(value) => void, TSelected>;
```

Defined in: packages/angular-pacer/src/debouncer/injectDebouncedComputed.ts:20

The underlying Angular Debouncer ref for controlling execution.
