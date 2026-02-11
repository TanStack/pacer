---
id: injectBatcher
title: injectBatcher
---

# Function: injectBatcher()

```ts
function injectBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): AngularBatcher<TValue, TSelected>;
```

Defined in: [angular-pacer/src/batcher/injectBatcher.ts:61](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L61)

An Angular function that creates and manages a Batcher instance.

This is a lower-level function that provides direct access to the Batcher's functionality.
This allows you to integrate it with any state management solution you prefer.

The Batcher collects items and processes them in batches based on configurable conditions:
- Maximum batch size
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

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

(`items`) => `void`

### options

`BatcherOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AngularBatcher`](../interfaces/AngularBatcher.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const batcher = injectBatcher(
  (items) => console.log('Processing batch:', items),
  { maxSize: 5, wait: 2000 }
);

// Add items
batcher.addItem('task1');

// Access the selected state
const { items, isPending } = batcher.state();
```
