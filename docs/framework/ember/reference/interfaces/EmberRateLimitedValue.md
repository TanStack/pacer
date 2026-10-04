---
id: EmberRateLimitedValue
title: EmberRateLimitedValue
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts#L17)

Reactive value, update method, and underlying utility returned by useRateLimitedValue.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### setValue

```ts
setValue: (value) => void;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts:19](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts#L19)

#### Parameters

##### value

`TValue`

#### Returns

`void`

***

### utility

```ts
utility: EmberRateLimiter<(value) => void, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts:20](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts#L20)

***

### value

```ts
readonly value: TValue;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedValue.ts#L18)
