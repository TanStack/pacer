<script setup lang="ts">
import { PacerDevtoolsPanel } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncQueuer } from '@tanstack/vue-pacer'
const input = ref('hello')
const wait = ref(200)
const history = ref<Array<string>>([])
const utility = useAsyncQueuer(
  async (value: string) => {
    history.value = [...history.value, value]
  },
  () => ({ key: 'useAsyncQueuer', wait: wait.value, started: false }),
  (state) => state,
)
const state = utility.state
function schedule() {
  void utility.addItem(input.value)
}
function burst() {
  for (let i = 1; i <= 3; i++) void utility.addItem(`${input.value} ${i}`)
}
</script>
<template>
  <main>
    <h1>Vue useAsyncQueuer</h1>
    <p>
      Keep each task in order. Start and stop processing without losing pending
      items.
    </p>
    <label>Task <input v-model="input" /></label
    ><label
      >Wait (ms) <input v-model.number="wait" type="number" min="0"
    /></label>
    <div>
      <button @click="schedule">Schedule</button
      ><button @click="burst">Schedule three</button
      ><button @click="utility.start()">Start queue</button
      ><button @click="utility.stop()">Stop queue</button
      ><button @click="history = []">Clear history</button>
    </div>
    <section>
      <h2>Processed results</h2>
      <pre data-testid="history">{{ JSON.stringify(history, null, 2) }}</pre>
    </section>
    <section>
      <h2>Utility state</h2>
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </section>
    <p class="caption">
      Change the wait while work is pending to update options on the same
      instance. Removing this component cleans up its utility.
    </p>
  </main>
  <section style="height: 400px"><PacerDevtoolsPanel /></section>
</template>
