---
id: Queue
title: Queue
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Class: Queue\<TValue\>

Defined in: [queue.ts:36](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L36)

A flexible queue data structure that defaults to FIFO (First In First Out) behavior
with optional position overrides for stack-like or double-ended operations.

Default queue behavior:
- addItem(item): adds to back
- getNextItem(): removes from front

Stack behavior (using position override):
- addItem(item, 'back'): LIFO (Last In First Out)
- getNextItem('back'): LIFO (Last In First Out)

Double-ended behavior:
- addItem(item, 'front' | 'back')
- getNextItem('front' | 'back')

## Extended by

- [`Queuer`](queuer.md)

## Type Parameters

• **TValue**

## Constructors

### new Queue()

```ts
new Queue<TValue>(options): Queue<TValue>
```

Defined in: [queue.ts:41](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L41)

#### Parameters

##### options

[`QueueOptions`](../interfaces/queueoptions.md)\<`TValue`\> = `defaultOptions`

#### Returns

[`Queue`](queue.md)\<`TValue`\>

## Properties

### options

```ts
protected options: Required<QueueOptions<TValue>> = defaultOptions;
```

Defined in: [queue.ts:37](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L37)

## Methods

### addItem()

```ts
addItem(item, position): boolean
```

Defined in: [queue.ts:70](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L70)

Adds an item to the queue

#### Parameters

##### item

`TValue`

The item to add

##### position

[`QueuePosition`](../type-aliases/queueposition.md) = `'back'`

Where to add the item (defaults to back for standard FIFO behavior). Don't use this argument unless you want to use a stack or double-ended queue.

#### Returns

`boolean`

false if queue is full, true if item was added

Examples:
```ts
// Standard FIFO queue
queue.addItem(item)
// Add to front (like unshift)
queue.addItem(item, 'front')
```

***

### clear()

```ts
clear(): void
```

Defined in: [queue.ts:172](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L172)

Removes all items from the queue

#### Returns

`void`

***

### getAllItems()

```ts
getAllItems(): TValue[]
```

Defined in: [queue.ts:191](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L191)

Returns a copy of all items in the queue

#### Returns

`TValue`[]

***

### getExecutionCount()

```ts
getExecutionCount(): number
```

Defined in: [queue.ts:198](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L198)

Returns the number of items that have been removed from the queue

#### Returns

`number`

***

### getNextItem()

```ts
getNextItem(position): undefined | TValue
```

Defined in: [queue.ts:113](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L113)

Removes and returns an item from the queue using shift (default) or pop

#### Parameters

##### position

[`QueuePosition`](../type-aliases/queueposition.md) = `'front'`

Where to remove the item from (defaults to front for standard FIFO behavior)

#### Returns

`undefined` \| `TValue`

the removed item or undefined if empty

Examples:
```ts
// Standard FIFO queue
queue.getNextItem()
// Stack-like behavior (LIFO)
queue.getNextItem('back')
```

***

### isEmpty()

```ts
isEmpty(): boolean
```

Defined in: [queue.ts:151](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L151)

Returns true if the queue is empty

#### Returns

`boolean`

***

### isFull()

```ts
isFull(): boolean
```

Defined in: [queue.ts:158](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L158)

Returns true if the queue is full

#### Returns

`boolean`

***

### peek()

```ts
peek(position): undefined | TValue
```

Defined in: [queue.ts:141](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L141)

Returns an item without removing it

#### Parameters

##### position

[`QueuePosition`](../type-aliases/queueposition.md) = `'front'`

Which item to peek at (defaults to front for standard FIFO behavior)

Examples:
```ts
// Look at next item to getNextItem
queue.peek()
// Look at last item (like stack top)
queue.peek('back')
```

#### Returns

`undefined` \| `TValue`

***

### reset()

```ts
reset(withInitialItems?): void
```

Defined in: [queue.ts:180](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L180)

Resets the queue to its initial state

#### Parameters

##### withInitialItems?

`boolean`

#### Returns

`void`

***

### size()

```ts
size(): number
```

Defined in: [queue.ts:165](https://github.com/TanStack/bouncer/blob/main/packages/pacer/src/queue.ts#L165)

Returns the current size of the queue

#### Returns

`number`
