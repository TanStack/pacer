import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { rateLimit } from '@tanstack/ember-pacer'

const eq = (a: unknown, b: unknown) => a === b
export default class Search extends Component {
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
            checked={{eq this.windowType 'fixed'}}
            {{on 'input' this.useFixedWindow}}
          />Fixed Window</label><label><input
            type='radio'
            name='windowType2'
            value='sliding'
            checked={{eq this.windowType 'sliding'}}
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
