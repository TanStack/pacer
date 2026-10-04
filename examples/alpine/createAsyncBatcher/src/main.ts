import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type {
  AlpineAsyncBatcher,
  AsyncBatcherState,
} from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
type Item = {
  id: number
  value: string
  timestamp: number
}
Alpine.data('demo', () => {
  const scope = createPacerScope()
  return {
    fakeProcessingTime: 1000,
    processedBatches: [] as Array<{
      items: Array<Item>
      result: string
      timestamp: number
    }>,
    errors: [] as Array<string>,
    async processBatch(items: Array<Item>): Promise<string> {
      console.log('Processing batch of', items.length, 'items:', items)
      // Simulate async processing time
      await new Promise((resolve) =>
        setTimeout(resolve, this.fakeProcessingTime),
      )
      // Simulate occasional failures for demo purposes
      // throw new Error(`Processing failed for batch with ${items.length} items`)
      // Return a result from the batch processing
      const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
      this.processedBatches = [
        ...this.processedBatches,
        { items, result, timestamp: Date.now() },
      ]
      return result
    },
    addItem(isUrgent = false) {
      const nextId = Date.now()
      const item: Item = {
        id: nextId,
        value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
        timestamp: nextId,
      }
      this.asyncBatcher!.addItem(item)
    },
    async executeCurrentBatch() {
      try {
        const result = await this.asyncBatcher!.flush()
        console.log('Manual execution result:', result)
      } catch (error) {
        console.error('Manual execution failed:', error)
      }
    },
    asyncBatcher: null as AlpineAsyncBatcher<
      Item,
      AsyncBatcherState<Item>
    > | null,
    init() {
      this.asyncBatcher = scope.createAsyncBatcher(
        this.processBatch.bind(this),
        () => ({
          key: 'createAsyncBatcher',
          maxSize: 5, // Process in batches of 5 (if reached before wait time)
          wait: 4000, // Wait up to 4 seconds before processing a batch
          getShouldExecute: (items) =>
            items.some((item) => item.value.includes('urgent')), // Process immediately if any item is marked urgent
          throwOnError: false, // Don't throw errors, handle them via onError
          onSuccess: (result, batch, batcher) => {
            console.log('Batch succeeded:', result)
            console.log('Processed batch:', batch)
            console.log(
              'Total successful batches:',
              batcher.store.state.successCount,
            )
          },
          onError: (error: any, _batcher) => {
            console.error('Batch failed:', error)
            this.errors = [
              ...this.errors,
              `Error: ${error} (${new Date().toLocaleTimeString()})`,
            ]
          },
          onSettled: (batch, batcher) => {
            console.log('Batch settled:', batch)
            console.log(
              'Total processed items:',
              batcher.store.state.totalItemsProcessed,
            )
          },
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
