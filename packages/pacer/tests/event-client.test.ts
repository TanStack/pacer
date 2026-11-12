import { afterEach, describe, expect, it, vi } from 'vitest'
import { Throttler } from '../src/throttler'
import { getPacerDevtoolsInstance, pacerEventClient } from '../src/event-client'

describe('pacer devtools event client', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('should register, emit a cloned payload and subscribe in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const emit = vi.spyOn(pacerEventClient, 'emit')
    const on = vi.spyOn(pacerEventClient, 'on')

    const throttler = new Throttler(() => {}, { wait: 100, key: 'dev-key' })

    expect(getPacerDevtoolsInstance('dev-key')).toBe(throttler)
    expect(on).toHaveBeenCalledWith('d-Throttler', expect.any(Function))
    expect(emit).toHaveBeenCalledWith('Throttler', {
      key: 'dev-key',
      store: { state: throttler.store.state },
      options: expect.objectContaining({ wait: 100, key: 'dev-key' }),
    })
    const payload = emit.mock.lastCall![1]
    expect(payload.store.state).not.toBe(throttler.store.state)
  })

  it('should not register, clone, emit or subscribe outside development', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const emit = vi.spyOn(pacerEventClient, 'emit')
    const on = vi.spyOn(pacerEventClient, 'on')
    const stringify = vi.spyOn(JSON, 'stringify')

    const throttler = new Throttler(() => {}, { wait: 100, key: 'prod-key' })
    throttler.maybeExecute()

    expect(getPacerDevtoolsInstance('prod-key')).toBeUndefined()
    expect(emit).not.toHaveBeenCalled()
    expect(on).not.toHaveBeenCalled()
    expect(stringify).not.toHaveBeenCalled()
  })
})
