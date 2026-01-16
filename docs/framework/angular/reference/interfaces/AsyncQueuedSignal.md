---
id: AsyncQueuedSignal
title: AsyncQueuedSignal
---

# Interface: AsyncQueuedSignal\<TValue, TSelected\>

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts:10](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L10)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Properties

### addItem()

```ts
readonly addItem: (item, position?, runOnItemsChange?) => boolean;
```

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts:21](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L21)

The queuer's addItem method

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

### items

```ts
readonly items: Signal<TValue[]>;
```

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts:17](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L17)

A Signal that provides the current queue items as an array

***

### queuer

```ts
readonly queuer: AngularAsyncQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts:25](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L25)

The queuer instance with additional control methods
