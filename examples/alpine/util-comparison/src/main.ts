import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Demo {
  private scope = createPacerScope()
  explainReadonly() {
    window.alert('These sliders are read-only. Move the main slider at the top')
  }
  currentValue = 50
  instantExecutionCount = 0
  debouncedValue = 50
  throttledValue = 50
  rateLimitedValue = 50
  queuedValue = 50
  batchedValue = 50
  debouncer!: ReturnType<Demo['makeDebouncer']>
  makeDebouncer() {
    return this.scope.createDebouncer(
      (value: typeof this.debouncedValue) => {
        this.debouncedValue = value
      },
      () => ({
        key: 'my-debouncer',
        wait: 600,
      }),
      (state) => state,
    )
  }
  throttler!: ReturnType<Demo['makeThrottler']>
  makeThrottler() {
    return this.scope.createThrottler(
      (value: typeof this.throttledValue) => {
        this.throttledValue = value
      },
      () => ({
        key: 'my-throttler',
        wait: 600,
      }),
      (state) => state,
    )
  }
  rateLimiter!: ReturnType<Demo['makeRateLimiter']>
  makeRateLimiter() {
    return this.scope.createRateLimiter(
      (value: typeof this.rateLimitedValue) => {
        this.rateLimitedValue = value
      },
      () => ({
        key: 'my-rate-limiter',
        limit: 20,
        window: 2000,
        windowType: 'sliding',
      }),
      (state) => state,
    )
  }
  queuer!: ReturnType<Demo['makeQueuer']>
  makeQueuer() {
    return this.scope.createQueuer(
      (value: typeof this.queuedValue) => {
        this.queuedValue = value
      },
      () => ({
        key: 'my-queuer',
        wait: 100,
        maxSize: 50,
      }),
      (state) => state,
    )
  }
  batcher!: ReturnType<Demo['makeBatcher']>
  makeBatcher() {
    return this.scope.createBatcher(
      (items: Array<number>) => {
        // Use the last item in the batch as the displayed value
        if (items.length > 0) {
          this.batchedValue = items[items.length - 1]!
        }
      },
      () => ({
        key: 'my-batcher',
        wait: 600,
        maxSize: 5,
      }),
      (state) => state,
    )
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // Trigger each utility
    this.debouncer.maybeExecute(newValue)
    this.throttler.maybeExecute(newValue)
    this.rateLimiter.maybeExecute(newValue)
    this.queuer.addItem(newValue)
    this.batcher.addItem(newValue)
  }
  getSyncStatus(
    processedValue: number,
    utilityName: string,
    utilityState?: {
      status: string
    },
  ) {
    const isOutOfSync = processedValue !== this.currentValue
    const isPending =
      (utilityName === 'Debouncer' && utilityState?.status === 'pending') ||
      (utilityName === 'Throttler' && utilityState?.status === 'pending') ||
      (utilityName === 'Queuer' && utilityState?.status === 'running') ||
      (utilityName === 'Batcher' && utilityState?.status === 'pending')
    // Tooltip explanations for why certain utilities become out of sync
    const getTooltip = () => {
      if (!isOutOfSync) return undefined
      switch (utilityName) {
        case 'Rate Limiter':
          return isPending
            ? 'Rate limiter is processing within limits'
            : 'Rate limiters reject executions when the limit is exceeded. Rejected calls are discarded entirely and never processed, causing the value to lag behind rapid changes.'
        case 'Queuer':
          return isPending
            ? 'Queuer is processing items from the queue'
            : 'Queuers reject new items when their buffer is full. If items are added faster than they can be processed, the buffer overflows and newer items are dropped.'
        default:
          return undefined
      }
    }
    return {
      isOutOfSync,
      isPending,
      statusText: isOutOfSync
        ? isPending
          ? 'Processing...'
          : 'Out of sync'
        : 'Synced',
      tooltip: getTooltip(),
    }
  }
  get utilityMetadata() {
    return [
      {
        name: 'Debouncer',
        value: this.debouncedValue,
        description: `Delays execution until after ${this.debouncer.options.wait}ms of inactivity`,
        color: '#3b82f6', // blue
        flush: () => this.debouncer.flush(),
        util: this.debouncer,
      },
      {
        name: 'Throttler',
        value: this.throttledValue,
        description: `Limits execution to once every ${this.throttler.options.wait}ms`,
        color: '#0891b2', // cyan
        flush: () => this.throttler.flush(),
        util: this.throttler,
      },
      {
        name: 'Rate Limiter',
        value: this.rateLimitedValue,
        description: `Allows max ${this.rateLimiter.options.limit} executions per ${this.rateLimiter.options.window}ms window`,
        color: '#ea580c', // orange
        util: this.rateLimiter,
      },
      {
        name: 'Queuer',
        value: this.queuedValue,
        description: `Processes items sequentially with ${this.queuer.options.wait}ms delay`,
        color: '#db2777', // pink
        flush: () => this.queuer.flush(),
        util: this.queuer,
      },
      {
        name: 'Batcher',
        value: this.batchedValue,
        description: `Processes in batches of ${this.batcher.options.maxSize} or after ${this.batcher.options.wait}ms`,
        color: '#8b5cf6', // purple
        flush: () => this.batcher.flush(),
        util: this.batcher,
      },
    ] as const
  }
  init() {
    this.debouncer = this.makeDebouncer()
    this.throttler = this.makeThrottler()
    this.rateLimiter = this.makeRateLimiter()
    this.queuer = this.makeQueuer()
    this.batcher = this.makeBatcher()
  }
  destroy() {
    this.scope.destroy()
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
