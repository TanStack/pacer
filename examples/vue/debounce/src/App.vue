<template>
  <div class="container">
    <h1>Vue Debouncing Examples</h1>

    <!-- Basic Debouncing -->
    <section>
      <h2>Basic Debouncing with useDebouncedValue (500ms delay)</h2>
      <div class="example-box">
        <div class="input-group">
          <label>Type here:</label>
          <input 
            v-model="searchQuery" 
            placeholder="Start typing..." 
            class="input-field"
          />
        </div>
        <div class="values">
          <p><strong>Instant value:</strong> {{ searchQuery }}</p>
          <p><strong>Debounced value:</strong> {{ debouncedQuery }}</p>
          <p><strong>Update count:</strong> {{ updateCount }}</p>
          <p><strong>Time since last update:</strong> {{ timeSinceUpdate }}ms</p>
        </div>
      </div>
    </section>

    <!-- Advanced Debouncing with Controls -->
    <section>
      <h2>Advanced Debouncing with useDebouncer (1000ms delay)</h2>
      <div class="example-box">
        <div class="input-group">
          <label>Controlled input:</label>
          <input 
            v-model="controlledValue" 
            placeholder="Type and use controls below..." 
            class="input-field"
          />
        </div>
        <div class="controls">
          <button 
            @click="cancelControlled()"
            :disabled="!controlledIsPending"
          >
            Cancel Update
          </button>
          <button 
            @click="flushControlled()"
            :disabled="!controlledIsPending"
          >
            Update Now
          </button>
          <button @click="toggleEnabled">{{ isEnabled ? 'Disable' : 'Enable' }}</button>
          <button @click="toggleLeading">{{ isLeading ? 'Disable Leading' : 'Enable Leading' }}</button>
          <button @click="resetControlled">Reset</button>
        </div>
        <div class="values">
          <p><strong>Instant value:</strong> {{ controlledValue }}</p>
          <p><strong>Debounced value:</strong> {{ debouncedControlled }}</p>
          <p><strong>Status:</strong> {{ controlledIsPending ? 'Update Pending...' : 'Up to date' }}</p>
          <p><strong>Execution count:</strong> {{ controlledExecutionCount }}</p>
          <p><strong>Leading edge:</strong> {{ isLeading ? 'Enabled' : 'Disabled' }}</p>
          <p><strong>Debouncer:</strong> {{ isEnabled ? 'Enabled' : 'Disabled' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebouncedValue, useDebouncer } from '@tanstack/vue-pacer'

// Basic debouncing example
const searchQuery = ref('')
const updateCount = ref(0)
const lastUpdateTime = ref(Date.now())

const { value: debouncedQuery } = useDebouncedValue(searchQuery, {
  wait: 500,
})

// Compute time since last update
const timeSinceUpdate = computed(() => {
  return Date.now() - lastUpdateTime.value
})

// Watch for debounced updates
watch(debouncedQuery, () => {
  updateCount.value++
  lastUpdateTime.value = Date.now()
})

// Advanced debouncing example
const controlledValue = ref('')
const isEnabled = ref(true)
const isLeading = ref(false)

// Toggle functions
const toggleEnabled = () => {
  isEnabled.value = !isEnabled.value
  setControlledOptions({ enabled: isEnabled.value })
}

const toggleLeading = () => {
  isLeading.value = !isLeading.value
  setControlledOptions({ leading: isLeading.value })
}
const { 
  value: debouncedControlled, 
  executionCount: controlledExecutionCount,
  isPending: controlledIsPending,
  setOptions: setControlledOptions,
  cancel: cancelControlled,
  flush: flushControlled
} = useDebouncer(
  controlledValue,
  {
    wait: 1000,
    leading: false,  // Don't execute on first call
    trailing: true,  // Execute after wait period
    enabled: true,   // Start enabled
  },
)

// Reset both value and pending state
const resetControlled = () => {
  cancelControlled()
  controlledValue.value = ''
}
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  color: #34495e;
  margin-bottom: 1rem;
}

.example-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.values {
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.values p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #2980b9;
}
</style>
