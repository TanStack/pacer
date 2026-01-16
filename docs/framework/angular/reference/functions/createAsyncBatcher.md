---
id: createAsyncBatcher
title: createAsyncBatcher
---

# Function: createAsyncBatcher()

```ts
function createAsyncBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): AngularAsyncBatcher<TValue, TSelected>;
```

Defined in: [angular-pacer/src/async-batcher/createAsyncBatcher.ts:69](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-batcher/createAsyncBatcher.ts#L69)

An Angular function that creates and manages an AsyncBatcher instance.

This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The AsyncBatcher collects items and processes them in batches asynchronously with support for
promise-based processing, error handling, retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

`AsyncBatcherOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const batcher = createAsyncBatcher(
  async (items: Array<Data>) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
    return response.json();
  },
  { maxSize: 10, wait: 2000 }
);

// Add items
batcher.addItem(data1);
batcher.addItem(data2);

// Access the selected state
const { items, isExecuting } = batcher.state();
```
