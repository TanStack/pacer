import { afterEach, describe, expect, it, vi } from 'vitest'
import { AsyncQueuer } from '../src/async-queuer'
import { Queuer } from '../src/queuer'

interface Options {
  started: false
  initialItems?: Array<number>
  initialState?: {
    items: Array<number>
    itemTimestamps: Array<number>
  }
  getPriority?: (item: number) => number
}

const implementations = [
  {
    name: 'Queuer',
    create: (options: Options) => new Queuer<number>(() => {}, options),
  },
  {
    name: 'AsyncQueuer',
    create: (options: Options) =>
      new AsyncQueuer<number>(async () => {}, options),
  },
]

describe.each(implementations)('$name insertion snapshots', ({ create }) => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    {
      name: 'front',
      position: 'front' as const,
      priority: false,
      item: 3,
      expectedItems: [3, 2, 1],
      expectedTimestamps: [200, 100, 100],
    },
    {
      name: 'back',
      position: 'back' as const,
      priority: false,
      item: 3,
      expectedItems: [2, 1, 3],
      expectedTimestamps: [100, 100, 200],
    },
    {
      name: 'priority middle',
      position: 'back' as const,
      priority: true,
      item: 1.5,
      expectedItems: [2, 1.5, 1],
      expectedTimestamps: [100, 200, 100],
    },
    {
      name: 'priority end',
      position: 'front' as const,
      priority: true,
      item: 0,
      expectedItems: [2, 1, 0],
      expectedTimestamps: [100, 100, 200],
    },
  ])('preserves the previous snapshot after $name insertion', (scenario) => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(100)
    const initialItems = [2, 1]
    const queue = create({
      started: false,
      initialItems,
      ...(scenario.priority ? { getPriority: (item: number) => item } : {}),
    })
    const previous = queue.store.state
    now.mockReturnValue(200)

    expect(queue.addItem(scenario.item, scenario.position)).toBe(true)

    expect(previous.items).toEqual([2, 1])
    expect(previous.itemTimestamps).toEqual([100, 100])
    expect(initialItems).toEqual([2, 1])
    expect(queue.store.state.items).not.toBe(previous.items)
    expect(queue.store.state.itemTimestamps).not.toBe(previous.itemTimestamps)
    expect(queue.store.state.items).toEqual(scenario.expectedItems)
    expect(queue.store.state.itemTimestamps).toEqual(
      scenario.expectedTimestamps,
    )
  })

  it('does not mutate arrays supplied through initialState', () => {
    const initialState = { items: [2, 1], itemTimestamps: [100, 200] }
    const queue = create({ started: false, initialState })
    vi.spyOn(Date, 'now').mockReturnValue(300)

    queue.addItem(3)

    expect(initialState).toEqual({
      items: [2, 1],
      itemTimestamps: [100, 200],
    })
    expect(queue.store.state.items).not.toBe(initialState.items)
    expect(queue.store.state.itemTimestamps).not.toBe(
      initialState.itemTimestamps,
    )
    expect(queue.store.state.items).toEqual([2, 1, 3])
    expect(queue.store.state.itemTimestamps).toEqual([100, 200, 300])
  })
})
