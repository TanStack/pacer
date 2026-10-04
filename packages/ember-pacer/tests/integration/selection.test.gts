import { module, test } from 'qunit'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { useDebouncer, useQueuedValue } from '@tanstack/ember-pacer'
import type { EmberDebouncer, EmberQueuedValue } from '@tanstack/ember-pacer'

let utility: EmberDebouncer<() => void, { pending: boolean }>
let queue: EmberQueuedValue<string>
let renders = 0
const execute = () => {}
const selector = (state: { isPending: boolean }) => ({
  pending: state.isPending,
})
const capture = (value: typeof utility) => {
  utility = value
  return ''
}
const captureQueue = (value: typeof queue) => {
  queue = value
  return ''
}
const display = (state: { pending: boolean }) => {
  renders++
  return String(state.pending)
}

module('selected state and initial values', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    renders = 0
  })

  test('skips rendering when unselected utility state changes', async (assert) => {
    await render(
      <template>
        {{#let (useDebouncer execute selector wait=1000) as |instance|}}
          {{capture instance}}
          <output>{{display instance.state}}</output>
        {{/let}}
      </template>,
    )
    const initialRenders = renders
    utility.store.setState((state) => ({ ...state, maybeExecuteCount: 1 }))
    await settled()
    assert.strictEqual(renders, initialRenders)
    utility.store.setState((state) => ({ ...state, isPending: true }))
    await settled()
    assert.dom('output').hasText('true')
    assert.strictEqual(renders, initialRenders + 1)
  })

  test('enqueues the initial derived value just like subsequent inputs', async (assert) => {
    await render(
      <template>
        {{captureQueue (useQueuedValue 'initial' started=false)}}
      </template>,
    )
    assert.deepEqual(queue.utility.store.state.items, ['initial'])
    queue.utility.start()
    await settled()
    assert.strictEqual(queue.utility.store.state.executionCount, 1)
    assert.strictEqual(queue.value, 'initial')
  })
})
