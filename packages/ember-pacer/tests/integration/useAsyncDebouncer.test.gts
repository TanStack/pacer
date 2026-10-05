import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import type { EmberAsyncDebouncer } from '@tanstack/ember-pacer'
let component: Fixture
let utility: EmberAsyncDebouncer<() => Promise<void>, { count: number }>
let cleanups: number[] = []
const capture = (value: typeof utility) => {
  utility = value
  return ''
}
class Fixture extends Component {
  @tracked amount = 100
  execute = async () => {}
  select = (state: { settleCount: number }) => ({ count: state.settleCount })
  cleanup = () => {
    cleanups.push(this.amount)
  }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    component = this
  }
  <template>
    {{#let
      (useAsyncDebouncer
        this.execute this.select wait=this.amount onUnmount=this.cleanup
      )
      as |instance|
    }}
      {{capture instance}}
      <output>{{instance.state.count}}</output>
    {{/let}}
  </template>
}
module('useAsyncDebouncer', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    cleanups = []
  })
  test('updates named arguments, publishes selected state, and cleans up once', async (assert) => {
    await render(<template><Fixture /></template>)
    const original = utility,
      store = utility.store
    component.amount = 200
    await settled()
    assert.strictEqual(utility, original)
    assert.strictEqual(utility.store, store)
    assert.strictEqual(utility.options.wait, 200)
    utility.store.setState((state) => ({ ...state, settleCount: 4 }))
    await settled()
    assert.dom('output').hasText('4')
    await clearRender()
    assert.deepEqual(cleanups, [200])
  })
  test('aborts active work on helper destruction', async (assert) => {
    await render(<template><Fixture /></template>)
    let resolve!: () => void
    const pending = new Promise<void>((done) => {
      resolve = done
    })
    utility.fn = () => pending
    utility.setOptions({ wait: 0, leading: true, onUnmount: undefined })
    let aborted = false
    utility.setOptions({
      asyncRetryerOptions: {
        onAbort: () => {
          aborted = true
        },
      },
    })
    const execution = utility.maybeExecute()

    assert.false(aborted)
    await clearRender()
    assert.true(aborted)
    resolve()
    await execution
  })
})
