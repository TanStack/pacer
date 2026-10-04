import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { debounce } from '@tanstack/ember-pacer'

export default class Range extends Component {
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
