import { createSignal } from 'solid-js'
import { createQueue } from './createQueue'
import type { QueueOptions } from '../../../pacer/dist/esm/queue'

export function createQueueSignal<TValue>(options: QueueOptions<TValue> = {}) {
  const [state, setState] = createSignal<Array<TValue>>(
    options.initialItems || [],
  )

  const queue = createQueue<TValue>({
    ...options,
    onUpdate: (queue) => {
      setState(queue.getAllItems())
    },
  })

  return [state, queue] as const
}
