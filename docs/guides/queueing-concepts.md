---
title: Queueing Concepts
id: queueing-concepts
---

Unlike [Rate Limiting](./rate-limiting-concepts.md), which drops executions when they occur too frequently, queues ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable.

When operations come in faster than they can be processed, a queue acts as a buffer, storing the operations in an ordered list until they can be handled. This is particularly useful in scenarios like:
- Processing user interactions in a UI where every action must be recorded
- Handling database operations that need to maintain data consistency
- Managing API requests that must all complete successfully
- Coordinating background tasks that can't be dropped

## Queue Data Structure

At its core, a queue is a data structure that stores items in a specific order. TanStack Pacer's `Queue` class provides a flexible implementation that can operate in multiple modes. The base Queue is a pure data structure - it doesn't automatically process items, but rather provides the foundation for building more complex queueing systems.

What makes TanStack Pacer's Queue unique is its ability to adapt to different use cases through its position-based API. The same Queue class can behave as a traditional queue, a stack, or a double-ended queue, all through the same consistent interface. This flexibility eliminates the need for separate implementations while maintaining the performance characteristics you'd expect from each type.

### FIFO Queue (First In, First Out)
The default behavior where items are processed in the order they were added. This is the most common queue type and follows the principle that the first item added should be the first one processed. Think of it like a line at a grocery store - the first person to get in line is the first person to check out.

```
FIFO Queue Visualization:

Entry →  [A][B][C][D] → Exit
         ↑           ↑
      New items    Items are
      added here   removed here
```

FIFO queues are ideal for:
- Task processing where order matters
- Message queues where messages need to be processed in sequence
- Print queues where documents should be printed in the order they were sent
- Event handling systems where events must be processed in chronological order

```ts
import { Queue } from '@tanstack/pacer'

const queue = new Queue<number>()
queue.addItem(1) // [1]
queue.addItem(2) // [1, 2]
queue.getNextItem() // returns 1, queue is [2]
```

### LIFO Stack (Last In, First Out)
By specifying 'back' as the position for both adding and retrieving items, the queue behaves like a stack. In a stack, the most recently added item is the first one to be processed. This is similar to a stack of plates - you typically take the plate from the top (the last one added) rather than trying to pull one from the bottom.

```
LIFO Stack Visualization:

     ↑ Exit
    [D]  ← Most recently added
    [C]
    [B]
    [A]  ← First added
     ↓ Entry
```

Stack behavior is particularly useful for:
- Undo/redo systems where the most recent action should be undone first
- Browser history navigation where you want to go back to the most recent page
- Function call stacks in programming language implementations
- Depth-first traversal algorithms

```ts
const stack = new Queue<number>()
stack.addItem(1) // [1]
stack.addItem(2) // [1, 2]
stack.getNextItem('back') // returns 2, queue is [1]
```

### Double-Ended Queue (Deque)
A deque (pronounced "deck") is a queue that allows items to be added and removed from either end. This flexibility makes it one of the most versatile data structures, as it can efficiently implement both stack and queue behaviors.

```
Deque Visualization:

  Add/Remove   Add/Remove
      ↓            ↓
Exit ← [A][B][C][D] → Exit
      ↑            ↑
  Add/Remove   Add/Remove
```

The ability to add or remove items from either end makes deques particularly powerful for:
- Sliding window algorithms where you need to add to one end and remove from the other
- Work-stealing algorithms where tasks can be taken from either end
- Browser tab history where you can navigate both forward and backward
- Real-time data processing where priorities can change dynamically

```ts
const deque = new Queue<number>()
deque.addItem(1, 'front') // [1]
deque.addItem(2, 'back')  // [1, 2]
deque.addItem(3, 'front') // [3, 1, 2]
deque.getNextItem('back') // returns 2, queue is [3, 1]
```

### Priority Queue
Priority queues add another dimension to queue ordering by allowing items to be sorted based on their priority rather than just their insertion order. Each item is assigned a priority value, and the queue automatically maintains the items in priority order. Higher priority items are processed first, regardless of when they were added.

```
Priority Queue Visualization:

Entry →  [P:5][P:3][P:2][P:1] → Exit
          High         Low
         Priority    Priority
         
Items are automatically sorted by priority
P:5 = Priority level 5 (highest)
P:1 = Priority level 1 (lowest)
```

Priority queues are essential for:
- Task schedulers where some tasks are more urgent than others
- Network packet routing where certain types of traffic need preferential treatment
- Event systems where high-priority events should be handled before lower-priority ones
- Resource allocation where some requests are more important than others

The `getPriority` function gives you complete control over how priorities are calculated. It can be as simple as a numeric value or as complex as a function that considers multiple factors:

```ts
const priorityQueue = new Queue<number>({
  getPriority: (n) => n // Higher numbers have priority
})
priorityQueue.addItem(1) // [1]
priorityQueue.addItem(3) // [3, 1]
priorityQueue.addItem(2) // [3, 2, 1]
```

For automatic processing of queued items, see [Scheduling Concepts](./scheduling-concepts.md) which covers the `Queuer` and `AsyncQueuer` classes.
