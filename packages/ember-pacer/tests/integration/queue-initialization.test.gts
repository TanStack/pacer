import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { module, test } from 'qunit'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import {
  useQueuer,
  useQueuedState,
  useAsyncQueuer,
  useAsyncQueuedState,
} from '@tanstack/ember-pacer'
import type { Queuer } from '@tanstack/ember-pacer'

const initialItems = [1, 2]

class SyncFixture extends Component {
  @tracked total = 0
  execute = (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{#let (useQueuer this.execute initialItems=initialItems) as |queue|}}
      <span>{{queue.store.state.executionCount}}</span>
    {{/let}}
  </template>
}

class StateFixture extends Component {
  @tracked total = 0
  execute = (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{#let (useQueuedState this.execute initialItems=initialItems) as |queue|}}
      <span>{{queue.state.items.length}}</span>
    {{/let}}
  </template>
}

class AsyncFixture extends Component {
  @tracked total = 0
  execute = async (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{#let (useAsyncQueuer this.execute initialItems=initialItems) as |queue|}}
      <span>{{queue.store.state.executionCount}}</span>
    {{/let}}
  </template>
}

class AsyncStateFixture extends Component {
  @tracked total = 0
  execute = async (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{#let
      (useAsyncQueuedState this.execute initialItems=initialItems)
      as |queue|
    }}
      <span>{{queue.state.items.length}}</span>
    {{/let}}
  </template>
}

let pausedQueue: Pick<Queuer<number>, 'start' | 'store' | 'options'>
const capture = (queue: typeof pausedQueue) => {
  pausedQueue = queue
  return ''
}
class PausedFixture extends Component {
  @tracked total = 0
  execute = (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{capture
      (useQueuedState this.execute initialItems=initialItems started=false)
    }}
  </template>
}

const restoredState = { items: [4, 5], isRunning: true }
class RestoredFixture extends Component {
  @tracked total = 0
  execute = async (item: number) => {
    this.total += item
  }
  <template>
    <output>{{this.total}}</output>
    {{#let
      (useAsyncQueuer
        this.execute
        initialItems=initialItems
        initialState=restoredState
        started=false
      )
      as |queue|
    }}
      <span>{{queue.store.state.executionCount}}</span>
    {{/let}}
  </template>
}

module('queue initialization', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
  })

  test('processes initial items after rendering in each queue helper', async (assert) => {
    for (const Fixture of [
      SyncFixture,
      StateFixture,
      AsyncFixture,
      AsyncStateFixture,
    ]) {
      await render(<template><Fixture /></template>)
      assert.dom('output').hasText('3')
      await clearRender()
    }
  })
  test('retains stopped initial items until explicitly started', async (assert) => {
    await render(<template><PausedFixture /></template>)
    assert.dom('output').hasText('0')
    assert.deepEqual(pausedQueue.store.state.items, [1, 2])
    assert.false(pausedQueue.store.state.isRunning)
    assert.false(pausedQueue.options.started)
    assert.deepEqual(pausedQueue.options.initialItems, initialItems)
    pausedQueue.start()
    await settled()
    assert.dom('output').hasText('3')
  })

  test('restored items and running state take precedence over initialization options', async (assert) => {
    await render(<template><RestoredFixture /></template>)
    assert.dom('output').hasText('9')
  })
})
