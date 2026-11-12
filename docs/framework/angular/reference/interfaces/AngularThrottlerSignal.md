---
id: AngularThrottlerSignal
title: AngularThrottlerSignal
---

Defined in: [packages/angular-pacer/src/throttler/injectThrottledSignal.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L24)

An Angular writable signal whose `set` and `update` writes are throttled.
Leading writes may execute immediately; later writes replace the pending
trailing write without extending its deadline. Updaters receive the committed
value when executed. `asReadonly()` exposes a live readonly view.
The `throttler` attribute controls execution.

## Extends

- `WritableSignal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularThrottlerSignal(): TValue;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledSignal.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L24)

An Angular writable signal whose `set` and `update` writes are throttled.
Leading writes may execute immediately; later writes replace the pending
trailing write without extending its deadline. Updaters receive the committed
value when executed. `asReadonly()` exposes a live readonly view.
The `throttler` attribute controls execution.

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

### throttler

```ts
throttler: AngularThrottler<(value) => void, TSelected>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledSignal.ts:29](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L29)

The underlying Angular Throttler ref for controlling execution.

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
