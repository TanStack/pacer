---
id: QueuedValueSignal
title: QueuedValueSignal
---

# Interface: QueuedValueSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:7](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L7)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
QueuedValueSignal(): TValue;
```

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L8)

## Returns

`TValue`

## Properties

### addItem()

```ts
addItem: (item, position, runOnItemsChange) => boolean;
```

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L9)

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

##### position

`QueuePosition` = `...`

##### runOnItemsChange

`boolean` = `true`

#### Returns

`boolean`

***

### queuer

```ts
queuer: AngularQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/queuer/injectQueuedValue.ts:10](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L10)
