import { module, test } from 'qunit'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { EmberDebouncer } from '@tanstack/ember-pacer'

let utility: EmberDebouncer<() => void>
let component: Fixture
let renders = 0
const capture = (value: typeof utility) => {
  utility = value
  return ''
}
const selector = (state: { isPending: boolean }) => ({
  pending: state.isPending,
})
const display = (state: { pending: boolean }) => {
  renders++
  return String(state.pending)
}
class Fixture extends Component {
  @tracked visible = true
  execute = () => {}
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    component = this
  }
  <template>
    {{#let (useDebouncer this.execute wait=1000) as |instance|}}
      {{capture instance}}
      {{#if this.visible}}
        {{#let (instance.Subscribe selector) as |state|}}
          <output>{{display state}}</output>
        {{/let}}
      {{/if}}
    {{/let}}
  </template>
}
module('child subscriptions', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    renders = 0
  })
  test('owns the child subscription without cancelling the parent utility', async (assert) => {
    await render(<template><Fixture /></template>)
    assert.dom('output').hasText('false')
    utility.maybeExecute()
    await settled()
    assert.dom('output').hasText('true')
    assert.deepEqual(utility.state, {})
    const rendered = renders
    utility.maybeExecute()
    await settled()
    assert.strictEqual(renders, rendered)
    component.visible = false
    await settled()
    assert.true(utility.store.state.isPending)
    utility.cancel()
    await settled()
    assert.strictEqual(renders, rendered)
  })
})
