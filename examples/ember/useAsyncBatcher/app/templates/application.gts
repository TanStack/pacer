import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type { AsyncBatcherState } from '@tanstack/ember-pacer'
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  @tracked input = 'hello'
  @tracked wait = 200
  @tracked history: Array<Array<string>> = []
  execute = async (value: Array<string>) => { this.history = [...this.history, value] }
  select = (state: AsyncBatcherState<string>) => state
  updateInput = (event: Event) => { this.input = (event.target as HTMLInputElement).value }
  updateWait = (event: Event) => { this.wait = Number((event.target as HTMLInputElement).value) }
  clear = () => { this.history = [] }
  burst = (schedule: (value: string) => unknown) => { for (let i = 1; i <= 3; i++) void schedule(`${this.input} ${i}`) }
  <template>
{{#let (useAsyncBatcher this.execute this.select wait=this.wait maxSize=3) as |utility|}}
<main>
<h1>Ember useAsyncBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
<label>Task <input value={{this.input}} {{on "input" this.updateInput}} /></label><label>Wait (ms) <input value={{this.wait}} {{on "input" this.updateWait}} type="number" min="0" /></label>
<div><button {{on "click" (fn utility.addItem this.input)}}>Schedule</button><button {{on "click" (fn this.burst utility.addItem)}}>Schedule three</button><button {{on "click" utility.flush}}>Flush</button><button {{on "click" utility.cancel}}>Cancel</button><button {{on "click" this.clear}}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{json this.history}}</pre></section>
<section><h2>Utility state</h2><pre>{{json utility.state}}</pre></section>
<p class="caption">Tracked named arguments update the same utility. The helper owns cleanup when it leaves the template.</p>
</main>
{{/let}}
  </template>
}
