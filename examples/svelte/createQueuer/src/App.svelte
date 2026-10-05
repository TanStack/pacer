<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createQueuer } from '@tanstack/svelte-pacer/queuer'

  // The function that we will be queuing
  function counterProcessItem(item: number) {
    console.log('processing item', item)
  }

  const counterQueuer = createQueuer(counterProcessItem, () => ({
    key: 'Add Number Queue',
    initialItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    maxSize: 25, // optional, defaults to Infinity
    started: false, // optional, defaults to true
    wait: 1000, // wait 1 second between processing items - wait is optional!
  }))

  let currentValue = $state(50)

  let queuedValue = $state(50)

  let submittedCount = $state(1)

  function rangeProcessItem(item: number) {
    queuedValue = item
  }

  const rangeQueuer = createQueuer(rangeProcessItem, () => ({
    key: 'Range Queue',
    maxSize: 100,
    initialItems: [currentValue],
    wait: 100,
  }))

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
    rangeQueuer.addItem(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createQueuer Example 1</h1>
    <counterQueuer.Subscribe
      selector={(state) => ({
        size: state.size,
        isFull: state.isFull,
        isEmpty: state.isEmpty,
        isIdle: state.isIdle,
        isRunning: state.isRunning,
        status: state.status,
        executionCount: state.executionCount,
        items: state.items,
      })}
      >{#snippet children({
        size,
        isFull,
        isEmpty,
        isIdle,
        isRunning,
        status,
        executionCount,
        items,
      })}<div>Queue Size: {size}</div>
        <div>Queue Max Size: {25}</div>
        <div>Queue Full: {isFull ? 'Yes' : 'No'}</div>
        <div>Queue Peek: {items[0]}</div>
        <div>Queue Empty: {isEmpty ? 'Yes' : 'No'}</div>
        <div>Queue Idle: {isIdle ? 'Yes' : 'No'}</div>
        <div>Queuer Status: {status}</div>
        <div>Items Processed: {executionCount}</div>
        <div>Queue Items: {items.join(', ')}</div>
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0"
        >
          <button
            onclick={() => {
              const nextNumber = items.length ? items[items.length - 1]! + 1 : 1
              counterQueuer.addItem(nextNumber)
            }}
            disabled={isFull}
          >
            Add Number</button
          ><button
            disabled={isEmpty}
            onclick={() => {
              const item = counterQueuer.execute()
              console.log('getNextItem item', item)
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
            Stop Processing</button
          ><button onclick={() => counterQueuer.flush()} disabled={isEmpty}>
            Flush Queue
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
    <h1>TanStack Pacer createQueuer Example 2</h1>
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
        ><rangeQueuer.Subscribe
          selector={(state) => ({
            size: state.size,
            isFull: state.isFull,
            isEmpty: state.isEmpty,
            isIdle: state.isIdle,
            isRunning: state.isRunning,
            executionCount: state.executionCount,
          })}
          >{#snippet children({
            size,
            isFull,
            isEmpty,
            isIdle,
            isRunning,
            executionCount,
          })}<tr><td>Queue Size:</td><td>{size}</td></tr><tr
              ><td>Queue Full:</td><td>{isFull ? 'Yes' : 'No'}</td></tr
            ><tr><td>Queue Empty:</td><td>{isEmpty ? 'Yes' : 'No'}</td></tr><tr
              ><td>Queue Idle:</td><td>{isIdle ? 'Yes' : 'No'}</td></tr
            ><tr
              ><td>Queuer Status:</td><td
                >{isRunning ? 'Running' : 'Stopped'}</td
              ></tr
            ><tr><td>Values Submitted:</td><td>{submittedCount}</td></tr><tr
              ><td>Items Processed:</td><td>{executionCount}</td></tr
            ><tr><td>Pending Items:</td><td>{size}</td></tr
            >{/snippet}</rangeQueuer.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Queued with 100ms wait time</p>
    </div>
    <div><button onclick={() => rangeQueuer.flush()}>Flush Queue</button></div>
    <rangeQueuer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</rangeQueuer.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
