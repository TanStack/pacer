---
id: EmberThrottledValue
title: EmberThrottledValue
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:14](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L14)

Reactive value, update method, and underlying utility returned by useThrottledValue.

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

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:16](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L16)

#### Parameters

##### value

`TValue`

#### Returns

`void`

***

### utility

```ts
utility: EmberThrottler<(value) => void, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L17)

***

### value

```ts
readonly value: TValue;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:15](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L15)
