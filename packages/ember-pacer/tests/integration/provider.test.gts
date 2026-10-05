import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { createPacerScope } from '@tanstack/ember-pacer'
import type { EmberDebouncer, EmberDebouncedState } from '@tanstack/ember-pacer'
let component: Fixture
let inherited: EmberDebouncer<() => void>
let local: EmberDebouncedState<number>
const captureInherited = (value: typeof inherited) => {
  inherited = value
  return ''
}
const captureLocal = (value: typeof local) => {
  local = value
  return ''
}
class Fixture extends Component {
  @tracked enabled = false
  scope = createPacerScope(() => ({ debouncer: { enabled: this.enabled } }))
  execute = () => {}
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    component = this
  }
  <template>
    {{captureInherited (this.scope.useDebouncer this.execute wait=100)}}
    {{captureLocal (this.scope.useDebouncedState 1 wait=100 enabled=false)}}
  </template>
}
module('contextual provider helpers', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(() => clearRender())
  test('tracks defaults and respects local helper options', async (assert) => {
    await render(<template><Fixture /></template>)
    const original = inherited
    assert.false(inherited.options.enabled)
    component.enabled = true
    await settled()
    assert.strictEqual(inherited, original)
    assert.true(inherited.options.enabled)
    assert.false(local.utility.options.enabled)
  })
})
