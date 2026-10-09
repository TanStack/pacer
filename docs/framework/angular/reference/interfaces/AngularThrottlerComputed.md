---
id: AngularThrottlerComputed
title: AngularThrottlerComputed
---

Defined in: [packages/angular-pacer/src/throttler/injectThrottledComputed.ts:15](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledComputed.ts#L15)

A readonly Angular value signal with its underlying utility ref.
The `throttler` attribute exposes the underlying Throttler methods.

## Extends

- `Signal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularThrottlerComputed(): TValue;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledComputed.ts:15](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledComputed.ts#L15)

A readonly Angular value signal with its underlying utility ref.
The `throttler` attribute exposes the underlying Throttler methods.

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

### throttler

```ts
throttler: AngularThrottler<(value) => void, TSelected>;
```

Defined in: [packages/angular-pacer/src/throttler/injectThrottledComputed.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledComputed.ts#L20)

The underlying Angular Throttler ref for controlling execution.
