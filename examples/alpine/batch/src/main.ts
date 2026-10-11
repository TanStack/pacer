import { batch } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Demo {
  processedBatches: Array<Array<number>> = []
  batchItems: Array<number> = []
  addToBatch!: ReturnType<Demo['makeAddToBatch']>
  makeAddToBatch() {
    return batch<number>(
      (items) => {
        this.processedBatches = [...this.processedBatches, items]
        console.log('Processing batch', items)
      },
      {
        maxSize: 5,
        wait: 3000,
        getShouldExecute: (items) => items.includes(42),
        onItemsChange: (batcherInstance) => {
          this.batchItems = batcherInstance.peekAllItems()
        },
      },
    )
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
