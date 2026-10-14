---
id: AngularDebouncerValue
title: AngularDebouncerValue
---

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedValue.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L21)

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
AngularDebouncerValue(): TValue;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedValue.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L21)

A readonly Angular value signal with its underlying utility ref.
The `debouncer` attribute exposes the underlying Debouncer methods.

## Returns

`TValue`

## Properties

### \[SIGNAL\]

```ts
[SIGNAL]: unknown;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:75

#### Inherited from

```ts
Signal.[SIGNAL]
```

***

### debouncer

```ts
debouncer: AngularDebouncer<(value) => void, TSelected>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedValue.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L26)

The underlying Angular Debouncer ref for controlling execution.
