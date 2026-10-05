import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { debounce } from '@tanstack/ember-pacer'
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
  @tracked debouncedCount = 0
  debouncedSetCount = debounce(
    (value: typeof this.debouncedCount) => (this.debouncedCount = value),
    {
      wait: 500,
      // leading: true, // optional, defaults to false
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  <template>
    <div><h1>TanStack Pacer debounce Example 1</h1><table><tbody><tr><td>Instant
              Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Debounced
              Count:</td><td
            >{{this.debouncedCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}

class Search extends Component {
  @tracked searchText = ''
  @tracked debouncedSearchText = ''
  debouncedSetSearch = debounce(
    (value: typeof this.debouncedSearchText) =>
      (this.debouncedSearchText = value),
    {
      wait: 500,
    },
  )
  handleSearchChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  <template>
    <div><h1>TanStack Pacer debounce Example 2</h1><div><input
          type='search'
          value={{this.searchText}}
          {{on 'input' this.handleSearchChange}}
          placeholder='Type to search...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Instant Search:</td><td
            >{{this.searchText}}</td></tr><tr><td>Debounced Search:</td><td
            >{{this.debouncedSearchText}}</td></tr></tbody></table></div>
  </template>
}

class Range extends Component {
  @tracked instantValue = 50
  @tracked debouncedValue = 50
  debouncedSetValue = debounce(
    (value: typeof this.debouncedValue) => (this.debouncedValue = value),
    {
      wait: 250,
    },
  )
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.instantValue = newValue
    this.debouncedSetValue(newValue)
  }
  <template>
    <div><h1>TanStack Pacer debounce Example 3</h1><div
        style='margin-bottom: 20px'
      ><label>Instant Range:<input
            type='range'
            min='0'
            max='100'
            value={{this.instantValue}}
            {{on 'input' this.handleRangeChange}}
            style='width: 100%'
          /><span>{{this.instantValue}}</span></label></div><div><label
        >Debounced Range (Readonly):<input
            type='range'
            min='0'
            max='100'
            value={{this.debouncedValue}}
            disabled
            style='width: 100%'
          /><span>{{this.debouncedValue}}</span></label></div></div>
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
