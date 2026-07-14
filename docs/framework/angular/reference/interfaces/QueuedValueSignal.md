---
id: QueuedValueSignal
title: QueuedValueSignal
---

# Interface: QueuedValueSignal()\<TValue, TSelected\>

Defined in: [queuer/injectQueuedValue.ts:7](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L7)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
QueuedValueSignal(): TValue;
```

Defined in: [queuer/injectQueuedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L8)

## Returns

`TValue`

## Properties

### addItem()

```ts
addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [queuer/injectQueuedValue.ts:18](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L18)

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

Defined in: [queuer/injectQueuedValue.ts:23](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuedValue.ts#L23)
