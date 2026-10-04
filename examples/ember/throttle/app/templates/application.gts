import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { throttle } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

class Counter extends Component {
  @tracked instantCount = 0
  @tracked throttledCount = 0
  throttledSetCount = throttle(
    (value: typeof this.throttledCount) => (this.throttledCount = value),
    {
      wait: 1000,
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 1</h1><table><tbody><tr><td>Instant
              Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Throttled
              Count:</td><td
            >{{this.throttledCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}

class Search extends Component {
  @tracked text = ''
  @tracked throttledText = ''
  throttledSetText = throttle(
    (value: typeof this.throttledText) => (this.throttledText = value),
    {
      wait: 1000,
    },
  )
  handleTextChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.throttledSetText(newValue)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 2</h1><div><input
          type='search'
          value={{this.text}}
          {{on 'input' this.handleTextChange}}
          placeholder='Type text (throttled to 1 update per second)...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Instant Text:</td><td
            >{{this.text}}</td></tr><tr><td>Throttled Text:</td><td
            >{{this.throttledText}}</td></tr></tbody></table></div>
  </template>
}

class Range extends Component {
  @tracked currentValue = 50
  @tracked throttledValue = 50
  @tracked instantExecutionCount = 0
  throttledSetValue = throttle(
    (value: typeof this.throttledValue) => (this.throttledValue = value),
    {
      wait: 250,
    },
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    this.throttledSetValue(newValue)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 3</h1><div
        style='margin-bottom: 20px'
      ><label>Current Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.currentValue}}
            {{on 'input' this.handleRangeChange}}
            style='width: 100%'
          /><span>{{this.currentValue}}</span></label></div><div
        style='margin-bottom: 20px'
      ><label>Throttled Range (Readonly):<input
            type='range'
            min='0'
            max='100'
            value={{this.throttledValue}}
            disabled
            style='width: 100%'
          /><span>{{this.throttledValue}}</span></label></div><table><tbody><tr
          ><td>Instant Executions:</td><td
            >{{this.instantExecutionCount}}</td></tr></tbody></table><div
        style='color: #666; font-size: 0.9em'
      ><p>Throttled with 250ms wait time</p></div></div>
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
