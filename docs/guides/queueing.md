---
title: Queueing Guide
id: queueing
---

Unlike [Rate Limiting](../guides/rate-limiting), [Throttling](../guides/throttling), and [Debouncing](../guides/debouncing) which drop executions when they occur too frequently, queuers ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable.

## Queueing Concept

```text
Queueing (processing one item every 2 ticks)
Timeline: [1 second per tick]
Calls:     ↓↓↓  ↓↓    ↓↓↓↓      ↓
Queue:    [ABC][BC]  [BCDEF]   [F]    []
Executed:   A   B      C        D     E     F
           [===|===|===|===|===|===|===|===]
           ^ Unlike rate limiting/throttling/debouncing,
             ALL calls are eventually processed in order

           [Items queue up] [Process steadily] [Empty]
            when busy        one by one         queue
```

When operations come in faster than they can be processed, a queue acts as a buffer, storing the operations in an ordered list until they can be handled. This is particularly useful in scenarios like:
- Processing user interactions in a UI where every action must be recorded
- Handling database operations that need to maintain data consistency
- Managing API requests that must all complete successfully
- Coordinating background tasks that can't be dropped

## Queuer

The `Queuer` class provides a flexible implementation that can operate in multiple modes with built-in timing controls. It automatically processes items with configurable delays between operations, making it perfect for scenarios where you need to control the rate of processing without dropping any operations.

### Controlled Timing

The Queuer introduces timing control through its `wait` option, allowing you to throttle how quickly items are processed. This feature is particularly useful for:
- Rate limiting operations without dropping them
- Creating smooth animations or transitions
- Implementing progressive loading of data
- Controlling resource usage by spacing out operations

```ts
import { Queuer } from '@tanstack/pacer'

const queuer = new Queuer<number>({
  wait: 1000, // Wait 1 second between processing items
})

// Add callback for when items are processed
queuer.onUpdate(num => console.log(`Processing: ${num}`))

// Start processing
queuer.start()

// Add items to be processed
queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)

// Items will be processed one at a time with 1 second delay between each
// Output:
// Processing: 1 (immediately)
// Processing: 2 (after 1 second)
// Processing: 3 (after 2 seconds)
```

### Queue Ordering Options

What makes TanStack Pacer's Queuer unique is its ability to adapt to different use cases through its position-based API. The same Queuer can behave as a traditional queue, a stack, or a double-ended queue, all through the same consistent interface.

#### FIFO Queue (First In, First Out)
The default behavior where items are processed in the order they were added. This is the most common queue type and follows the principle that the first item added should be the first one processed.

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
const queue = new Queuer<number>()
queue.addItem(1) // [1]
queue.addItem(2) // [1, 2]
// Items will process in order: 1, then 2
```

#### LIFO Stack (Last In, First Out)
By specifying 'back' as the position for both adding and retrieving items, the queuer behaves like a stack. In a stack, the most recently added item is the first one to be processed.

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
const stack = new Queuer<number>()
stack.addItem(1) // [1]
stack.addItem(2) // [1, 2]
// Items will process in order: 2, then 1
```

#### Priority Queue
Priority queues add another dimension to queue ordering by allowing items to be sorted based on their priority rather than just their insertion order. Each item is assigned a priority value, and the queue automatically maintains the items in priority order.

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

```ts
const priorityQueue = new Queuer<number>({
  getPriority: (n) => n // Higher numbers have priority
})
priorityQueue.addItem(1) // [1]
priorityQueue.addItem(3) // [3, 1]
priorityQueue.addItem(2) // [3, 2, 1]
// Items will process in order: 3, 2, then 1
```

For handling concurrent asynchronous operations with multiple workers, see [Async Queueing](./async-queueing) which covers the `AsyncQueuer` class. 