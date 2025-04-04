---
id: useAsyncQueuer
title: useAsyncQueuer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useAsyncQueuer()

```ts
function useAsyncQueuer<TValue>(options): object
```

Defined in: [react-pacer/src/async-queuer/useAsyncQueuer.ts:54](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-queuer/useAsyncQueuer.ts#L54)

A lower-level React hook that creates an `AsyncQueuer` instance for managing an async queue of items.

This hook provides a flexible, state-management agnostic way to handle queued async operations.
It returns a queuer instance with methods to add items, control queue execution, and monitor queue state.

The queue can be configured with:
- Maximum concurrent operations
- Maximum queue size
- Processing function for queue items
- Various lifecycle callbacks

The hook returns an object containing methods to:
- Add/remove items from the queue
- Start/stop queue processing
- Get queue status and items
- Register event handlers
- Control execution throttling

## Type Parameters

• **TValue**

## Parameters

### options

`AsyncQueuerOptions`\<`TValue`\> = `{}`

## Returns

`object`

### addItem()

```ts
addItem: (fn, position?) => Promise<TValue>;
```

Adds a task to the queuer

#### Parameters

##### fn

() => `Promise`\<`TValue`\>

##### position?

`"front"` | `"back"`

#### Returns

`Promise`\<`TValue`\>

### clear()

```ts
clear: () => void;
```

Removes all items from the queuer

#### Returns

`void`

### getActiveItems()

```ts
getActiveItems: () => () => Promise<TValue>[];
```

Returns the active items

#### Returns

() => `Promise`\<`TValue`\>[]

### getAllItems()

```ts
getAllItems: () => () => Promise<TValue>[];
```

Returns a copy of all items in the queuer

#### Returns

() => `Promise`\<`TValue`\>[]

### getExecutionCount()

```ts
getExecutionCount: () => number;
```

Returns the number of items that have been removed from the queuer

#### Returns

`number`

### getNextItem()

```ts
getNextItem: (position?) => undefined | () => Promise<TValue>;
```

Removes and returns an item from the queuer

#### Parameters

##### position?

`"front"` | `"back"`

#### Returns

`undefined` \| () => `Promise`\<`TValue`\>

### getPendingItems()

```ts
getPendingItems: () => () => Promise<TValue>[];
```

Returns the pending items

#### Returns

() => `Promise`\<`TValue`\>[]

### isEmpty()

```ts
isEmpty: () => boolean;
```

Returns true if the queuer is empty

#### Returns

`boolean`

### isFull()

```ts
isFull: () => boolean;
```

Returns true if the queuer is full

#### Returns

`boolean`

### isIdle()

```ts
isIdle: () => boolean;
```

Returns true if the queuer is running but has no items to process

#### Returns

`boolean`

### isRunning()

```ts
isRunning: () => boolean;
```

Returns true if the queuer is running

#### Returns

`boolean`

### onError()

```ts
onError: (cb) => () => void;
```

Adds a callback to be called when a task errors

#### Parameters

##### cb

(`error`) => `void`

#### Returns

`Function`

##### Returns

`void`

### onSettled()

```ts
onSettled: (cb) => () => void;
```

Adds a callback to be called when a task is settled

#### Parameters

##### cb

(`result`) => `void`

#### Returns

`Function`

##### Returns

`void`

### onSuccess()

```ts
onSuccess: (cb) => () => void;
```

Adds a callback to be called when a task succeeds

#### Parameters

##### cb

(`result`) => `void`

#### Returns

`Function`

##### Returns

`void`

### peek()

```ts
peek: (position?) => undefined | () => Promise<TValue>;
```

Returns an item without removing it

#### Parameters

##### position?

`"front"` | `"back"`

#### Returns

`undefined` \| () => `Promise`\<`TValue`\>

### reset()

```ts
reset: (withInitialItems?) => void;
```

Resets the queuer to its initial state

#### Parameters

##### withInitialItems?

`boolean`

#### Returns

`void`

### size()

```ts
size: () => number;
```

Returns the current size of the queuer

#### Returns

`number`

### start()

```ts
start: () => Promise<void>;
```

Starts the queuer and processes items

#### Returns

`Promise`\<`void`\>

### stop()

```ts
stop: () => void;
```

Stops the queuer from processing items

#### Returns

`void`

### throttle()

```ts
throttle: (n) => void;
```

Throttles the number of concurrent items that can run at once

#### Parameters

##### n

`number`

#### Returns

`void`

## Example

```tsx
// Basic async queuer for API requests
const asyncQueuer = useAsyncQueuer({
  initialItems: [],
  concurrency: 2,
  maxSize: 100,
  started: false,
});

// Add items to queue
asyncQueuer.addItem(newItem);

// Start processing
asyncQueuer.start();

// Monitor queue state
const isPending = !asyncQueuer.isIdle();
const itemCount = asyncQueuer.size();

// Handle results
asyncQueuer.onSuccess((result) => {
  console.log('Item processed:', result);
});

asyncQueuer.onError((error) => {
  console.error('Processing failed:', error);
});
```
