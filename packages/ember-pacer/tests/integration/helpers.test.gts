import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useDebouncedCallback, useDebouncedState, useDebouncedValue, useQueuedState } from '@tanstack/ember-pacer'
import type { EmberDebouncedState, EmberDebouncedValue, EmberQueuer } from '@tanstack/ember-pacer'
let component: Fixture
let state: EmberDebouncedState<number>
let derived: EmberDebouncedValue<string>
let queue: EmberQueuer<string, { items: string[] }>
let callback: (value: string) => void
let calls: string[] = []
const captureState = (value: typeof state) => { state = value; return '' }
const captureDerived = (value: typeof derived) => { derived = value; return '' }
const captureQueue = (value: typeof queue) => { queue = value; return '' }
const captureCallback = (value: typeof callback) => { callback = value; return '' }
class Fixture extends Component {
  @tracked source = 'first'
  execute = (value: string) => { calls.push(value) }
  constructor(...args: ConstructorParameters<typeof Component>) { super(...args); component = this }
  <template>
    {{captureCallback (useDebouncedCallback this.execute wait=20)}}
    {{#let (useDebouncedState 1 wait=20) as |value|}}
      {{captureState value}}<output id="state">{{value.value}}</output>
    {{/let}}
    {{#let (useDebouncedValue this.source wait=20) as |value|}}
      {{captureDerived value}}<output id="derived">{{value.value}}</output>
    {{/let}}
    {{#let (useQueuedState this.execute started=false) as |value|}}
      {{captureQueue value}}<output id="items">{{value.state.items.length}}</output>
    {{/let}}
  </template>
}
module('helper composition', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => { await clearRender(); calls = [] })
  test('renders scheduled values and queue state and cancels callbacks on destruction', async (assert) => {
    await render(<template><Fixture /></template>)
    callback('first'); callback('last')
    state.setValue(previous => previous + 2)
    component.source = 'second'
    queue.addItem('queued')
    await settled()
    derived.utility.flush(); state.utility.flush()
    await new Promise(resolve => setTimeout(resolve, 30)); await settled()
    assert.dom('#state').hasText('3')
    assert.dom('#derived').hasText('second')
    assert.dom('#items').hasText('1')
    assert.deepEqual(calls, ['last'])
    queue.start(); await settled()
    assert.deepEqual(calls, ['last', 'queued'])
    assert.dom('#items').hasText('0')
    callback('discard'); await clearRender()
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.deepEqual(calls, ['last', 'queued'])
  })
})
