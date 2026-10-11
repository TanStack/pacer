---
id: QueuedValueSignal
title: QueuedValueSignal
---

```ts
type QueuedValueSignal<TValue, TSelected> = Signal<TValue> & object;
```

Defined in: [queuer/injectQueuedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L9)

A processed value signal with methods for adding and controlling queued values.

## Type Declaration

### addItem

```ts
addItem: AngularQueuer<TValue, TSelected>["addItem"];
```

### queuer

```ts
queuer: AngularQueuer<TValue, TSelected>;
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
