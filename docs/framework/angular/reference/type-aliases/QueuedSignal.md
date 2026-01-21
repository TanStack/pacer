---
id: QueuedSignal
title: QueuedSignal
---

# Type Alias: QueuedSignal\<TValue, TSelected\>

```ts
type QueuedSignal<TValue, TSelected> = () => TValue[] & object;
```

Defined in: [queuer/injectQueuedSignal.ts:6](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L6)

## Type Declaration

### addItem

```ts
readonly addItem: AngularQueuer<TValue, TSelected>["addItem"];
```

Add an item to the queue.

### queuer

```ts
readonly queuer: AngularQueuer<TValue, TSelected>;
```

The queuer instance with additional control methods and state signals.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
