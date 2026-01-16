---
id: createAsyncQueuer
title: createAsyncQueuer
---

# Function: createAsyncQueuer()

```ts
function createAsyncQueuer<TValue, TSelected>(
   fn, 
   options, 
selector): AngularAsyncQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/async-queuer/createAsyncQueuer.ts:69](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/createAsyncQueuer.ts#L69)

An Angular function that creates and manages an AsyncQueuer instance.

This is a lower-level function that provides direct access to the AsyncQueuer's functionality.
This allows you to integrate it with any state management solution you prefer.

The AsyncQueuer processes items asynchronously with support for concurrent execution,
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

(`value`) => `Promise`\<`any`\>

### options

`AsyncQueuerOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncQueuer`](../interfaces/AngularAsyncQueuer.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const queuer = createAsyncQueuer(
  async (item: Data) => {
    const response = await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return response.json();
  },
  { concurrency: 2, wait: 1000 }
);

// Add items
queuer.addItem(data1);
queuer.addItem(data2);

// Access the selected state
const { items, isExecuting } = queuer.state();
```
