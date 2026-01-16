---
id: createQueuer
title: createQueuer
---

# Function: createQueuer()

```ts
function createQueuer<TValue, TSelected>(
   fn, 
   options, 
selector): AngularQueuer<TValue, TSelected>;
```

Defined in: [angular-pacer/src/queuer/createQueuer.ts:66](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/createQueuer.ts#L66)

An Angular function that creates and manages a Queuer instance.

This is a lower-level function that provides direct access to the Queuer's functionality.
This allows you to integrate it with any state management solution you prefer.

The Queuer processes items synchronously in order, with optional delays between processing each item.
The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.

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

(`item`) => `void`

### options

`QueuerOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`AngularQueuer`](../interfaces/AngularQueuer.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const queue = createQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 }
);

// Opt-in to track queue contents changes
const queue = createQueuer(
  (item) => console.log('Processing:', item),
  { started: true, wait: 1000 },
  (state) => ({ items: state.items, size: state.size })
);

// Add items
queue.addItem('task1');

// Access the selected state
const { items, isRunning } = queue.state();
```
