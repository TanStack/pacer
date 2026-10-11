import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { asyncDebounce } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

class Example extends Component {
  @tracked searchText = ''
  @tracked debouncedSearchText = ''
  @tracked searchResults: Array<string> = []
  @tracked loading = false
  simulateSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      `Result 1 for ${query}`,
      `Result 2 for ${query}`,
      `Result 3 for ${query}`,
    ]
  }
  debouncedSetSearch = asyncDebounce(
    async (value: string) => {
      try {
        this.loading = true
        this.debouncedSearchText = value
        const results = await this.simulateSearch(value)
        this.searchResults = results
      } catch (err) {
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    {
      wait: 500,
    },
  )
  updateSearch = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchText = newValue
    this.debouncedSetSearch(newValue)
  }
  <template>
    <div><h1>TanStack Pacer asyncDebounce Example</h1><div><input
          type='search'
          value={{this.searchText}}
          {{on 'input' this.updateSearch}}
          placeholder='Type to search...'
          style='width: 100%'
        />{{#if this.loading}}<div>Loading...</div>{{/if}}</div><table><tbody
        ><tr><td>Instant Search:</td><td>{{this.searchText}}</td></tr><tr><td
            >Debounced Search:</td><td
            >{{this.debouncedSearchText}}</td></tr></tbody></table><div><h3
        >Search Results:</h3><ul>{{#each this.searchResults as |result i|}}<li
            >{{result}}</li>{{/each}}</ul></div></div>
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
    <div><Example /></div>
  </template>
}
