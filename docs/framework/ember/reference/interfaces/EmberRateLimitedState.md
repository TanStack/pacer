---
id: EmberRateLimitedState
title: EmberRateLimitedState
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L18)

Reactive value, update method, and underlying utility returned by useRateLimitedState.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### setValue

```ts
setValue: SetValue<TValue>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:20](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L20)

***

### utility

```ts
utility: EmberRateLimiter<SetValue<TValue>, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:21](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L21)

***

### value

```ts
readonly value: TValue;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:19](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L19)
