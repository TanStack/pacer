import { Queuer } from '@tanstack/pacer/queuer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '../utils'
import type { Accessor } from 'solid-js'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

export interface SolidQueuer<TValue>
  extends Omit<
    Queuer<TValue>,
    | 'getExecutionCount'
    | 'getIsEmpty'
    | 'getIsFull'
    | 'getIsIdle'
    | 'getIsRunning'
    | 'getAllItems'
    | 'getPeek'
    | 'getSize'
  > {
  /**
   * Signal version of `getExecutionCount`
   */
  executionCount: Accessor<number>
  /**
   * Signal version of `getIsEmpty`
   */
  isEmpty: Accessor<boolean>
  /**
   * Signal version of `getIsFull`
   */
  isFull: Accessor<boolean>
  /**
   * Signal version of `getIsIdle`
   */
  isIdle: Accessor<boolean>
  /**
   * Signal version of `getIsRunning`
   */
  isRunning: Accessor<boolean>
  /**
   * Signal version of `getAllItems`
   */
  items: Accessor<Array<TValue>>
  /**
   * Signal version of `getPeek`
   */
  peek: Accessor<TValue | undefined>
  /**
   * Signal version of `getSize`
   */
  size: Accessor<number>
}

/**
 * A Solid hook that creates and manages a Queuer instance.
 *
 * This is a lower-level hook that provides direct access to the Queuer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (createSignal, Redux, Zustand, etc.) by utilizing the onUpdate callback.
 *
 * For a hook with built-in state management, see createQueuerSignal.
 *
 * The Queuer extends the base Queue to add processing capabilities. Items are processed
 * synchronously in order, with optional delays between processing each item. The queuer includes
 * an internal tick mechanism that can be started and stopped, making it useful as a scheduler.
 * When started, it will process one item per tick, with an optional wait time between ticks.
 *
 * By default uses FIFO (First In First Out) behavior, but can be configured for LIFO
 * (Last In First Out) by specifying 'front' position when adding items.
 *
 * @example
 * ```tsx
 * // Example with custom state management and scheduling
 * const [items, setItems] = createSignal([]);
 *
 * const queue = createQueuer({
 *   started: true, // Start processing immediately
 *   wait: 1000,    // Process one item every second
 *   onUpdate: (queue) => setItems(queue.getAllItems()),
 *   getPriority: (item) => item.priority // Process higher priority items first
 * });
 *
 * // Add items to process - they'll be handled automatically
 * queue.addItem('task1');
 * queue.addItem('task2');
 *
 * // Control the scheduler
 * queue.stop();  // Pause processing
 * queue.start(); // Resume processing
 * ```
 */
export function createQueuer<TValue>(
  initialOptions: QueuerOptions<TValue> = {},
): SolidQueuer<TValue> {
  const queuer = new Queuer<TValue>(initialOptions)

  const [executionCount, setExecutionCount] = createSignal(
    queuer.getExecutionCount(),
  )
  const [isEmpty, setIsEmpty] = createSignal(queuer.getIsEmpty())
  const [isFull, setIsFull] = createSignal(queuer.getIsFull())
  const [isIdle, setIsIdle] = createSignal(queuer.getIsIdle())
  const [isRunning, setIsRunning] = createSignal(queuer.getIsRunning())
  const [items, setItems] = createSignal<Array<TValue>>(queuer.getAllItems())
  const [peek, setPeek] = createSignal<TValue | undefined>(queuer.getPeek())
  const [size, setSize] = createSignal(queuer.getSize())

  queuer.setOptions({
    onUpdate: (queuer) => {
      setExecutionCount(queuer.getExecutionCount())
      setIsEmpty(queuer.getIsEmpty())
      setIsFull(queuer.getIsFull())
      setIsIdle(queuer.getIsIdle())
      setItems(queuer.getAllItems())
      setPeek(() => queuer.getPeek())
      setSize(queuer.getSize())
      initialOptions.onUpdate?.(queuer)
    },
    onIsRunningChange: (queuer) => {
      setIsRunning(queuer.getIsRunning())
      setIsIdle(queuer.getIsIdle())
      initialOptions.onIsRunningChange?.(queuer)
    },
  })

  return {
    ...bindInstanceMethods(queuer),
    executionCount,
    isEmpty,
    isFull,
    isIdle,
    isRunning,
    items,
    peek,
    size,
  }
}
