---
id: ThrottledSignal
title: ThrottledSignal
---

```ts
type ThrottledSignal<TValue, TSelected> = Signal<TValue> & object;
```

Defined in: [throttler/injectThrottledSignal.ts:13](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L13)

## Type Declaration

### set

```ts
set: Setter<TValue>;
```

### throttler

```ts
throttler: AngularThrottler<Setter<TValue>, TSelected>;
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
