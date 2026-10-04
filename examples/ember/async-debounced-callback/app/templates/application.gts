import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import { htmlSafe } from '@ember/template'
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
      // Error is already handled in the debounced function
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
    {{#let (useAsyncDebouncer this.execute wait=500) as |debouncedSearch|}}<div
      ><h1>TanStack Pacer useAsyncDebouncer Example 1</h1><div><input
            type='search'
            value={{this.searchTerm}}
            {{on
              'input'
              (fn this.handleSearchChange debouncedSearch.maybeExecute)
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
    const newCount = this.count + 1
    this.count = newCount
    // Debounced API call
    utility(newCount)
  }
  execute = async (currentValue: number) => {
    const result = await this.incrementApi(currentValue)
    this.count = result
    return result
  }
  <template>
    {{#let
      (useAsyncDebouncer this.execute wait=1000 leading=false trailing=true)
      as |debouncedIncrement|
    }}<div><h1>TanStack Pacer useAsyncDebouncer Example 2</h1><table><tbody><tr
            ><td>Current Count:</td><td>{{this.count}}</td></tr><tr><td>API
                Calls Made:</td><td
              >{{this.apiCallCount}}</td></tr></tbody></table><div><button
            {{on
              'click'
              (fn this.handleIncrement debouncedIncrement.maybeExecute)
            }}
          >Increment (debounced API call)</button></div><p
          style='font-size: 0.9em; color: #666'
        >
          Click rapidly - API calls are debounced to 1 second, but UI updates
          immediately
        </p></div>{{/let}}
  </template>
}

type RangeExecute = Range['execute']
type RangeUtility = (...args: Parameters<RangeExecute>) => unknown

class Range extends Component {
  @tracked email = ''
  @tracked validationResult: {
    isValid: boolean
    message: string
  } | null = null
  @tracked isValidating = false
  validateEmail = async (
    emailAddress: string,
  ): Promise<{
    isValid: boolean
    message: string
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)
    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }
  handleEmailChange = (utility: RangeUtility, e: Event) => {
    const newEmail = (e.target as HTMLInputElement).value
    this.email = newEmail
    utility(newEmail)
  }
  execute = async (emailAddress: string) => {
    if (!emailAddress.trim()) {
      this.validationResult = null
      return null
    }
    this.isValidating = true
    try {
      const result = await this.validateEmail(emailAddress)
      this.validationResult = result
      return result
    } finally {
      this.isValidating = false
    }
  }
  get inputStyle() {
    const styles = {
      width: '100%',
      marginTop: '5px',
      padding: '8px',
      borderColor:
        this.validationResult?.isValid === false
          ? 'red'
          : this.validationResult?.isValid === true
            ? 'green'
            : 'initial',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  get validationStyle() {
    const styles = {
      color: this.validationResult?.isValid ? 'green' : 'red',
      fontWeight: 'bold',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  <template>
    {{#let
      (useAsyncDebouncer this.execute wait=750 leading=false)
      as |debouncedValidateEmail|
    }}<div><h1>TanStack Pacer useAsyncDebouncer Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Email Address:<input
              type='email'
              value={{this.email}}
              {{on
                'input'
                (fn this.handleEmailChange debouncedValidateEmail.maybeExecute)
              }}
              placeholder='Enter your email...'
              style={{this.inputStyle}}
            /></label></div>{{#if this.isValidating}}<p
            style='color: blue'
          >Validating email...</p>{{/if}}{{#if this.validationResult}}<p
            style={{this.validationStyle}}
          >{{this.validationResult.message}}</p>{{/if}}<p
          style='font-size: 0.9em; color: #666'
        >
          Email validation is debounced to 750ms after you stop typing
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
