---
id: QueuedSignal
title: QueuedSignal
---

# Interface: QueuedSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/queuer/injectQueuedSignal.ts:6](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L6)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
QueuedSignal(): TValue[];
```

Defined in: [angular-pacer/src/queuer/injectQueuedSignal.ts:7](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L7)

## Returns

`TValue`[]

## Properties

### addItem()

```ts
addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [angular-pacer/src/queuer/injectQueuedSignal.ts:8](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L8)

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.

Returns true if the item was added, false if the queue is full.

Example usage:
```ts
queuer.addItem('task');
queuer.addItem('task2', 'front');
```

#### Parameters

##### item

`TValue`

##### position?

`QueuePosition`

##### runOnItemsChange?

`boolean`

#### Returns

`boolean`

***

### queuer

```ts
queuer: AngularQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/queuer/injectQueuedSignal.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L9)
