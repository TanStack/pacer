---
id: injectAsyncBatcher
title: injectAsyncBatcher
---

# Function: injectAsyncBatcher()

```ts
function injectAsyncBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): AngularAsyncBatcher<TValue, TSelected>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:96](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L96)

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

## Cleanup on Destroy

By default, the function cancels any pending batch and aborts in-flight work when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const batcher = injectAsyncBatcher(fn, {
  maxSize: 10,
  onUnmount: (b) => b.flush()
});
```

When using onUnmount with flush, guard your callbacks since the component may already be destroyed.

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

[`AngularAsyncBatcherOptions`](../interfaces/AngularAsyncBatcherOptions.md)\<`TValue`, `TSelected`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncBatcher`](../interfaces/AngularAsyncBatcher.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const batcher = injectAsyncBatcher(
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
