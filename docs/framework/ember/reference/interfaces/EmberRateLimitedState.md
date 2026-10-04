---
id: EmberRateLimitedState
title: EmberRateLimitedState
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:19](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L19)

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

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:21](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L21)

***

### utility

```ts
utility: EmberRateLimiter<SetValue<TValue>, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L22)

***

### value

```ts
readonly value: TValue;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:20](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L20)
