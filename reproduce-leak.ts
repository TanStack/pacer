import { AsyncQueuer } from './packages/pacer/src'

const ROUNDS = 1000
const ITEMS_PER_ROUND = 100

async function main() {
  const queuer = new AsyncQueuer<number>(
    async (item) => item * 2,
    {
      concurrency: 5,
      started: false,
      throwOnError: false,
    },
  )

  console.log(`AsyncQueuer key: ${queuer.key} (should be undefined)`)
  console.log(`Processing ${ROUNDS} rounds x ${ITEMS_PER_ROUND} items = ${ROUNDS * ITEMS_PER_ROUND} total\n`)

  const heapHistory: number[] = []

  for (let round = 0; round < ROUNDS; round++) {
    for (let i = 0; i < ITEMS_PER_ROUND; i++) {
      queuer.addItem(round * ITEMS_PER_ROUND + i + 1)
    }
    queuer.start()

    while (queuer.store.state.items.length > 0 || queuer.store.state.activeItems.length > 0) {
      await new Promise((r) => setTimeout(r, 10))
    }
    queuer.stop()

    global.gc!()
    await new Promise((r) => setTimeout(r, 50))
    global.gc!()

    const heapMB = process.memoryUsage().heapUsed / 1024 / 1024
    heapHistory.push(heapMB)
    console.log(
      `Round ${String(round + 1).padStart(2)}: ` +
      `heap = ${heapMB.toFixed(1)} MB  ` +
      `(items processed so far: ${(round + 1) * ITEMS_PER_ROUND})`,
    )
  }

  const firstHeap = heapHistory[0]!
  const lastHeap = heapHistory[heapHistory.length - 1]!
  const growth = lastHeap - firstHeap

  console.log(`\n--- Summary ---`)
  console.log(`Heap after round  1: ${firstHeap.toFixed(1)} MB`)
  console.log(`Heap after round ${ROUNDS}: ${lastHeap.toFixed(1)} MB`)
  console.log(`Total growth:        ${growth.toFixed(1)} MB`)

  if (growth > 5) {
    console.log(`\nLEAK DETECTED — heap grew ${growth.toFixed(1)} MB over ${ROUNDS * ITEMS_PER_ROUND} items`)
  } else {
    console.log(`\nNo significant leak — heap growth is ${growth.toFixed(1)} MB`)
  }
}

main().catch(console.error)
