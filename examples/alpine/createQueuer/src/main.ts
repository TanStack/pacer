import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineQueuer, QueuerState } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

Alpine.data('counter', () => {
  const scope = createPacerScope()
  return {
    processItem(item: number) {
      console.log('processing item', item)
    },
    queuer: null as AlpineQueuer<number, QueuerState<number>> | null,
    init() {
      this.queuer = scope.createQueuer(
        this.processItem.bind(this),
        () => ({
          key: 'Add Number Queue',
          initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          maxSize: 25, // optional, defaults to Infinity
          started: false, // optional, defaults to true
          wait: 1000, // wait 1 second between processing items - wait is optional!
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('range', () => {
  const scope = createPacerScope()
  return {
    currentValue: 50,
    queuedValue: 50,
    submittedCount: 1,
    processItem(item: number) {
      this.queuedValue = item
    },
    handleRangeChange(e: Event) {
      const newValue = parseInt((e.target as HTMLInputElement).value, 10)
      this.currentValue = newValue
      this.submittedCount = this.submittedCount + 1
      this.queuer!.addItem(newValue)
    },
    queuer: null as AlpineQueuer<number, QueuerState<number>> | null,
    init() {
      this.queuer = scope.createQueuer(
        this.processItem.bind(this),
        () => ({
          key: 'Range Queue',
          maxSize: 100,
          initialItems: [this.currentValue],
          wait: 100,
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
