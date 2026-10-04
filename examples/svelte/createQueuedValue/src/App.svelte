<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createQueuedValue } from '@tanstack/svelte-pacer/queuer'

  let instantSearchValue = $state('')

  const [value, counterQueuer] = createQueuedValue(
    () => instantSearchValue,
    () => ({
      maxSize: 25,
      wait: 500, // wait 500ms between processing value changes
    }),
  )

  let currentValue = $state(50)

  let submittedCount = $state(1)

  const [queuedValue, searchQueuer] = createQueuedValue(
    () => currentValue,
    () => ({
      maxSize: 100,
      wait: 100,
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createQueuedValue Example 1</h1>
    <div>Current Value: {value()}</div>
    <hr />
    <counterQueuer.Subscribe
      selector={(state) => ({
        items: state.items,
        size: state.size,
        isFull: state.isFull,
        isEmpty: state.isEmpty,
        isIdle: state.isIdle,
        status: state.status,
        executionCount: state.executionCount,
        isRunning: state.isRunning,
      })}
      >{#snippet children({
        items,
        size,
        isFull,
        isEmpty,
        isIdle,
        status,
        executionCount,
        isRunning,
      })}<div>Queue Size: {size}</div>
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
          <input
            type="search"
            value={instantSearchValue}
            oninput={(e) => {
              instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search value
            }}
            placeholder="Enter search term..."
            disabled={isFull}
          /><button
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
    >
    <pre style="margin-top: 20px"><counterQueuer.Subscribe
        selector={(state) => state}
        >{#snippet children(state)}{JSON.stringify(
            state,
            null,
            2,
          )}{/snippet}</counterQueuer.Subscribe
      ></pre>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createQueuedValue Example 2</h1>
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
          value={queuedValue()}
          disabled
          style="width: 100%"
        /><span>{queuedValue()}</span></label
      >
    </div>
    <searchQueuer.Subscribe
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
      })}<table>
          <tbody
            ><tr><td>Queue Size:</td><td>{size}</td></tr><tr
              ><td>Queue Full:</td><td>{isFull ? 'Yes' : 'No'}</td></tr
            ><tr><td>Queue Empty:</td><td>{isEmpty ? 'Yes' : 'No'}</td></tr><tr
              ><td>Queue Idle:</td><td>{isIdle ? 'Yes' : 'No'}</td></tr
            ><tr><td>Queuer Status:</td><td>{status}</td></tr><tr
              ><td>Values Submitted:</td><td>{submittedCount}</td></tr
            ><tr><td>Items Processed:</td><td>{executionCount}</td></tr><tr
              ><td>Pending Items:</td><td>{size}</td></tr
            ></tbody
          >
        </table>
        <div style="color: #666; font-size: 0.9em">
          <p>Queued with 100ms wait time</p>
        </div>{/snippet}</searchQueuer.Subscribe
    >
    <pre style="margin-top: 20px"><searchQueuer.Subscribe
        selector={(state) => state}
        >{#snippet children(state)}{JSON.stringify(
            state,
            null,
            2,
          )}{/snippet}</searchQueuer.Subscribe
      ></pre>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
