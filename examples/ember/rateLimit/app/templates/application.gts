import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { rateLimit } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

const counterEq = (a: unknown, b: unknown) => a === b
class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked rateLimitedCount = 0
  rateLimitedSetCountWindow = this.windowType
  rateLimitedSetCountFunction = rateLimit(
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
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    <div><h1>TanStack Pacer rateLimit Example 1</h1><div
        style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
      ><label><input
            type='radio'
            name='windowType'
            value='fixed'
            checked={{counterEq this.windowType 'fixed'}}
            {{on 'input' this.useFixedWindow}}
          />Fixed Window</label><label><input
            type='radio'
            name='windowType'
            value='sliding'
            checked={{counterEq this.windowType 'sliding'}}
            {{on 'input' this.useSlidingWindow}}
          />Sliding Window</label></div><table><tbody><tr><td>Instant Count:</td><td
            >{{this.instantCount}}</td></tr><tr><td>Rate Limited Count:</td><td
            >{{this.rateLimitedCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}

const searchEq = (a: unknown, b: unknown) => a === b
class Search extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked text = ''
  @tracked rateLimitedText = ''
  rateLimitedSetTextWindow = this.windowType
  rateLimitedSetTextFunction = rateLimit(
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
  handleTextChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.rateLimitedSetText(newValue)
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    <div><h1>TanStack Pacer rateLimit Example 2</h1><div
        style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
      ><label><input
            type='radio'
            name='windowType2'
            value='fixed'
            checked={{searchEq this.windowType 'fixed'}}
            {{on 'input' this.useFixedWindow}}
          />Fixed Window</label><label><input
            type='radio'
            name='windowType2'
            value='sliding'
            checked={{searchEq this.windowType 'sliding'}}
            {{on 'input' this.useSlidingWindow}}
          />Sliding Window</label></div><div><input
          type='search'
          value={{this.text}}
          {{on 'input' this.handleTextChange}}
          placeholder='Type text (rate limited to 5 updates per 5 seconds)...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Instant Text:</td><td
            >{{this.text}}</td></tr><tr><td>Rate Limited Text:</td><td
            >{{this.rateLimitedText}}</td></tr></tbody></table></div>
  </template>
}

const rangeEq = (a: unknown, b: unknown) => a === b
class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked rateLimitedValue = 50
  rateLimitedSetValueWindow = this.windowType
  rateLimitedSetValueFunction = rateLimit(
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
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.rateLimitedSetValue(newValue)
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    <div><h1>TanStack Pacer rateLimit Example 3</h1><div
        style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
      ><label><input
            type='radio'
            name='windowType3'
            value='fixed'
            checked={{rangeEq this.windowType 'fixed'}}
            {{on 'input' this.useFixedWindow}}
          />Fixed Window</label><label><input
            type='radio'
            name='windowType3'
            value='sliding'
            checked={{rangeEq this.windowType 'sliding'}}
            {{on 'input' this.useSlidingWindow}}
          />Sliding Window</label></div><div style='margin-bottom: 20px'><label
        >Current Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.currentValue}}
            {{on 'input' this.handleRangeChange}}
            style='width: 100%'
          /><span>{{this.currentValue}}</span></label></div><div
        style='margin-bottom: 20px'
      ><label>Rate Limited Range (Readonly):<input
            type='range'
            min='0'
            max='100'
            value={{this.rateLimitedValue}}
            disabled
            style='width: 100%'
          /><span>{{this.rateLimitedValue}}</span></label></div><div
        style='color: #666; font-size: 0.9em'
      ><p>Rate limited to 30 updates per 2000ms window</p></div></div>
  </template>
}

export default class Application extends Component {
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    <div><Counter /><hr /><Search /><hr /><Range /></div>
  </template>
}
