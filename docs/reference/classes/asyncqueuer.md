---
id: AsyncQueuer
title: AsyncQueuer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Class: AsyncQueuer\<TValue\>

Defined in: [async-queuer.ts:80](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L80)

A flexible asynchronous queuer that processes tasks with configurable concurrency control.

Features:
- Priority queuer support via getPriority option
- Configurable concurrency limit
- Task success/error/completion callbacks
- FIFO (First In First Out) or LIFO (Last In First Out) queuer behavior
- Pause/resume task processing
- Task cancellation

Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
the next pending task is processed if below the concurrency limit.

## Example

```ts
const queuer = new AsyncQueuer<string>({ concurrency: 2 });

queuer.addItem(async () => {
  return 'Hello';
});

queuer.start();

queuer.onSuccess((result) => {
  console.log(result); // 'Hello'
});
```

## Type Parameters

• **TValue**

## Constructors

### new AsyncQueuer()

```ts
new AsyncQueuer<TValue>(initialOptions): AsyncQueuer<TValue>
```

Defined in: [async-queuer.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L91)

#### Parameters

##### initialOptions

[`AsyncQueuerOptions`](../interfaces/asyncqueueroptions.md)\<`TValue`\> = `defaultOptions`

#### Returns

[`AsyncQueuer`](asyncqueuer.md)\<`TValue`\>

## Properties

### options

```ts
protected options: Required<AsyncQueuerOptions<TValue>>;
```

Defined in: [async-queuer.ts:81](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L81)

## Methods

### addItem()

```ts
addItem(fn, position): Promise<TValue>
```

Defined in: [async-queuer.ts:174](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L174)

Adds a task to the queuer

#### Parameters

##### fn

() => `Promise`\<`TValue`\>

##### position

`"front"` | `"back"`

#### Returns

`Promise`\<`TValue`\>

***

### clear()

```ts
clear(): void
```

Defined in: [async-queuer.ts:282](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L282)

Removes all items from the queuer

#### Returns

`void`

***

### getActiveItems()

```ts
getActiveItems(): () => Promise<TValue>[]
```

Defined in: [async-queuer.ts:316](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L316)

Returns the active items

#### Returns

() => `Promise`\<`TValue`\>[]

***

### getAllItems()

```ts
getAllItems(): () => Promise<TValue>[]
```

Defined in: [async-queuer.ts:302](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L302)

Returns a copy of all items in the queuer

#### Returns

() => `Promise`\<`TValue`\>[]

***

### getExecutionCount()

```ts
getExecutionCount(): number
```

Defined in: [async-queuer.ts:309](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L309)

Returns the number of items that have been removed from the queuer

#### Returns

`number`

***

### getNextItem()

```ts
getNextItem(position): undefined | () => Promise<TValue>
```

Defined in: [async-queuer.ts:227](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L227)

Removes and returns an item from the queuer

#### Parameters

##### position

`"front"` | `"back"`

#### Returns

`undefined` \| () => `Promise`\<`TValue`\>

***

### getPendingItems()

```ts
getPendingItems(): () => Promise<TValue>[]
```

Defined in: [async-queuer.ts:323](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L323)

Returns the pending items

#### Returns

() => `Promise`\<`TValue`\>[]

***

### isEmpty()

```ts
isEmpty(): boolean
```

Defined in: [async-queuer.ts:261](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L261)

Returns true if the queuer is empty

#### Returns

`boolean`

***

### isFull()

```ts
isFull(): boolean
```

Defined in: [async-queuer.ts:268](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L268)

Returns true if the queuer is full

#### Returns

`boolean`

***

### isIdle()

```ts
isIdle(): boolean
```

Defined in: [async-queuer.ts:399](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L399)

Returns true if the queuer is running but has no items to process

#### Returns

`boolean`

***

### isRunning()

```ts
isRunning(): boolean
```

Defined in: [async-queuer.ts:392](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L392)

Returns true if the queuer is running

#### Returns

`boolean`

***

### onError()

```ts
onError(cb): () => void
```

Defined in: [async-queuer.ts:340](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L340)

Adds a callback to be called when a task errors

#### Parameters

##### cb

(`error`) => `void`

#### Returns

`Function`

##### Returns

`void`

***

### onSettled()

```ts
onSettled(cb): () => void
```

Defined in: [async-queuer.ts:350](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L350)

Adds a callback to be called when a task is settled

#### Parameters

##### cb

(`result`) => `void`

#### Returns

`Function`

##### Returns

`void`

***

### onSuccess()

```ts
onSuccess(cb): () => void
```

Defined in: [async-queuer.ts:330](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L330)

Adds a callback to be called when a task succeeds

#### Parameters

##### cb

(`result`) => `void`

#### Returns

`Function`

##### Returns

`void`

***

### peek()

```ts
peek(position): undefined | () => Promise<TValue>
```

Defined in: [async-queuer.ts:249](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L249)

Returns an item without removing it

#### Parameters

##### position

`"front"` | `"back"`

#### Returns

`undefined` \| () => `Promise`\<`TValue`\>

***

### reset()

```ts
reset(withInitialItems?): void
```

Defined in: [async-queuer.ts:290](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L290)

Resets the queuer to its initial state

#### Parameters

##### withInitialItems?

`boolean`

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): AsyncQueuerOptions<TValue>
```

Defined in: [async-queuer.ts:111](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L111)

Updates the queuer options
Returns the new options state

#### Parameters

##### newOptions

`Partial`\<[`AsyncQueuerOptions`](../interfaces/asyncqueueroptions.md)\<`TValue`\>\>

#### Returns

[`AsyncQueuerOptions`](../interfaces/asyncqueueroptions.md)\<`TValue`\>

***

### size()

```ts
size(): number
```

Defined in: [async-queuer.ts:275](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L275)

Returns the current size of the queuer

#### Returns

`number`

***

### start()

```ts
start(): Promise<void>
```

Defined in: [async-queuer.ts:360](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L360)

Starts the queuer and processes items

#### Returns

`Promise`\<`void`\>

***

### stop()

```ts
stop(): void
```

Defined in: [async-queuer.ts:383](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L383)

Stops the queuer from processing items

#### Returns

`void`

***

### throttle()

```ts
throttle(n): void
```

Defined in: [async-queuer.ts:406](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L406)

Throttles the number of concurrent items that can run at once

#### Parameters

##### n

`number`

#### Returns

`void`

***

### tick()

```ts
protected tick(): void
```

Defined in: [async-queuer.ts:121](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L121)

Processes items in the queuer

#### Returns

`void`
