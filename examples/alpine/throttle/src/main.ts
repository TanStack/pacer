import { throttle } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  instantCount = 0
  throttledCount = 0
  throttledSetCount!: ReturnType<Counter['makeThrottledSetCount']>
  makeThrottledSetCount() {
    return throttle(
      (value: typeof this.throttledCount) => (this.throttledCount = value),
      {
        wait: 1000,
      },
    )
  }
  increment() {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  init() {
    this.throttledSetCount = this.makeThrottledSetCount()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  text = ''
  throttledText = ''
  throttledSetText!: ReturnType<Search['makeThrottledSetText']>
  makeThrottledSetText() {
    return throttle(
      (value: typeof this.throttledText) => (this.throttledText = value),
      {
        wait: 1000,
      },
    )
  }
  handleTextChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.throttledSetText(newValue)
  }
  init() {
    this.throttledSetText = this.makeThrottledSetText()
  }
}
Alpine.data('search', () => new Search())

class Range {
  currentValue = 50
  throttledValue = 50
  instantExecutionCount = 0
  throttledSetValue!: ReturnType<Range['makeThrottledSetValue']>
  makeThrottledSetValue() {
    return throttle(
      (value: typeof this.throttledValue) => (this.throttledValue = value),
      {
        wait: 250,
      },
    )
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.throttledSetValue(newValue)
  }
  init() {
    this.throttledSetValue = this.makeThrottledSetValue()
  }
}
Alpine.data('range', () => new Range())

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
