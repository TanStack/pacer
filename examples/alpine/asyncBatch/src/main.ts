import { asyncBatch } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
type Item = {
  id: number
  value: string
  timestamp: number
}
class Demo {
  fakeProcessingTime = 1000
  processedBatches: Array<{
    items: Array<Item>
    result: string
    timestamp: number
  }> = []
  errors: Array<string> = []
  pendingItems: Array<Item> = []
  isProcessing = false
  shouldFail = false
  successCount = 0
  errorCount = 0
  async processBatch(items: Array<Item>): Promise<string> {
    console.log('Processing batch of', items.length, 'items:', items)
    this.isProcessing = true
    try {
      // Simulate async processing time
      await new Promise((resolve) =>
        setTimeout(resolve, this.fakeProcessingTime),
      )
      // Simulate occasional failures for demo purposes
      if (this.shouldFail && Math.random() < 0.3) {
        throw new Error(
          `Processing failed for batch with ${items.length} items`,
        )
      }
      // Return a result from the batch processing
      const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
      this.processedBatches = [
        ...this.processedBatches,
        { items, result, timestamp: Date.now() },
      ]
      this.successCount = this.successCount + 1
      console.log('Batch succeeded:', result)
      return result
    } catch (error: any) {
      this.errors = [
        ...this.errors,
        `Error: ${error} (${new Date().toLocaleTimeString()})`,
      ]
      this.errorCount = this.errorCount + 1
      console.error('Batch failed:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }
  addToBatch!: ReturnType<Demo['makeAddToBatch']>
  makeAddToBatch() {
    return asyncBatch<Item>(this.processBatch.bind(this), {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')),
      throwOnError: false, // Don't throw errors, handle them in the processBatch function
      onItemsChange: (batcher) => {
        this.pendingItems = batcher.peekAllItems()
      },
      onSuccess: (result, batch, batcher) => {
        console.log('AsyncBatcher succeeded:', result)
        console.log('Processed batch:', batch)
        console.log(
          'Total successful batches:',
          batcher.store.state.successCount,
        )
      },
      onError: (error: any, failedItems, batcher) => {
        console.error('AsyncBatcher failed:', error)
        console.log('Failed items:', failedItems)
        console.log('Total failed batches:', batcher.store.state.errorCount)
      },
      onSettled: (batch, batcher) => {
        console.log('Batch settled:', batch)
        console.log(
          'Total processed items:',
          batcher.store.state.totalItemsProcessed,
        )
      },
    })
  }
  addItem(isUrgent = false) {
    const nextId = Date.now()
    const item: Item = {
      id: nextId,
      value: isUrgent ? `urgent-${nextId}` : `item-${nextId}`,
      timestamp: nextId,
    }
    this.addToBatch(item)
  }
  init() {
    this.addToBatch = this.makeAddToBatch()
  }
}
Alpine.data('demo', () => new Demo())

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
