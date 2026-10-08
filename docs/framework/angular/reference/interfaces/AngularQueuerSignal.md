---
id: AngularQueuerSignal
title: AngularQueuerSignal
---

Defined in: packages/angular-pacer/src/queuer/injectQueuedSignal.ts:10

A processed-value signal with its underlying queue controls.

## Extends

- `Signal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularQueuerSignal(): TValue;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedSignal.ts:10

A processed-value signal with its underlying queue controls.

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

### queuer

```ts
queuer: AngularQueuer<() => void, TSelected>;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedSignal.ts:19

The underlying Angular Queuer ref and its selected state.

***

### set

```ts
set: (value) => void;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedSignal.ts:15

Enqueues a replacement value.

#### Parameters

##### value

`TValue`

#### Returns

`void`

***

### update

```ts
update: (updater) => void;
```

Defined in: packages/angular-pacer/src/queuer/injectQueuedSignal.ts:17

Enqueues an updater evaluated against the committed value when processed.

#### Parameters

##### updater

(`previous`) => `TValue`

#### Returns

`void`
