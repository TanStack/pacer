---
id: AngularQueuerSignal
title: AngularQueuerSignal
---

Defined in: [packages/angular-pacer/src/queuer/injectQueuedSignal.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L20)

An Angular writable signal whose `set` and `update` writes are queued in order.
Updaters receive the committed value when their queue item executes.
`asReadonly()` exposes a live readonly view. The `queuer` attribute controls
processing and exposes selected queue state.

## Extends

- `WritableSignal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularQueuerSignal(): TValue;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedSignal.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L20)

An Angular writable signal whose `set` and `update` writes are queued in order.
Updaters receive the committed value when their queue item executes.
`asReadonly()` exposes a live readonly view. The `queuer` attribute controls
processing and exposes selected queue state.

## Returns

`TValue`

## Properties

### \[ɵWRITABLE\_SIGNAL\]

```ts
[ɵWRITABLE_SIGNAL]: TValue;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:19

#### Inherited from

```ts
WritableSignal.[ɵWRITABLE_SIGNAL]
```

***

### \[SIGNAL\]

```ts
[SIGNAL]: unknown;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:75

#### Inherited from

```ts
WritableSignal.[SIGNAL]
```

***

### queuer

```ts
queuer: AngularQueuer<SignalWrite<TValue>, TSelected>;
```

Defined in: [packages/angular-pacer/src/queuer/injectQueuedSignal.ts:25](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L25)

The underlying Angular Queuer ref and its selected state.

## Methods

### asReadonly()

```ts
asReadonly(): Signal<TValue>;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:34

Returns a readonly version of this signal. Readonly signals can be accessed to read their value
but can't be changed using set or update methods. The readonly signals do _not_ have
any built-in mechanism that would prevent deep-mutation of their value.

#### Returns

`Signal`\<`TValue`\>

#### Inherited from

```ts
WritableSignal.asReadonly
```

***

### set()

```ts
set(value): void;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:23

Directly set the signal to a new value, and notify any dependents.

#### Parameters

##### value

`TValue`

#### Returns

`void`

#### Inherited from

```ts
WritableSignal.set
```

***

### update()

```ts
update(updateFn): void;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2\_zone.js@0.16.3/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:28

Update the value of the signal based on its current value, and
notify any dependents.

#### Parameters

##### updateFn

(`value`) => `TValue`

#### Returns

`void`

#### Inherited from

```ts
WritableSignal.update
```
