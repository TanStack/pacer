import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type {
  AlpineAsyncQueuer,
  AsyncQueuerState,
} from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
type Item = number
Alpine.data('demo', () => {
  const scope = createPacerScope()
  return {
    fakeWaitTime: 500,
    concurrency: 2,
    async processItem(item: Item): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, this.fakeWaitTime))
      console.log(`Processed ${item}`)
    },
    asyncQueuer: null as AlpineAsyncQueuer<
      number,
      AsyncQueuerState<number>
    > | null,
    init() {
      this.asyncQueuer = scope.createAsyncQueuer(
        this.processItem.bind(this),
        () => ({
          key: 'createAsyncQueuer',
          maxSize: 25,
          initialItems: Array.from({ length: 10 }, (_, i) => i + 1),
          concurrency: this.concurrency, // Process 2 items concurrently
          started: false,
          wait: 100, // for demo purposes - usually you would not want extra wait time if you are also throttling with concurrency
          onReject: (item, asyncQueuer) => {
            console.log(
              'Queue is full, rejecting item',
              item,
              asyncQueuer.store.state.rejectionCount,
            )
          },
          onError: (error, item: Item, asyncQueuer) => {
            console.error(
              `Error processing item: ${item}`,
              error,
              asyncQueuer.store.state.errorCount,
            ) // optionally, handle errors here instead of your own try/catch
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
