import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncThrottler } from '@tanstack/ember-pacer'
type Execute = Range['execute']
type Utility = (...args: Parameters<Execute>) => unknown
const round = (value: number) => Math.round(value)
const time = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
export default class Range extends Component {
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
  handleScroll = (utility: Utility, e: Event) => {
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
