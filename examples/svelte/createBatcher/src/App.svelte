<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createBatcher } from '@tanstack/svelte-pacer'
  let input = $state('hello')
  let wait = $state(200)
  let history = $state<Array<Array<string>>>([])
  const utility = createBatcher(
    (value: Array<string>) => {
      history = [...history, value]
    },
    () => ({ key: 'createBatcher', wait: wait, maxSize: 3 }),
    (state) => state,
  )
  function schedule() {
    void utility.addItem(input)
  }
  function burst() {
    for (let i = 1; i <= 3; i++) void utility.addItem(`${input} ${i}`)
  }
</script>

<main>
  <h1>Svelte createBatcher</h1>
  <p>
    Collect events into batches of up to three items, or process them after the
    wait period.
  </p>
  <label>Task <input bind:value={input} /></label><label
    >Wait (ms) <input bind:value={wait} type="number" min="0" /></label
  >
  <div>
    <button onclick={schedule}>Schedule</button><button onclick={burst}
      >Schedule three</button
    ><button onclick={() => utility.flush()}>Flush</button><button
      onclick={() => utility.cancel()}>Cancel</button
    ><button onclick={() => (history = [])}>Clear history</button>
  </div>
  <section>
    <h2>Processed results</h2>
    <pre data-testid="history">{JSON.stringify(history, null, 2)}</pre>
  </section>
  <section>
    <h2>Utility state</h2>
    <pre>{JSON.stringify(utility.state, null, 2)}</pre>
  </section>
  <p class="caption">
    Reactive options preserve pending work. Component teardown cleans up the
    utility.
  </p>
</main>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[pacerDevtoolsPlugin()]} />
{/if}
