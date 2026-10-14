import {
  EnvironmentInjector,
  createEnvironmentInjector,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it } from 'vitest'
import { injectPendingTasksLifecycle } from '../../src/utils/injectPendingTasksLifecycle'
import { injectTestStability } from './injectTestStability'

it('holds stability only while the source reports pending work', async () => {
  const pending = signal(false)
  const stability = injectTestStability()
  TestBed.runInInjectionContext(() => injectPendingTasksLifecycle(pending))
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)

  pending.set(true)
  TestBed.tick()
  expect(stability.isStable).toBe(false)
  pending.set(false)
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)

  pending.set(true)
  TestBed.tick()
  expect(stability.isStable).toBe(false)
  pending.set(false)
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)
})

it('releases an active task when its injection context is destroyed', async () => {
  const pending = signal(true)
  const stability = injectTestStability()
  const owner = createEnvironmentInjector(
    [],
    TestBed.inject(EnvironmentInjector),
  )
  owner.runInContext(() => injectPendingTasksLifecycle(pending))
  TestBed.tick()
  expect(stability.isStable).toBe(false)
  owner.destroy()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)
})
