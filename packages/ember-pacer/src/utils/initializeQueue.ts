import { isDestroyed, isDestroying } from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import type { QueuePosition } from '@tanstack/pacer'

interface InitialQueueOptions<TValue> {
  started?: boolean
  initialItems?: Array<TValue>
  initialState?: { isRunning?: boolean; items?: Array<TValue> }
  addItemsTo?: QueuePosition
}

/** Runs initial queue callbacks outside Glimmer's template evaluation. */
export function initializeQueue<TValue>(
  owner: object,
  queue: {
    start: () => void
    addItem: (
      item: TValue,
      position?: QueuePosition,
      runOnItemsChange?: boolean,
    ) => unknown
  },
  options: InitialQueueOptions<TValue>,
) {
  const started = options.initialState?.isRunning ?? options.started ?? true
  const items = options.initialState?.items
    ? undefined
    : options.initialItems?.slice()
  const position = options.addItemsTo ?? 'back'

  scheduleOnce('afterRender', owner, () => {
    if (isDestroyed(owner) || isDestroying(owner)) return
    if (started) queue.start()
    items?.forEach((item, index) => {
      if (isDestroyed(owner) || isDestroying(owner)) return
      queue.addItem(item, position, index === items.length - 1)
    })
  })
}
