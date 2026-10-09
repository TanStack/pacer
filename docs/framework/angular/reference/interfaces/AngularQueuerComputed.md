---
id: AngularQueuerComputed
title: AngularQueuerComputed
---

Defined in: [packages/angular-pacer/src/queuer/injectQueuedComputed.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedComputed.ts#L9)

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
AngularQueuerComputed(): TValue;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedComputed.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedComputed.ts#L9)

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
queuer: AngularQueuer<TValue, TSelected>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedComputed.ts:14](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedComputed.ts#L14)

The underlying Angular Queuer ref and its selected state.
