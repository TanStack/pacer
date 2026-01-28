---
id: ThrottledSignal
title: ThrottledSignal
---

# Type Alias: ThrottledSignal\<TValue, TSelected\>

```ts
type ThrottledSignal<TValue, TSelected> = (...args) => TValue & object;
```

Defined in: [throttler/injectThrottledSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledSignal.ts#L11)

## Type Declaration

### set

```ts
readonly set: Setter<TValue>;
```

Set or update the throttled value. This calls `throttler.maybeExecute(...)`.

### throttler

```ts
readonly throttler: AngularThrottler<Setter<TValue>, TSelected>;
```

The throttler instance with additional control methods and state signals.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
