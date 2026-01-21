---
id: AsyncQueuedSignal
title: AsyncQueuedSignal
---

# Type Alias: AsyncQueuedSignal\<TValue, TSelected\>

```ts
type AsyncQueuedSignal<TValue, TSelected> = () => TValue[] & object;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:9](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L9)

## Type Declaration

### addItem

```ts
readonly addItem: AngularAsyncQueuer<TValue, TSelected>["addItem"];
```

Add an item to the queue.

### queuer

```ts
readonly queuer: AngularAsyncQueuer<TValue, TSelected>;
```

The queuer instance with additional control methods and state signals.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
