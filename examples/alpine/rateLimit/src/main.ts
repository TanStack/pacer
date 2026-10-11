import { rateLimit } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

class Counter {
  windowType: 'fixed' | 'sliding' = 'fixed'
  instantCount = 0
  rateLimitedCount = 0
  rateLimitedSetCountWindow = this.windowType
  rateLimitedSetCountFunction!: ReturnType<
    Counter['makeRateLimitedSetCountFunction']
  >
  makeRateLimitedSetCountFunction() {
    return rateLimit(
      (value: typeof this.rateLimitedCount) => (this.rateLimitedCount = value),
      {
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      },
    )
  }
  get rateLimitedSetCount() {
    if (this.rateLimitedSetCountWindow !== this.windowType) {
      this.rateLimitedSetCountWindow = this.windowType
      this.rateLimitedSetCountFunction = rateLimit(
        (value: typeof this.rateLimitedCount) =>
          (this.rateLimitedCount = value),
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetCountFunction
  }
  increment() {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  init() {
    this.rateLimitedSetCountFunction = this.makeRateLimitedSetCountFunction()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  windowType: 'fixed' | 'sliding' = 'fixed'
  text = ''
  rateLimitedText = ''
  rateLimitedSetTextWindow = this.windowType
  rateLimitedSetTextFunction!: ReturnType<
    Search['makeRateLimitedSetTextFunction']
  >
  makeRateLimitedSetTextFunction() {
    return rateLimit(
      (value: typeof this.rateLimitedText) => (this.rateLimitedText = value),
      {
        limit: 5,
        window: 5000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      },
    )
  }
  get rateLimitedSetText() {
    if (this.rateLimitedSetTextWindow !== this.windowType) {
      this.rateLimitedSetTextWindow = this.windowType
      this.rateLimitedSetTextFunction = rateLimit(
        (value: typeof this.rateLimitedText) => (this.rateLimitedText = value),
        {
          limit: 5,
          window: 5000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetTextFunction
  }
  handleTextChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.rateLimitedSetText(newValue)
  }
  init() {
    this.rateLimitedSetTextFunction = this.makeRateLimitedSetTextFunction()
  }
}
Alpine.data('search', () => new Search())

class Range {
  windowType: 'fixed' | 'sliding' = 'fixed'
  currentValue = 50
  rateLimitedValue = 50
  rateLimitedSetValueWindow = this.windowType
  rateLimitedSetValueFunction!: ReturnType<
    Range['makeRateLimitedSetValueFunction']
  >
  makeRateLimitedSetValueFunction() {
    return rateLimit(
      (value: typeof this.rateLimitedValue) => (this.rateLimitedValue = value),
      {
        limit: 30,
        window: 2000,
        windowType: this.windowType,
        onReject: (rateLimiter) =>
          console.log(
            'Rejected by rate limiter',
            rateLimiter.getMsUntilNextWindow(),
          ),
      },
    )
  }
  get rateLimitedSetValue() {
    if (this.rateLimitedSetValueWindow !== this.windowType) {
      this.rateLimitedSetValueWindow = this.windowType
      this.rateLimitedSetValueFunction = rateLimit(
        (value: typeof this.rateLimitedValue) =>
          (this.rateLimitedValue = value),
        {
          limit: 30,
          window: 2000,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        },
      )
    }
    return this.rateLimitedSetValueFunction
  }
  handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.rateLimitedSetValue(newValue)
  }
  init() {
    this.rateLimitedSetValueFunction = this.makeRateLimitedSetValueFunction()
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
