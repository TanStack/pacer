---
id: AngularDebouncerSignal
title: AngularDebouncerSignal
---

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:16](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L16)

A readonly Angular value signal with paced `set`/`update` methods.
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
AngularDebouncerSignal(): TValue;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:16](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L16)

A readonly Angular value signal with paced `set`/`update` methods.
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
debouncer: AngularDebouncer<(callback) => void, TSelected>;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:25](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L25)

The underlying Angular Debouncer ref for controlling execution.

***

### set

```ts
set: (value) => void;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L21)

Schedules the replacement value after the debounce delay.

#### Parameters

##### value

`TValue`

#### Returns

`void`

***

### update

```ts
update: (updateFn) => void;
```

Defined in: [packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts:23](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedSignal.ts#L23)

Runs the updater with the current committed value when the write executes.

#### Parameters

##### updateFn

(`previous`) => `TValue`

#### Returns

`void`
