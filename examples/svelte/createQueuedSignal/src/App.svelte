<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createQueuedSignal } from '@tanstack/svelte-pacer/queuer'

  // Select the pending queue items as reactive state.
  function processItem(item: number) {
    console.log('processing item', item)
  }

  const [queueItems, counterAddItem, counterQueuer] = createQueuedSignal(
    processItem,
    () => ({
      maxSize: 25,
      initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      started: false,
      wait: 1000, // wait 1 second between processing items - wait is optional!
    }),
    (state) => ({ items: state.items }),
  )

  let currentValue = $state(50)

  let queuedValue = $state(50)

  let submittedCount = $state(0)

  const [, searchAddItem, searchQueuer] = createQueuedSignal(
    (item: number) => {
      queuedValue = item
    },
    () => ({
      maxSize: 100,
      started: true,
      wait: 100,
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
    searchAddItem(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createQueuedSignal Example 1</h1>
    <counterQueuer.Subscribe
      selector={(state) => ({
        size: state.size,
        isFull: state.isFull,
        isEmpty: state.isEmpty,
        isIdle: state.isIdle,
        status: state.status,
        executionCount: state.executionCount,
        isRunning: state.isRunning,
      })}
      >{#snippet children({
        size,
        isFull,
        isEmpty,
        isIdle,
        status,
        executionCount,
        isRunning,
      })}<div>Queue Size: {size}</div>
        <div>Queue Max Size: {25}</div>
        <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
        <div>Queue Peek: {queueItems()[0]}</div>
        <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
        <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
        <div>Queuer Status: {status}</div>
        <div>Items Processed: {executionCount}</div>
        <div>Queue Items: {queueItems().join(', ')}</div>
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
        >
          <button
            onclick={() => {
              const nextNumber = queueItems().length
                ? queueItems()[queueItems().length - 1]! + 1
                : 1
              counterAddItem(nextNumber)
            }}
            disabled={isFull}
          >
            Add Number</button
          ><button
            disabled={isEmpty}
            onclick={() => {
              counterQueuer.execute()
            }}
          >
            Process Next</button
          ><button onclick={() => counterQueuer.clear()} disabled={isEmpty}>
            Clear Queue</button
          ><button onclick={() => counterQueuer.reset()} disabled={isEmpty}>
            Reset Queue</button
          ><button onclick={() => counterQueuer.start()} disabled={isRunning}>
            Start Processing</button
          ><button onclick={() => counterQueuer.stop()} disabled={!isRunning}>
            Stop Processing
          </button>
        </div>{/snippet}</counterQueuer.Subscribe
    ><counterQueuer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</counterQueuer.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createQueuedSignal Example 2</h1>
    <div style="margin-bottom: 20px">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          oninput={handleRangeChange}
          style="width: 100%"
        /><span>{currentValue}</span></label
      >
    </div>
    <div style="margin-bottom: 20px">
      <label
        >Queued Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          value={queuedValue}
          disabled
          style="width: 100%"
        /><span>{queuedValue}</span></label
      >
    </div>
    <table>
      <tbody
        ><searchQueuer.Subscribe
          selector={(state) => ({
            size: state.size,
            isFull: state.isFull,
            isEmpty: state.isEmpty,
            isIdle: state.isIdle,
            status: state.status,
            executionCount: state.executionCount,
          })}
          >{#snippet children({
            size,
            isFull,
            isEmpty,
            isIdle,
            status,
            executionCount,
          })}<tr><td>Queue Size:</td><td>{size}</td></tr><tr
              ><td>Queue Full:</td><td>{isFull ? 'Yes' : 'No'}</td></tr
            ><tr><td>Queue Empty:</td><td>{isEmpty ? 'Yes' : 'No'}</td></tr><tr
              ><td>Queue Idle:</td><td>{isIdle ? 'Yes' : 'No'}</td></tr
            ><tr><td>Queuer Status:</td><td>{status}</td></tr><tr
              ><td>Values Submitted:</td><td>{submittedCount}</td></tr
            ><tr><td>Items Processed:</td><td>{executionCount}</td></tr><tr
              ><td>Pending Items:</td><td>{size}</td></tr
            >{/snippet}</searchQueuer.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Queued with 100ms wait time</p>
    </div>
    <searchQueuer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</searchQueuer.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
