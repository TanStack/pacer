---
id: QueuePosition
title: QueuePosition
---

# Type Alias: QueuePosition

```ts
type QueuePosition = "front" | "back";
```

Defined in: [queuer.ts:200](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/queuer.ts#L200)

Position type for addItem and getNextItem operations.

- 'front': Operate on the front of the queue (FIFO)
- 'back': Operate on the back of the queue (LIFO)
