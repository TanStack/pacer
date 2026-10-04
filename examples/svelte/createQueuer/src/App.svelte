<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createQueuer } from '@tanstack/svelte-pacer'
  let input = $state('hello')
  let wait = $state(200)
  let history = $state<Array<string>>([])
  const utility = createQueuer(
    (value: string) => {
      history = [...history, value]
    },
    () => ({ key: 'createQueuer', wait: wait, started: false }),
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
  <h1>Svelte createQueuer</h1>
  <p>
    Keep each task in order. Start and stop processing without losing pending
    items.
  </p>
  <label>Task <input bind:value={input} /></label><label
    >Wait (ms) <input bind:value={wait} type="number" min="0" /></label
  >
  <div>
    <button onclick={schedule}>Schedule</button><button onclick={burst}
      >Schedule three</button
    ><button onclick={() => utility.start()}>Start queue</button><button
      onclick={() => utility.stop()}>Stop queue</button
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
