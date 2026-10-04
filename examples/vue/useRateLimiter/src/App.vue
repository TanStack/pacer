<script setup lang="ts">
import { PacerDevtoolsPanel } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useRateLimiter } from '@tanstack/vue-pacer'
const input = ref('hello')
const wait = ref(200)
const history = ref<Array<string>>([])
const utility = useRateLimiter(
  (value: string) => {
    history.value = [...history.value, value]
  },
  () => ({ key: 'useRateLimiter', limit: 2, window: wait.value }),
  (state) => state,
)
const state = utility.state
function schedule() {
  void utility.maybeExecute(input.value)
}
function burst() {
  for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input.value} ${i}`)
}
</script>
<template>
  <main>
    <h1>Vue useRateLimiter</h1>
    <p>Accept up to two executions per time window and track rejected calls.</p>
    <label>Task <input v-model="input" /></label
    ><label
      >Wait (ms) <input v-model.number="wait" type="number" min="0"
    /></label>
    <div>
      <button @click="schedule">Schedule</button
      ><button @click="burst">Schedule three</button
      ><button @click="utility.reset()">Reset window</button
      ><button @click="utility.reset()">Reset</button
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
