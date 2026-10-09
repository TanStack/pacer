---
id: AngularAsyncQueuerItems
title: AngularAsyncQueuerItems
---

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts:16](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts#L16)

A readonly signal of pending queue items, with the Angular queuer attached.

## Extends

- `Signal`\<`ReadonlyArray`\<`TValue`\>\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
AngularAsyncQueuerItems(): readonly TValue[];
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts:16](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts#L16)

A readonly signal of pending queue items, with the Angular queuer attached.

## Returns

readonly `TValue`[]

## Properties

### \[SIGNAL\]

```ts
[SIGNAL]: unknown;
```

Defined in: node\_modules/.pnpm/@angular+core@22.2.1\_@angular+compiler@22.2.1\_rxjs@7.8.2/node\_modules/@angular/core/types/\_chrome\_dev\_tools\_performance-chunk.d.ts:75

#### Inherited from

```ts
Signal.[SIGNAL]
```

***

### addItem

```ts
addItem: (item, position, runOnItemsChange) => boolean;
```

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts#L22)

Shortcut for queuer.addItem, with the same arguments and return value.

Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
Items can be inserted based on priority or at the front/back depending on configuration.
`undefined` cannot be queued (it is the internal "no item" sentinel) and is always rejected.

#### Parameters

##### item

`TValue`

##### position?

`QueuePosition` = `...`

##### runOnItemsChange?

`boolean` = `true`

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

Defined in: [packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuedItems.ts#L20)

The underlying utility ref for adding, processing, and inspecting items.
