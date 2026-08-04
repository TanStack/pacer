---
id: QueuedSignal
title: QueuedSignal
---

# Interface: QueuedSignal()\<TValue, TSelected\>

Defined in: [queuer/injectQueuedSignal.ts:6](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L6)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
QueuedSignal(): TValue[];
```

Defined in: [queuer/injectQueuedSignal.ts:7](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L7)

## Returns

`TValue`[]

## Properties

### addItem()

```ts
addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [queuer/injectQueuedSignal.ts:17](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L17)

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
queuer: AngularQueuer<TValue, TSelected>;
```

Defined in: [queuer/injectQueuedSignal.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedSignal.ts#L22)
