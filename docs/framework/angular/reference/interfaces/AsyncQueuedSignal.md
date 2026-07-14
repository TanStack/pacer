---
id: AsyncQueuedSignal
title: AsyncQueuedSignal
---

# Interface: AsyncQueuedSignal()\<TValue, TSelected\>

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:10](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L10)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AsyncQueuedSignal(): TValue[];
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L11)

## Returns

`TValue`[]

## Properties

### addItem()

```ts
addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L21)

Adds an item to the queue.

#### Parameters

##### item

`TValue`

##### position?

`QueuePosition`

##### runOnItemsChange?

`boolean`

#### Returns

`boolean`

#### Example

```ts
queued.addItem('task')
queued.addItem('task2', 'front')
```

***

### queuer

```ts
queuer: AngularAsyncQueuer<TValue, TSelected>;
```

Defined in: [async-queuer/injectAsyncQueuedSignal.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L26)
