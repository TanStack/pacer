---
id: AngularRateLimiterValue
title: AngularRateLimiterValue
---

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L21)

A readonly Angular value signal with its underlying utility ref.
The `rateLimiter` attribute exposes the underlying RateLimiter methods.

## Extends

- `Signal`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularRateLimiterValue(): TValue;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L21)

A readonly Angular value signal with its underlying utility ref.
The `rateLimiter` attribute exposes the underlying RateLimiter methods.

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

### rateLimiter

```ts
rateLimiter: AngularRateLimiter<(value) => void, TSelected>;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedValue.ts#L26)

The underlying Angular RateLimiter ref for controlling execution.
