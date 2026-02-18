---
id: AsyncQueuedSignal
title: AsyncQueuedSignal
---

# Interface: AsyncQueuedSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L9)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AsyncQueuedSignal(): TValue[];
```

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts:10](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L10)

## Returns

`TValue`[]

## Properties

### addItem()

```ts
addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts:11](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L11)

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.

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
queuer.addItem({ value: 'task', priority: 10 });
queuer.addItem('task2', 'front');
```

***

### queuer

```ts
queuer: AngularAsyncQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedSignal.ts#L12)
