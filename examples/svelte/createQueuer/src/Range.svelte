<script lang="ts">
  import { createQueuer } from '@tanstack/svelte-pacer/queuer'

  let currentValue = $state(50)

  let queuedValue = $state(50)

  let submittedCount = $state(1)

  function processItem(item: number) {
    queuedValue = item
  }

  const queuer = createQueuer(processItem, () => ({
    key: 'Range Queue',
    maxSize: 100,
    initialItems: [currentValue],
    wait: 100,
  }))

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
    queuer.addItem(newValue)
  }
</script>

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
      ><queuer.Subscribe
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
            ><td>Queuer Status:</td><td>{isRunning ? 'Running' : 'Stopped'}</td
            ></tr
          ><tr><td>Values Submitted:</td><td>{submittedCount}</td></tr><tr
            ><td>Items Processed:</td><td>{executionCount}</td></tr
          ><tr><td>Pending Items:</td><td>{size}</td></tr
          >{/snippet}</queuer.Subscribe
      ></tbody
    >
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Queued with 100ms wait time</p>
  </div>
  <div><button onclick={() => queuer.flush()}>Flush Queue</button></div>
  <queuer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</queuer.Subscribe
  >
</div>
