import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { EmberDebouncer } from '@tanstack/ember-pacer'
let component: Fixture
let utility: EmberDebouncer<() => void, { count: number }>
let cleanups: number[] = []
const capture = (value: typeof utility) => { utility = value; return '' }
class Fixture extends Component {
  @tracked amount = 100
  execute = () => {}
  select = (state: { executionCount: number }) => ({ count: state.executionCount })
  cleanup = () => { cleanups.push(this.amount) }
  constructor(...args: ConstructorParameters<typeof Component>) { super(...args); component = this }
  <template>
    {{#let (useDebouncer this.execute this.select wait=this.amount onUnmount=this.cleanup) as |instance|}}
      {{capture instance}}
      <output>{{instance.state.count}}</output>
    {{/let}}
  </template>
}
module('useDebouncer', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => { await clearRender(); cleanups = [] })
  test('updates named arguments, publishes selected state, and cleans up once', async (assert) => {
    await render(<template><Fixture /></template>)
    const original = utility, store = utility.store
    component.amount = 200
    await settled()
    assert.strictEqual(utility, original)
    assert.strictEqual(utility.store, store)
    assert.strictEqual(utility.options.wait, 200)
    utility.store.setState((state) => ({ ...state, executionCount: 4 }))
    await settled()
    assert.dom('output').hasText('4')
    await clearRender()
    assert.deepEqual(cleanups, [200])
  })
})
