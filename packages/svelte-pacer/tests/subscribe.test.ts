import { flushSync, mount, unmount } from 'svelte'
import { expect, it, vi } from 'vitest'
import Fixture from './Subscribe.svelte'
import type { DebouncerState, SvelteDebouncer } from '../src'
import { source } from './source.svelte'

it('owns child subscriptions and skips unrelated selected state updates', async () => {
  let utility!: SvelteDebouncer<() => void>
  const report = vi.fn((pending: boolean) => String(pending))
  const target = document.createElement('div')
  document.body.append(target)
  const component = mount(Fixture, {
    target,
    props: {
      capture: (value: SvelteDebouncer<() => void>) => {
        utility = value
      },
      report,
    },
  })
  try {
    flushSync()
    expect(target.querySelector('output')?.textContent).toBe('false')
    utility.maybeExecute()
    flushSync()
    expect(target.querySelector('output')?.textContent).toBe('true')
    expect(utility.state).toEqual({})
    const renders = report.mock.calls.length
    utility.maybeExecute()
    flushSync()
    expect(report).toHaveBeenCalledTimes(renders)
    target.querySelector('button')!.click()
    flushSync()
    utility.cancel()
    flushSync()
    expect(report).toHaveBeenCalledTimes(renders)
  } finally {
    await unmount(component)
    target.remove()
  }
})

it('tracks new child selector dependencies when a store update changes its branch', async () => {
  const first = source(false)
  const second = source(false)
  let utility!: SvelteDebouncer<() => void>
  const target = document.createElement('div')
  document.body.append(target)
  const component = mount(Fixture, {
    target,
    props: {
      capture: (value: SvelteDebouncer<() => void>) => {
        utility = value
      },
      report: String,
      selector: (state: DebouncerState<() => void>) => ({
        pending: state.executionCount === 0 ? first.get() : second.get(),
      }),
    },
  })
  try {
    flushSync()
    utility.store.setState((state) => ({ ...state, executionCount: 1 }))
    flushSync()
    expect(target.querySelector('output')?.textContent).toBe('false')
    second.set(true)
    flushSync()
    expect(target.querySelector('output')?.textContent).toBe('true')
    expect(utility.state).toEqual({})
  } finally {
    await unmount(component)
    target.remove()
  }
})
