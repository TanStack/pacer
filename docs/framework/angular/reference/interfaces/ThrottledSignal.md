---
id: ThrottledSignal
title: ThrottledSignal
---

# Interface: ThrottledSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/throttler/injectThrottledSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L11)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
ThrottledSignal(): TValue;
```

Defined in: [angular-pacer/src/throttler/injectThrottledSignal.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L12)

## Returns

`TValue`

## Properties

### set

```ts
set: Setter<TValue>;
```

Defined in: [angular-pacer/src/throttler/injectThrottledSignal.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L13)

***

### throttler

```ts
throttler: AngularThrottler<Setter<TValue>, TSelected>;
```

Defined in: [angular-pacer/src/throttler/injectThrottledSignal.ts:14](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L14)
