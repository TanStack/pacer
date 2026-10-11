import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { module, test } from 'qunit'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { EmberDebouncer, DebouncerState } from '@tanstack/ember-pacer'

let component: Fixture
let utility: EmberDebouncer<() => void, { count: number }>
const capture = (value: typeof utility) => {
  utility = value
  return ''
}
class Fixture extends Component {
  @tracked offset = 1
  execute = () => {}
  select = (state: DebouncerState<() => void>) => ({
    count: state.executionCount + this.offset,
  })
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    component = this
  }
  <template>
    {{#let (useDebouncer this.execute this.select wait=100) as |instance|}}
      {{capture instance}}<output>{{instance.state.count}}</output>
    {{/let}}
  </template>
}
module('reactive selection', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(() => clearRender())
  test('refreshes a selection when component inputs change without a store update', async (assert) => {
    await render(<template><Fixture /></template>)
    const original = utility
    assert.dom('output').hasText('1')
    component.offset = 2
    await settled()
    assert.strictEqual(utility, original)
    assert.strictEqual(utility.store.state.executionCount, 0)
    assert.dom('output').hasText('2')
  })
})
