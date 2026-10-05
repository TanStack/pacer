import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineBatcher, BatcherState } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

Alpine.data('demo', () => {
  const scope = createPacerScope()
  return {
    processedBatches: [] as Array<Array<number>>,
    processBatch(items: Array<number>) {
      this.processedBatches = [...this.processedBatches, items]
      console.log('processing batch', items)
    },
    batcher: null as AlpineBatcher<number, BatcherState<number>> | null,
    init() {
      this.batcher = scope.createBatcher(
        this.processBatch.bind(this),
        () => ({
          key: 'createBatcher',
          // started: false, // true by default
          maxSize: 5, // Process in batches of 5 (if comes before wait time)
          wait: 3000, // wait up to 3 seconds before processing a batch (if time elapses before maxSize is reached)
          getShouldExecute: (items, _batcher) => items.includes(42), // or pass in a custom function to determine if the batch should be processed
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('devtools', () => {
  let host: TanStackDevtoolsCore | undefined
  let target: HTMLDivElement | undefined
  return {
    init() {
      if (!import.meta.env.DEV) return
      target = document.createElement('div')
      document.body.append(target)
      host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
      host.mount(target)
    },
    destroy() {
      host?.unmount()
      target?.remove()
    },
  }
})
Alpine.start()
