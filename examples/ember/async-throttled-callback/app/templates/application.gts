import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncThrottler } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

interface SearchResult {
  id: number
  title: string
}
type CounterExecute = Counter['execute']
type CounterUtility = (...args: Parameters<CounterExecute>) => unknown
const gt = (a: number, b: number) => a > b
class Counter extends Component {
  fakeApi = async (term: string): Promise<Array<SearchResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    if (term === 'error') {
      throw new Error('Simulated API error')
    }
    return [
      { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
      { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    ]
  }
  @tracked searchTerm = ''
  @tracked results: Array<SearchResult> = []
  @tracked isLoading = false
  @tracked error: string | null = null
  handleSearchChange = async (utility: CounterUtility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTerm = newValue
    try {
      await utility(newValue)
    } catch (err) {
      // Error is already handled in the throttled function
      console.log('Search failed:', err)
    }
  }
  execute = async (term: string) => {
    if (!term.trim()) {
      this.results = []
      return []
    }
    this.isLoading = true
    this.error = null
    try {
      const data = await this.fakeApi(term)
      this.results = data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      this.error = errorMessage
      this.results = []
      throw err
    } finally {
      this.isLoading = false
    }
  }
  <template>
    {{#let (useAsyncThrottler this.execute wait=1000) as |throttledSearch|}}<div
      ><h1>TanStack Pacer useAsyncThrottler Example 1</h1><div><input
            type='search'
            value={{this.searchTerm}}
            {{on
              'input'
              (fn this.handleSearchChange throttledSearch.maybeExecute)
            }}
            placeholder="Type to search... (try 'error' to see error handling)"
            style='width: 100%; margin-bottom: 10px'
          /></div>{{#if this.isLoading}}<p
            style='color: blue'
          >Searching...</p>{{/if}}{{#if this.error}}<p style='color: red'>Error:
            {{this.error}}</p>{{/if}}<div><p>Current search term:
            {{this.searchTerm}}</p>{{#if (gt this.results.length 0)}}<div><h3
              >Results:</h3><ul>{{#each this.results as |result index|}}<li
                  >{{result.title}}</li>{{/each}}</ul></div>{{/if}}</div></div>{{/let}}
  </template>
}

type SearchExecute = Search['execute']
type SearchUtility = (...args: Parameters<SearchExecute>) => unknown

class Search extends Component {
  @tracked count = 0
  @tracked apiCallCount = 0
  incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    this.apiCallCount = this.apiCallCount + 1
    return newCount
  }
  handleIncrement = (utility: SearchUtility) => {
    // Update local state immediately for instant feedback
    this.count = ((prev) => {
      const newCount = prev + 1
      utility(newCount)
      return newCount
    })(this.count)
  }
  execute = async (currentValue: number) => {
    const result = await this.incrementApi(currentValue)
    this.count = result
    return result
  }
  <template>
    {{#let
      (useAsyncThrottler this.execute wait=1000 leading=true trailing=true)
      as |throttledIncrement|
    }}<div><h1>TanStack Pacer useAsyncThrottler Example 2</h1><table><tbody><tr
            ><td>Current Count:</td><td>{{this.count}}</td></tr><tr><td>API
                Calls Made:</td><td
              >{{this.apiCallCount}}</td></tr></tbody></table><div><button
            {{on
              'click'
              (fn this.handleIncrement throttledIncrement.maybeExecute)
            }}
          >Increment (throttled API call)</button></div><p
          style='font-size: 0.9em; color: #666'
        >
          Click rapidly - API calls are throttled to 1 second, but UI updates
          immediately. First click executes immediately, then at most once per
          second.
        </p></div>{{/let}}
  </template>
}

type RangeExecute = Range['execute']
type RangeUtility = (...args: Parameters<RangeExecute>) => unknown
const round = (value: number) => Math.round(value)
const time = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
class Range extends Component {
  @tracked scrollPosition = 0
  @tracked saveCount = 0
  @tracked lastSaved: Date | null = null
  @tracked isSaving = false
  saveScrollPosition = async (
    position: number,
  ): Promise<{
    success: boolean
    position: number
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }
  handleScroll = (utility: RangeUtility, e: Event) => {
    const position = (e.currentTarget as HTMLDivElement).scrollTop
    this.scrollPosition = position
    utility(position)
  }
  execute = async (position: number) => {
    this.isSaving = true
    try {
      const result = await this.saveScrollPosition(position)
      this.saveCount = this.saveCount + 1
      this.lastSaved = new Date()
      return result
    } finally {
      this.isSaving = false
    }
  }
  <template>
    {{#let
      (useAsyncThrottler this.execute wait=1000 leading=true trailing=true)
      as |throttledSave|
    }}<div><h1>TanStack Pacer useAsyncThrottler Example 3</h1><div
          style='height: 200px; overflow: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px'
          {{on 'scroll' (fn this.handleScroll throttledSave.maybeExecute)}}
        ><div style='height: 1000px'><p>Scroll this area to trigger throttled
              saves!</p><p>Current scroll position:
              {{round this.scrollPosition}}px</p>{{#if this.isSaving}}<p
                style='color: blue'
              >Saving position...</p>{{/if}}<div style='margin-top: 20px'><p
              >Saves triggered: {{this.saveCount}}</p>{{#if this.lastSaved}}<p>
                  Last saved at:
                  {{time this.lastSaved}}</p>{{/if}}</div><div
              style='margin-top: 40px'
            ><p>Keep scrolling...</p><p style='margin-top: 100px'>More
                content...</p><p style='margin-top: 100px'>Even more content...</p><p
                style='margin-top: 100px'
              >Almost there...</p><p style='margin-top: 100px'>You made it to
                the end!</p></div></div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Scroll position is saved at most once per second, but updates
          instantly on screen
        </p></div>{{/let}}
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
