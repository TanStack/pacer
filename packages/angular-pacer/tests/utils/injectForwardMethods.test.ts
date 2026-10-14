import { expect, expectTypeOf, it } from 'vitest'
import { methodNames } from '../../src/utils/injectForwardMethods'
import type { MethodMap } from '../../src/utils/injectForwardMethods'

it('requires every method decision and derives only forwarded method keys', () => {
  type Core = {
    execute: (value: string) => string
    setOptions: () => void
    fn: () => void
    key: string
  }
  const decisions = {
    execute: true,
    setOptions: false,
    fn: false,
  } satisfies MethodMap<Core>
  const methods = methodNames(decisions)
  expect(methods).toEqual(['execute'])
  expectTypeOf(methods).toEqualTypeOf<Array<'execute'>>()

  const { execute, ...missingExecute } = decisions
  // @ts-expect-error Every callable core member requires a decision.
  missingExecute satisfies MethodMap<Core>

  type UpdatedCore = Core & { newMethod: () => void }
  // @ts-expect-error A new core method must be explicitly included or excluded.
  decisions satisfies MethodMap<UpdatedCore>

  const invalid: MethodMap<Core> = {
    ...decisions,
    // @ts-expect-error Non-method fields cannot be registered as operations.
    key: true,
  }
  void invalid
  void execute
})
